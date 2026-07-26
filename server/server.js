const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const db = require('./db');

const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, '..');
const publicPrefixes = ['/css/', '/js/'];
const publicFiles = new Set(['/', '/index.html']);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function cleanText(value) {
  return String(value || '').trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 100_000) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

function validateEnquiry(payload) {
  const name = cleanText(payload.name);
  const email = cleanText(payload.email).toLowerCase();
  const course = cleanText(payload.course);
  const message = cleanText(payload.message);
  const errors = {};

  if (name.length < 2) {
    errors.name = 'Please enter at least 2 characters.';
  }

  if (!validateEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!course) {
    errors.course = 'Choose an interested course.';
  } else if (!db.findCourse(course)) {
    errors.course = 'Choose a valid course.';
  }

  if (message.length < 10) {
    errors.message = 'Please enter at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: { name, email, course, message }
  };
}

function serveStatic(request, response, pathname) {
  const decodedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const relativePath = path.normalize(decodedPath).replace(/^[/\\]+/, '');
  const normalizedPathname = `/${relativePath.replace(/\\/g, '/')}`;
  const isPublicAsset = publicFiles.has(pathname) || publicPrefixes.some((prefix) => normalizedPathname.startsWith(prefix));

  if (relativePath.startsWith('..') || !isPublicAsset) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const filePath = path.normalize(path.join(publicDir, relativePath));

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream'
    });
    response.end(content);
  });
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      status: 'ok',
      database: 'connected',
      ...db.getStats()
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/courses') {
    sendJson(response, 200, { courses: db.getCourses() });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/enquiries') {
    try {
      const payload = await parseJsonBody(request);
      const validation = validateEnquiry(payload);

      if (!validation.isValid) {
        sendJson(response, 400, {
          message: 'Please check the highlighted fields.',
          errors: validation.errors
        });
        return;
      }

      const savedEnquiry = db.createEnquiry(validation.data);
      sendJson(response, 201, {
        message: 'Thank you! Your enquiry has been saved successfully.',
        enquiry: savedEnquiry
      });
    } catch (error) {
      sendJson(response, 400, { message: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/enquiries') {
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 25, 1), 100);
    sendJson(response, 200, { enquiries: db.getEnquiries(limit) });
    return;
  }

  sendJson(response, 404, { message: 'API route not found.' });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url);
    return;
  }

  serveStatic(request, response, url.pathname);
});

server.listen(port, () => {
  console.log(`SkillHub server running at http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other server or run this app with PORT=3001 npm start.`);
    process.exit(1);
  }

  throw error;
});
