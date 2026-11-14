'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {
  resolveGeminiModel,
  buildGeminiPayload,
  extractStructuredJsonFromGeminiResponse,
  mapGeminiErrorToFriendlyMessage,
  normalizeAnalysisResult
} = require('./public/shared.js');

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 75000;

function loadDotEnv(envFilePath) {
  try {
    if (!fs.existsSync(envFilePath)) return;
    const raw = fs.readFileSync(envFilePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore .env read errors silently
  }
}

loadDotEnv(path.join(__dirname, '.env'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const MAX_BODY_BYTES = 14 * 1024 * 1024; // ~14 MB to allow base64 mobile screenshots
const ALLOWED_IMAGE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif'
]);

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function readRequestBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(Object.assign(new Error('Screenshot or message is too large (max 10 MB).'), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

function createRequestHandler(options = {}) {
  const fetchImpl = options.fetchImpl || global.fetch;
  const env = options.env || process.env;
  const publicDir = path.join(__dirname, 'public');

  return async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      const pathname = url.pathname;

      if (req.method === 'GET' && pathname === '/api/config') {
        const serverKey = (env.GEMINI_API_KEY || '').trim();
        const model = resolveGeminiModel(env.GEMINI_MODEL);
        return sendJson(res, 200, {
          hasServerKey: Boolean(serverKey),
          model
        });
      }

      if (req.method === 'POST' && pathname === '/api/check') {
        const headerKey = typeof req.headers['x-gemini-api-key'] === 'string'
          ? req.headers['x-gemini-api-key'].trim()
          : '';
        const apiKey = headerKey || (env.GEMINI_API_KEY || '').trim();

        if (!apiKey) {
          return sendJson(res, 400, {
            error: 'A Gemini API key is required. Enter your Gemini API key above or set GEMINI_API_KEY in .env.'
          });
        }

        const rawBody = await readRequestBody(req, MAX_BODY_BYTES);
        let body;
        try {
          body = JSON.parse(rawBody || '{}');
        } catch {
          return sendJson(res, 400, { error: 'Invalid JSON request body.' });
        }

        const text = typeof body.text === 'string' ? body.text : '';
        const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
        const imageMimeType = typeof body.imageMimeType === 'string' ? body.imageMimeType.trim() : '';
        const qrText = typeof body.qrText === 'string' ? body.qrText.trim().slice(0, 2000) : '';

        if (!text.trim() && !imageBase64) {
          return sendJson(res, 400, {
            error: 'Please paste a message or upload a screenshot before checking.'
          });
        }

        if (imageBase64 && !ALLOWED_IMAGE_MIMES.has(imageMimeType)) {
          return sendJson(res, 400, {
            error: 'Unsupported image format. Please upload a PNG, JPEG, or WebP screenshot.'
          });
        }

        const model = resolveGeminiModel(env.GEMINI_MODEL);
        const geminiPayload = buildGeminiPayload({
          text,
          imageBase64: imageBase64 || null,
          imageMimeType: imageMimeType || null,
          model,
          qrText
        });

        // Try the main model first; if Gemini is overloaded (429/503/timeout), fall back once.
        const fallbackModel = resolveGeminiModel(env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash');
        const modelsToTry = fallbackModel && fallbackModel !== model ? [model, fallbackModel] : [model];
        let geminiRes = null;
        let geminiData = null;
        let timedOut = false;
        for (const tryModel of modelsToTry) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(tryModel)}:generateContent`;
          const abort = new AbortController();
          const timer = setTimeout(() => abort.abort(), GEMINI_TIMEOUT_MS);
          timedOut = false;
          try {
            geminiRes = await fetchImpl(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
              },
              body: JSON.stringify(tryModel === model ? geminiPayload : buildGeminiPayload({
                text,
                imageBase64: imageBase64 || null,
                imageMimeType: imageMimeType || null,
                model: tryModel,
                qrText
              })),
              signal: abort.signal
            });
            geminiData = await geminiRes.json().catch(() => null);
          } catch (netErr) {
            clearTimeout(timer);
            if (abort.signal.aborted) {
              timedOut = true;
              continue;
            }
            return sendJson(res, 502, {
              error: mapGeminiErrorToFriendlyMessage(0, netErr)
            });
          }
          clearTimeout(timer);
          if (geminiRes.ok || ![429, 500, 503].includes(geminiRes.status)) break;
          console.error(`Gemini ${tryModel} busy (HTTP ${geminiRes.status}); trying fallback if available`);
        }

        if (timedOut || !geminiRes) {
          return sendJson(res, 504, {
            error: 'Gemini is very busy right now and did not answer in time. Please try again in a minute, or tap a sample message for an instant demo result.'
          });
        }

        if (!geminiRes.ok) {
          return sendJson(
            res,
            geminiRes.status >= 400 && geminiRes.status < 600 ? geminiRes.status : 502,
            {
              error: mapGeminiErrorToFriendlyMessage(geminiRes.status, geminiData)
            }
          );
        }

        let parsed;
        try {
          parsed = extractStructuredJsonFromGeminiResponse(geminiData);
        } catch (parseErr) {
          return sendJson(res, 502, {
            error: mapGeminiErrorToFriendlyMessage(502, parseErr)
          });
        }

        const normalized = normalizeAnalysisResult(parsed, text);
        return sendJson(res, 200, normalized);
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendJson(res, 405, { error: 'Method not allowed.' });
      }

      const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const resolvedPath = path.resolve(publicDir, relPath);
      if (!resolvedPath.startsWith(publicDir + path.sep) && resolvedPath !== path.join(publicDir, 'index.html')) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(resolvedPath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(content);
      }
    } catch (err) {
      const status = err && err.statusCode ? err.statusCode : 500;
      sendJson(res, status, {
        error: status === 413 ? err.message : 'Unable to complete the check right now. Please try again.'
      });
    }
  };
}

function createAppServer(options = {}) {
  return http.createServer(createRequestHandler(options));
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = createAppServer();
  server.listen(port, () => {
    console.log(`Semak Dulu running at http://localhost:${port}`);
  });
}

module.exports = { createAppServer, createRequestHandler };
