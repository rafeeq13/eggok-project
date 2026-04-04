const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const MAIN_PORT = parseInt(process.env.PORT, 10) || 3000;
const BACKEND_PORT = MAIN_PORT + 1;
const WEBSITE_PORT = MAIN_PORT + 2;
const ADMIN_PORT = MAIN_PORT + 3;

const ROOT = __dirname;
const NODE = process.execPath;

function log(name, msg) {
  console.log("[" + name + "] " + msg);
}

function startChild(name, scriptFullPath, env) {
  var cwd = path.dirname(scriptFullPath);
  var child = spawn(NODE, [scriptFullPath], {
    cwd: cwd,
    env: Object.assign({}, process.env, env),
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", function(d) { log(name, d.toString().trim()); });
  child.stderr.on("data", function(d) { log(name, d.toString().trim()); });
  child.on("exit", function(code) {
    log(name, "exited (code " + code + "), restarting in 3s...");
    setTimeout(function() { startChild(name, scriptFullPath, env); }, 3000);
  });
  log(name, "started PID=" + child.pid);
  return child;
}

function proxy(req, res, port) {
  var options = {
    hostname: "127.0.0.1",
    port: port,
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: req.headers.host }),
  };
  var proxyReq = http.request(options, function(proxyRes) {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on("error", function() {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Service starting up" }));
  });
  req.pipe(proxyReq);
}

// Start all services with FULL ABSOLUTE paths
startChild("backend",
  path.join(ROOT, "backend", "dist", "main.js"),
  { PORT: String(BACKEND_PORT) }
);

startChild("website",
  path.join(ROOT, "website", ".next", "standalone", "server.js"),
  { PORT: String(WEBSITE_PORT), HOSTNAME: "127.0.0.1" }
);

startChild("admin",
  path.join(ROOT, "admin", ".next", "standalone", "server.js"),
  { PORT: String(ADMIN_PORT), HOSTNAME: "127.0.0.1" }
);

// Gateway
var server = http.createServer(function(req, res) {
  var url = req.url || "/";
  if (url.startsWith("/api/") || url === "/api") return proxy(req, res, BACKEND_PORT);
  if (url.startsWith("/admin")) return proxy(req, res, ADMIN_PORT);
  return proxy(req, res, WEBSITE_PORT);
});

server.listen(MAIN_PORT, "0.0.0.0", function() {
  log("gateway", "running on port " + MAIN_PORT);
});
