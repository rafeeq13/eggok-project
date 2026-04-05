var http = require("http");
var fs = require("fs");
var path = require("path");
var spawn = require("child_process").spawn;

var MAIN_PORT = parseInt(process.env.PORT, 10) || 3000;
var BACKEND_PORT = 9001;
var WEBSITE_PORT = 9002;
var ADMIN_PORT = 9003;
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

function log(n, m) { console.log("[" + n + "] " + m); }

function startChild(name, script, env) {
  var cwd = path.dirname(script);
  var child = spawn(NODE, [script], { cwd: cwd, env: Object.assign({}, process.env, env), stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", function(d) { log(name, d.toString().trim()); });
  child.stderr.on("data", function(d) { log(name, d.toString().trim()); });
  child.on("exit", function(code) { log(name, "exit " + code); setTimeout(function() { startChild(name, script, env); }, 3000); });
  log(name, "started PID=" + child.pid);
}

function proxy(req, res, port) {
  var pr = http.request({ hostname: "127.0.0.1", port: port, path: req.url, method: req.method, headers: req.headers }, function(r) { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
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

startChild("backend", path.join(ROOT, "backend", "dist", "main.js"), { PORT: String(BACKEND_PORT) });
startChild("website", path.join(ROOT, "website", ".next", "standalone", "server.js"), { PORT: String(WEBSITE_PORT), HOSTNAME: "127.0.0.1" });
startChild("admin", path.join(ROOT, "admin", ".next", "standalone", "server.js"), { PORT: String(ADMIN_PORT), HOSTNAME: "127.0.0.1" });

http.createServer(function(req, res) {
  var u = req.url.split("?")[0];

  // Serve static files directly for /_next/static/
  if (u.startsWith("/_next/static/")) {
    var staticPath = u.replace("/_next/static/", "");
    // Try website static first
    var filePath = path.join(STATIC_DIR, staticPath);
    if (fs.existsSync(filePath)) return serveStatic(req, res, filePath);
    // Try admin static
    filePath = path.join(ADMIN_STATIC_DIR, staticPath);
    if (fs.existsSync(filePath)) return serveStatic(req, res, filePath);
  }

  // Serve public files
  if (!u.startsWith("/api") && !u.startsWith("/admin") && !u.startsWith("/_next")) {
    var pubFile = path.join(PUBLIC_DIR, u);
    if (fs.existsSync(pubFile) && fs.statSync(pubFile).isFile()) return serveStatic(req, res, pubFile);
  }

  if (u.startsWith("/api/") || u === "/api") return proxy(req, res, BACKEND_PORT);
  if (u.startsWith("/admin")) return proxy(req, res, ADMIN_PORT);
  proxy(req, res, WEBSITE_PORT);
}).listen(MAIN_PORT, "0.0.0.0", function() { log("gateway", "port " + MAIN_PORT); });
