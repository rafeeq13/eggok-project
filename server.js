var http = require("http");
var fs = require("fs");
var path = require("path");
var net = require("net");
var spawn = require("child_process").spawn;

var MAIN_PORT = parseInt(process.env.PORT, 10) || 3000;
var ROOT = __dirname;
var NODE = process.execPath;

var STATIC_DIR = path.join(ROOT, "website", ".next", "standalone", ".next", "static");
var PUBLIC_DIR = path.join(ROOT, "website", ".next", "standalone", "public");
var ADMIN_STATIC_DIR = path.join(ROOT, "admin", ".next", "standalone", ".next", "static");

var MIME = {
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Find a free port dynamically - no more conflicts
function findFreePort() {
  return new Promise(function(resolve, reject) {
    var server = net.createServer();
    server.listen(0, "127.0.0.1", function() {
      var port = server.address().port;
      server.close(function() { resolve(port); });
    });
    server.on("error", reject);
  });
}

function log(n, m) { console.log("[" + n + "] " + m); }

function startChild(name, script, env) {
  var cwd = path.dirname(script);
  var child = spawn(NODE, [script], { cwd: cwd, env: Object.assign({}, process.env, env), stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", function(d) { log(name, d.toString().trim()); });
  child.stderr.on("data", function(d) { log(name, d.toString().trim()); });
  child.on("exit", function(code) {
    log(name, "exit " + code + ", restarting in 5s");
    // Re-use same port on restart since we own it
    setTimeout(function() { startChild(name, script, env); }, 5000);
  });
  log(name, "started PID=" + child.pid + " on port " + env.PORT);
  return child;
}

function proxy(req, res, port, noCache) {
  var pr = http.request({ hostname: "127.0.0.1", port: port, path: req.url, method: req.method, headers: req.headers }, function(r) {
    var headers = Object.assign({}, r.headers);
    if (noCache) {
      headers["cache-control"] = "no-cache, no-store, must-revalidate";
      delete headers["x-nextjs-cache"];
      delete headers["x-nextjs-prerender"];
      delete headers["x-nextjs-stale-time"];
    }
    res.writeHead(r.statusCode, headers);
    r.pipe(res);
  });
  pr.on("error", function() { res.writeHead(502); res.end("starting"); });
  req.pipe(pr);
}

function serveStatic(req, res, filePath) {
  var ext = path.extname(filePath);
  var mime = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, function(err, data) {
    if (err) return false;
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" });
    res.end(data);
    return true;
  });
  return true;
}

// Start everything with dynamic ports
async function main() {
  var BACKEND_PORT = await findFreePort();
  var WEBSITE_PORT = await findFreePort();
  var ADMIN_PORT = await findFreePort();

  log("gateway", "Ports: backend=" + BACKEND_PORT + " website=" + WEBSITE_PORT + " admin=" + ADMIN_PORT);

  startChild("backend", path.join(ROOT, "backend", "dist", "main.js"), { PORT: String(BACKEND_PORT) });
  startChild("website", path.join(ROOT, "website", ".next", "standalone", "server.js"), { PORT: String(WEBSITE_PORT), HOSTNAME: "127.0.0.1" });
  startChild("admin", path.join(ROOT, "admin", ".next", "standalone", "server.js"), { PORT: String(ADMIN_PORT), HOSTNAME: "127.0.0.1" });

  http.createServer(function(req, res) {
    var u = req.url.split("?")[0];

    if (u.startsWith("/_next/static/")) {
      var staticPath = u.replace("/_next/static/", "");
      var filePath = path.join(STATIC_DIR, staticPath);
      if (fs.existsSync(filePath)) return serveStatic(req, res, filePath);
      filePath = path.join(ADMIN_STATIC_DIR, staticPath);
      if (fs.existsSync(filePath)) return serveStatic(req, res, filePath);
    }

    if (!u.startsWith("/api") && !u.startsWith("/admin") && !u.startsWith("/_next")) {
      var pubFile = path.join(PUBLIC_DIR, u);
      if (fs.existsSync(pubFile) && fs.statSync(pubFile).isFile()) return serveStatic(req, res, pubFile);
    }

    if (u.startsWith("/api/") || u === "/api") return proxy(req, res, BACKEND_PORT, false);
    if (u.startsWith("/admin")) return proxy(req, res, ADMIN_PORT, true);
    proxy(req, res, WEBSITE_PORT, true);
  }).listen(MAIN_PORT, "0.0.0.0", function() { log("gateway", "running on port " + MAIN_PORT); });
}

main().catch(function(e) { console.error("Fatal:", e); process.exit(1); });
