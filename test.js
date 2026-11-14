'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const Shared = require('./public/shared.js');
const { createRequestHandler } = require('./server.js');

function invokeHandler(handler, { method = 'GET', url = '/', headers = {}, body = '' } = {}) {
  return new Promise((resolve, reject) => {
    const req = Readable.from(body ? [Buffer.from(body, 'utf8')] : []);
    req.method = method;
    req.url = url;
    req.headers = headers;

    const chunks = [];
    const res = {
      statusCode: 200,
      headers: {},
      writeHead(status, hdrs = {}) {
        this.statusCode = status;
        this.headers = { ...this.headers, ...hdrs };
      },
      end(chunk) {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), 'utf8'));
        }
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: this.statusCode,
          headers: this.headers,
          text: () => raw,
          json: () => JSON.parse(raw)
        });
      }
    };

    Promise.resolve(handler(req, res)).catch(reject);
  });
}

test('Structured JSON schema enforces exact verdicts, categories, and fields', () => {
  assert.deepEqual(Shared.ALLOWED_VERDICTS, [
    'High risk',
    'Suspicious',
    'No warning signs found – still verify'
  ]);

  assert.deepEqual(Shared.ALLOWED_CATEGORIES, [
    'urgency/threat',
    'asks for password/OTP/card details',
    'suspicious link',
    'asks to move to another app',
    'asks for remote access or payment',
    'too-good-to-be-true offer',
    'impersonation',
    'visual cue'
  ]);

  assert.deepEqual(Shared.ALLOWED_LANGUAGES, [
    'English',
    'Bahasa Malaysia',
    'Chinese',
    'Manglish'
  ]);

  for (const verdict of Shared.ALLOWED_VERDICTS) {
    assert.equal(/\bsafe\b/i.test(verdict), false, 'Verdict must never say "safe"');
  }
});

test('buildGeminiPayload constructs structured JSON output payload for text and image', () => {
  const textPayload = Shared.buildGeminiPayload({
    text: 'Please share your 6-digit OTP immediately.'
  });
  assert.equal(textPayload.generationConfig.responseMimeType, 'application/json');
  assert.equal(textPayload.generationConfig.responseSchema, Shared.RESPONSE_SCHEMA);
  assert.equal(textPayload.contents[0].parts.length, 1);

  const imagePayload = Shared.buildGeminiPayload({
    text: '',
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    imageMimeType: 'image/png'
  });
  assert.equal(imagePayload.contents[0].parts.length, 2);
  assert.equal(imagePayload.contents[0].parts[0].inlineData.mimeType, 'image/png');

  assert.throws(() => Shared.buildGeminiPayload({ text: '   ' }));
});

test('normalizeAnalysisResult sanitizes verdicts, never says safe, and guarantees mandatory safe_steps', () => {
  const normalized = Shared.normalizeAnalysisResult(
    {
      detected_language: 'Manglish',
      verdict: 'Safe',
      verdict_localized: 'Safe',
      summary: 'This message looks totally safe.',
      transcribed_text: '',
      flags: [],
      what_real_support_never_does: ['Only one bullet returned by model'],
      safe_steps: ['Just click the link']
    },
    'Hi there, ticket closed.'
  );

  assert.equal(normalized.verdict, 'No warning signs found – still verify');
  assert.equal(/\bsafe\b/i.test(normalized.verdict), false);
  assert.equal(/\bsafe\b/i.test(normalized.verdict_localized), false);
  assert.equal(/\btotally safe\b/i.test(normalized.summary), false);
  assert.ok(
    normalized.what_real_support_never_does.length >= 2 &&
      normalized.what_real_support_never_does.length <= 3
  );
  assert.equal(normalized.safe_steps.length, 4);
  const stepsJoined = normalized.safe_steps.join(' ').toLowerCase();
  assert.match(stepsJoined, /link/);
  assert.match(stepsJoined, /reply/);
  assert.match(stepsJoined, /official/);
  assert.match(stepsJoined, /support/);
  assert.match(stepsJoined, /password/);
  assert.match(stepsJoined, /otp/);
});

test('segmentMessageWithHighlights highlights exact, multiline, and Chinese phrases accurately', () => {
  const message =
    'Urgent! Tap http://fake-trade.top/login and reply with your\n6-digit OTP code immediately.';
  const flags = [
    {
      exact_phrase: 'http://fake-trade.top/login',
      category: 'suspicious link',
      plain_reason: 'Unofficial domain.'
    },
    {
      exact_phrase: 'reply with your 6-digit OTP code',
      category: 'asks for password/OTP/card details',
      plain_reason: 'Real support never asks for OTPs.'
    }
  ];

  const { segments, unmatchedFlags } = Shared.segmentMessageWithHighlights(message, flags);
  assert.equal(unmatchedFlags.length, 0);
  const highlights = segments.filter((s) => s.type === 'highlight');
  assert.equal(highlights.length, 2);
  assert.equal(highlights[0].text, 'http://fake-trade.top/login');
  assert.equal(highlights[1].text, 'reply with your\n6-digit OTP code');

  // CJK line-wrapped screenshot text
  const zhMsg = '您的账户将在15分钟内被永久\n冻结，请立即回复OTP验证码';
  const zhSeg = Shared.segmentMessageWithHighlights(zhMsg, [
    {
      exact_phrase: '永久冻结',
      category: 'urgency/threat',
      plain_reason: '制造恐慌迫使您匆忙操作。'
    }
  ]);
  assert.equal(zhSeg.segments.filter((s) => s.type === 'highlight').length, 1);
});

test('HTTP server serves UI with required footer and processes /api/check with Gemini structured JSON', async () => {
  let capturedUrl = '';
  let capturedHeaders = null;
  let capturedBody = null;

  const mockFetch = async (url, init) => {
    capturedUrl = url;
    capturedHeaders = init.headers;
    capturedBody = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      detected_language: 'Bahasa Malaysia',
                      verdict: 'High risk',
                      verdict_localized: 'Risiko tinggi',
                      summary: 'Mesej ini mengandungi ugutan pembekuan akaun dan meminta kod OTP.',
                      transcribed_text: '',
                      flags: [
                        {
                          exact_phrase: 'dibekukan dalam 15 minit',
                          category: 'urgency/threat',
                          plain_reason: 'Penipu mencipta panik supaya anda bertindak tergesa-gesa.'
                        },
                        {
                          exact_phrase: 'berikan kod OTP 6 digit',
                          category: 'asks for password/OTP/card details',
                          plain_reason: 'Pihak sokongan sebenar tidak pernah meminta OTP.'
                        }
                      ],
                      what_real_support_never_does: [
                        'Tidak pernah meminta kata laluan atau kod OTP anda.',
                        'Tidak pernah mengugut membekukan akaun dalam masa beberapa minit melalui pautan luar.'
                      ],
                      safe_steps: [
                        'Jangan tekan sebarang pautan atau balas mesej ini.',
                        'Buka aplikasi rasmi atau taip sendiri alamat laman web rasmi.',
                        'Hubungi khidmat pelanggan dari dalam aplikasi rasmi tersebut.',
                        'Jangan sesekali berkongsi kata laluan atau kod OTP.'
                      ]
                    })
                  }
                ]
              }
            }
          ]
        };
      }
    };
  };

  const handler = createRequestHandler({
    fetchImpl: mockFetch,
    env: { GEMINI_API_KEY: 'test-server-key', GEMINI_MODEL: 'gemini-3.8-flash' }
  });

  // 1. Check HTML page & mandatory UI / footer elements
  const htmlRes = await invokeHandler(handler, { method: 'GET', url: '/' });
  assert.equal(htmlRes.status, 200);
  const html = htmlRes.text();
  assert.match(html, /Semak Dulu/);
  assert.match(html, /Check Before You Act/);
  assert.match(html, /Obvious scam/);
  assert.match(html, /Subtle scam/);
  assert.match(html, /Genuine-looking/);
  assert.match(html, /Check message/);
  assert.match(html, /How to check safely/);
  assert.match(html, /<ol id="safeStepsList"/);
  assert.match(
    html,
    /This tool gives guidance, not a guarantee\. Nothing you paste is stored\./
  );

  // 2. Check /api/config
  const cfgRes = await invokeHandler(handler, { method: 'GET', url: '/api/config' });
  const cfg = cfgRes.json();
  assert.equal(cfg.hasServerKey, true);
  assert.equal(cfg.model, 'gemini-3.8-flash');

  // 3. Check /api/check
  const checkRes = await invokeHandler(handler, {
    method: 'POST',
    url: '/api/check',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text: 'Akaun anda akan dibekukan dalam 15 minit! Sila berikan kod OTP 6 digit anda.'
    })
  });
  assert.equal(checkRes.status, 200);
  const data = checkRes.json();

  assert.match(capturedUrl, /gemini-3\.8-flash:generateContent$/);
  assert.equal(capturedHeaders['x-goog-api-key'], 'test-server-key');
  assert.equal(capturedBody.generationConfig.responseMimeType, 'application/json');

  assert.equal(data.verdict, 'High risk');
  assert.equal(data.detected_language, 'Bahasa Malaysia');
  assert.equal(data.flags.length, 2);
  assert.equal(data.safe_steps.length, 4);

  // 4. Reject empty check payload
  const emptyRes = await invokeHandler(handler, {
    method: 'POST',
    url: '/api/check',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: '   ' })
  });
  assert.equal(emptyRes.status, 400);
});
