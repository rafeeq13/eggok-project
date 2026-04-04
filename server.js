const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

const MAIN_PORT = parseInt(process.env.PORT, 10) || 3000;
const BACKEND_PORT = MAIN_PORT + 1;
const WEBSITE_PORT = MAIN_PORT + 2;
const ADMIN_PORT = MAIN_PORT + 3;

const ROOT = __dirname;
const NODE = process.execPath;

function log(name, msg) {
  console.log(`[${name}] ${msg}`);
}

// Start a child process
function startChild(name, cwd, script, env) {
  const child = spawn(NODE, [script], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => log(name, d.toString().trim()));
  child.stderr.on('data', (d) => log(name, d.toString().trim()));
  child.on('exit', (code) => {
    log(name, `exited (code ${code}), restarting in 3s...`);
    setTimeout(() => startChild(name, cwd, script, env), 3000);
  });
  log(name, `started PID=${child.pid}`);
  return child;
}

// Wait for a port to be ready
function waitForPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const sock = new net.Socket();
      sock.setTimeout(1000);
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => { sock.destroy(); retry(); });
      sock.once('timeout', () => { sock.destroy(); retry(); });
      sock.connect(port, '127.0.0.1');
    };
    const retry = () => {
      if (Date.now() - start > timeout) return reject(new Error(`Port ${port} timeout`));
      setTimeout(check, 500);
    };
    check();
  });
}

// Proxy a request to a target port
function proxy(req, res, port) {
  const options = {
    hostname: '127.0.0.1',
    port,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: req.headers.host },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Service starting up, please retry' }));
  });

  req.pipe(proxyReq);
}

// Start all services
async function main() {
  // Start backend (NestJS)
  startChild('backend',
    path.join(ROOT, 'backend'),
    'dist/main.js',
    { PORT: String(BACKEND_PORT) }
  );

  // Start website (Next.js)
  const websiteStandalone = path.join(ROOT, 'website', '.next', 'standalone');
  startChild('website',
    websiteStandalone,
    'server.js',
    { PORT: String(WEBSITE_PORT), HOSTNAME: '127.0.0.1' }
  );

  // Start admin (Next.js)
  const adminStandalone = path.join(ROOT, 'admin', '.next', 'standalone');
  startChild('admin',
    adminStandalone,
    'server.js',
    { PORT: String(ADMIN_PORT), HOSTNAME: '127.0.0.1' }
  );

  // Main gateway server
  const server = http.createServer((req, res) => {
    const url = req.url || '/';

    // /api/* -> backend
    if (url.startsWith('/api/') || url === '/api') {
      return proxy(req, res, BACKEND_PORT);
    }

    // /admin* -> admin Next.js
    if (url.startsWith('/admin')) {
      return proxy(req, res, ADMIN_PORT);
    }

    // Everything else -> website Next.js
    return proxy(req, res, WEBSITE_PORT);
  });

  server.listen(MAIN_PORT, '0.0.0.0', () => {
    log('gateway', `running on port ${MAIN_PORT}`);
  });
}

main().catch(console.error);
