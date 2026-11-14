(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SemakShared = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

  function resolveGeminiModel(modelOverride) {
    const raw = typeof modelOverride === 'string' ? modelOverride.trim() : '';
    const cleaned = raw.replace(/^models\//i, '').trim();
    return cleaned || DEFAULT_GEMINI_MODEL;
  }

  const ALLOWED_VERDICTS = [
    'High risk',
    'Suspicious',
    'No warning signs found – still verify'
  ];

  const ALLOWED_CATEGORIES = [
    'urgency/threat',
    'asks for password/OTP/card details',
    'suspicious link',
    'asks to move to another app',
    'asks for remote access or payment',
    'too-good-to-be-true offer',
    'impersonation',
    'visual cue'
  ];

  const ALLOWED_LANGUAGES = [
    'English',
    'Bahasa Malaysia',
    'Chinese',
    'Manglish'
  ];

  const LOCALIZED_DEFAULTS = {
    English: {
      verdicts: {
        'High risk': 'High risk',
        'Suspicious': 'Suspicious',
        'No warning signs found – still verify': 'No warning signs found – still verify'
      },
      ui: {
        detectedLanguageLabel: 'Language',
        originalMessageHeading: 'Message checked',
        tapHint: 'Tap any highlighted phrase to see why it was flagged.',
        noHighlightsNote: 'No specific scam phrases were highlighted in this message, but sender names and screenshots can be faked.',
        visualFlagsHeading: 'Additional warning signs spotted',
        realSupportHeading: 'What real support never does',
        safeStepsHeading: 'How to check safely',
        categoryLabels: {
          'urgency/threat': 'Urgency or threat',
          'asks for password/OTP/card details': 'Asks for password, OTP, or card details',
          'suspicious link': 'Suspicious link',
          'asks to move to another app': 'Asks to move to another app',
          'asks for remote access or payment': 'Asks for remote access or payment',
          'too-good-to-be-true offer': 'Too-good-to-be-true offer',
          'impersonation': 'Impersonation',
          'visual cue': 'Visual cue in screenshot'
        }
      },
      neverDoes: [
        'Never asks for your password, PIN, card CVV, or 6-digit OTP / 2FA code.',
        'Never asks you to install remote-control apps (like AnyDesk or TeamViewer) or pay a fee to unlock withdrawals.',
        'Never pressures you to click external verification links or move support chats to personal WhatsApp or Telegram accounts.'
      ],
      safeSteps: [
        'Do not tap any links, scan QR codes, or reply to the message.',
        'Open the official trading app on your device or type the official website address into your browser yourself.',
        'Contact customer support directly from inside the official app or website to check if they really messaged you.',
        'Never share your passwords, PINs, card details, recovery phrases, or OTP codes with anyone.'
      ]
    },
    'Bahasa Malaysia': {
      verdicts: {
        'High risk': 'Risiko tinggi',
        'Suspicious': 'Mencurigakan',
        'No warning signs found – still verify': 'Tiada tanda amaran ditemui – sila sahkan dahulu'
      },
      ui: {
        detectedLanguageLabel: 'Bahasa dikesan',
        originalMessageHeading: 'Mesej yang disemak',
        tapHint: 'Ketik mana-mana frasa berwarna untuk melihat sebab ia ditandakan.',
        noHighlightsNote: 'Tiada frasa penipuan khusus ditandakan dalam mesej ini, namun nama penghantar masih boleh dipalsukan.',
        visualFlagsHeading: 'Tanda amaran tambahan ditemui',
        realSupportHeading: 'Perkara yang tidak pernah dilakukan khidmat pelanggan sebenar',
        safeStepsHeading: 'Cara menyemak dengan selamat (How to check safely)',
        categoryLabels: {
          'urgency/threat': 'Desakan atau ugutan',
          'asks for password/OTP/card details': 'Minta kata laluan, OTP atau butiran kad',
          'suspicious link': 'Pautan mencurigakan',
          'asks to move to another app': 'Ajak pindah ke aplikasi lain',
          'asks for remote access or payment': 'Minta akses jauh atau bayaran',
          'too-good-to-be-true offer': 'Tawaran terlalu lumayan / tidak masuk akal',
          'impersonation': 'Penyamaran',
          'visual cue': 'Petunjuk visual dalam tangkapan skrin'
        }
      },
      neverDoes: [
        'Tidak pernah meminta kata laluan, PIN, nombor CVV kad, atau kod OTP / TAC anda.',
        'Tidak pernah menyuruh anda memasang aplikasi kawalan jauh (seperti AnyDesk) atau membuat bayaran untuk membuka sekatan pengeluaran.',
        'Tidak pernah mendesak anda menekan pautan luar atau berpindah ke akaun WhatsApp / Telegram peribadi.'
      ],
      safeSteps: [
        'Jangan tekan sebarang pautan atau membalas mesej tersebut.',
        'Buka aplikasi rasmi platform dagangan atau taip sendiri alamat laman web rasmi pada pelayar anda.',
        'Hubungi khidmat pelanggan dari dalam aplikasi atau laman web rasmi tersebut untuk pengesahan.',
        'Jangan sesekali berkongsi kata laluan atau kod OTP / TAC anda dengan sesiapa.'
      ]
    },
    Chinese: {
      verdicts: {
        'High risk': '高风险',
        'Suspicious': '可疑',
        'No warning signs found – still verify': '未发现明显警告迹象 – 仍请核实'
      },
      ui: {
        detectedLanguageLabel: '识别语言',
        originalMessageHeading: '已检查的消息',
        tapHint: '点击任意高亮短语即可查看风险原因。',
        noHighlightsNote: '此消息中未标记出特定诈骗短语，但发送者名称或截图仍可能被伪造，请务必独立核实。',
        visualFlagsHeading: '发现的其他风险迹象',
        realSupportHeading: '正规客服绝不会做的事',
        safeStepsHeading: '如何安全核实 (How to check safely)',
        categoryLabels: {
          'urgency/threat': '制造紧迫感或威胁',
          'asks for password/OTP/card details': '索要密码、OTP验证码或银行卡信息',
          'suspicious link': '可疑链接',
          'asks to move to another app': '要求转移到其他聊天应用',
          'asks for remote access or payment': '要求远程控制或转账付款',
          'too-good-to-be-true offer': '不切实际的高回报承诺',
          'impersonation': '冒充官方人员',
          'visual cue': '截图中的视觉线索'
        }
      },
      neverDoes: [
        '绝不会索要您的登录密码、交易PIN码、银行卡CVV或短信/邮箱OTP验证码。',
        '绝不会要求您安装远程控制软件（如AnyDesk、TeamViewer）或先交“解冻费/保证金”才能提现。',
        '绝不会催促您点击陌生链接，或要求转到私人WhatsApp、Telegram账号处理账户问题。'
      ],
      safeSteps: [
        '不要点击任何链接，也不要回复该消息。',
        '请亲自打开官方交易App，或在浏览器中手动输入官方网站地址。',
        '通过官方App或官网内置的客服渠道联系官方客服进行核实。',
        '绝不向任何人透露您的密码或OTP一次性验证码。'
      ]
    },
    Manglish: {
      verdicts: {
        'High risk': 'High risk – Confirm got major red flags',
        'Suspicious': 'Suspicious – Better double check first',
        'No warning signs found – still verify': 'No warning signs found – still verify first'
      },
      ui: {
        detectedLanguageLabel: 'Language',
        originalMessageHeading: 'Message checked',
        tapHint: 'Tap any highlighted phrase to see why got red flag.',
        noHighlightsNote: 'No obvious scam phrases spotted here, but scammer can still spoof sender name — always check inside official app first.',
        visualFlagsHeading: 'Other warning signs spotted',
        realSupportHeading: 'What real support never does',
        safeStepsHeading: 'How to check safely',
        categoryLabels: {
          'urgency/threat': 'Urgency / rush or threat',
          'asks for password/OTP/card details': 'Asks for password, OTP / TAC, or card details',
          'suspicious link': 'Suspicious link',
          'asks to move to another app': 'Asks to chat on another app',
          'asks for remote access or payment': 'Asks for remote access or payment',
          'too-good-to-be-true offer': 'Too-good-to-be-true offer',
          'impersonation': 'Impersonation / fake officer',
          'visual cue': 'Visual cue in screenshot'
        }
      },
      neverDoes: [
        'Real support will never ask for your password, PIN, card CVV, or 6-digit OTP / TAC code.',
        'Real support will never ask you to install AnyDesk / TeamViewer or transfer money first to "unfreeze" your trading account.',
        'Real support will never rush you on personal WhatsApp or Telegram to tap outside links.'
      ],
      safeSteps: [
        'Do not tap any links or reply to the message.',
        'Open the official trading app yourself, or type the official website address directly in your browser.',
        'Contact customer support from inside the official app or website to double-check.',
        'Never share your passwords or OTP / TAC codes with anyone, even if they say they are staff.'
      ]
    }
  };

  const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
      detected_language: {
        type: 'STRING',
        enum: ALLOWED_LANGUAGES,
        description: 'Detected language of the message: English, Bahasa Malaysia, Chinese, or Manglish.'
      },
      verdict: {
        type: 'STRING',
        enum: ALLOWED_VERDICTS,
        description: 'Must be strictly one of: "High risk", "Suspicious", or "No warning signs found – still verify". Never say "safe".'
      },
      verdict_localized: {
        type: 'STRING',
        description: 'Short verdict label in the detected_language. Never use the word "safe", "selamat", or "安全".'
      },
      summary: {
        type: 'STRING',
        description: '1 to 2 calm, plain-language sentences in detected_language explaining the overall assessment without ever declaring the message "safe".'
      },
      transcribed_text: {
        type: 'STRING',
        description: 'If an image/screenshot was provided, transcribe the full message text verbatim from the image so phrases can be highlighted. Empty string if no image was provided.'
      },
      flags: {
        type: 'ARRAY',
        description: 'Warning signs spotted in the message. Empty array if no warning signs are found.',
        items: {
          type: 'OBJECT',
          properties: {
            exact_phrase: {
              type: 'STRING',
              description: 'Exact verbatim substring copied character-for-character from the message (or transcribed_text) that triggered this warning sign.'
            },
            category: {
              type: 'STRING',
              enum: ALLOWED_CATEGORIES,
              description: 'Warning category.'
            },
            plain_reason: {
              type: 'STRING',
              description: 'Clear, calm 1-2 sentence explanation in detected_language of why this phrase is a scam warning sign.'
            }
          },
          required: ['exact_phrase', 'category', 'plain_reason']
        }
      },
      what_real_support_never_does: {
        type: 'ARRAY',
        description: '2 to 3 short bullet points in detected_language explaining what legitimate online trading support never does.',
        items: { type: 'STRING' }
      },
      safe_steps: {
        type: 'ARRAY',
        description: '4 short numbered steps in detected_language that ALWAYS include: (1) do not tap links or reply; (2) open the official app or type the official website address yourself; (3) contact support from inside it; (4) never share passwords or OTPs.',
        items: { type: 'STRING' }
      }
    },
    required: [
      'detected_language',
      'verdict',
      'verdict_localized',
      'summary',
      'transcribed_text',
      'flags',
      'what_real_support_never_does',
      'safe_steps'
    ]
  };

  const SYSTEM_INSTRUCTION = [
    'You are "Semak Dulu – Check Before You Act", a calm, trustworthy scam-detection assistant protecting customers of online trading and investment platforms.',
    'A customer received a message (pasted text and/or screenshot) from someone claiming to be platform customer support, compliance, account manager, or security.',
    '',
    'CRITICAL RULES:',
    '1. VERDICT: Choose strictly one of:',
    '   - "High risk": Clear scam indicators (asks for password/OTP/TAC/PIN/seed phrase/card details, phishing/lookalike link, requests payment/deposit/fee to unlock funds, asks for AnyDesk/TeamViewer/screen share, fake urgent freeze + external action, guaranteed profit offer).',
    '   - "Suspicious": Subtle social engineering or unusual support behaviour (asks to move chat to WhatsApp/Telegram/WeChat, vague account compliance threat, unverified phone number, subtle impersonation, odd sender handle) even without an explicit link or OTP request yet.',
    '   - "No warning signs found – still verify": Message looks routine (e.g. ticket follow-up directing user to open the official app themselves, no links, no credential/payment/app-switch requests).',
    '   NEVER declare any message "safe", "legitimate", "genuine", "selamat", or "安全". Always remind the user to verify independently.',
    '',
    '2. LANGUAGE DETECTION & RESPONSE:',
    '   Detect the message language among: "English", "Bahasa Malaysia", "Chinese", or "Manglish".',
    '   - Identify "Manglish" when English is mixed with Malaysian slang/particles/Malay/Chinese words such as "lah", "lor", "meh", "boss", "bro", "kena", "cepat", "jangan", "boleh", "akaun", "TAC", "sia", "kan".',
    '   - Write verdict_localized, summary, flags[].plain_reason, what_real_support_never_does, and safe_steps in that SAME detected_language.',
    '   - Keep verdict, detected_language, and flags[].category strictly in their required English enum values.',
    '',
    '3. FLAGS & EXACT PHRASES:',
    '   - If an image screenshot is provided, first extract the full message text verbatim into transcribed_text.',
    '   - Each flag.exact_phrase MUST be an exact, verbatim substring (typically 3 to 15 words) copied character-for-character from the pasted text or transcribed_text so the UI can highlight it accurately.',
    '   - Do not overlap exact_phrase spans unnecessarily; pick the most specific phrases.',
    '   - Classify each flag into one of: "urgency/threat", "asks for password/OTP/card details", "suspicious link", "asks to move to another app", "asks for remote access or payment", "too-good-to-be-true offer", "impersonation", "visual cue".',
    '',
    '4. WHAT REAL SUPPORT NEVER DOES:',
    '   - Return 2 to 3 short, reassuring, plain-language bullets in detected_language tailored to online trading support.',
    '',
    '5. SAFE STEPS (MANDATORY):',
    '   - Return 4 clear steps in detected_language that ALWAYS include all four of these actions in order:',
    '     1) Do not tap links or reply to the message.',
    '     2) Open the official app or type the official website address yourself.',
    '     3) Contact support from inside the official app or website.',
    '     4) Never share passwords or OTPs (or PINs / card details / recovery phrases).',
    '',
    '6. VISUAL CUES (only when a screenshot is provided):',
    '   - Also inspect what the image itself shows: the sender phone number or username, whether a verified/official badge is present or missing, logo quality or a distorted/copied logo, lookalike or misspelled web addresses, and whether the account looks like a personal account rather than an official business account.',
    '   - Add each visual warning sign as a flag with category "visual cue". For these flags, exact_phrase is a short description of what you saw (e.g. "Sender is a personal +60 number with no verified badge"), not a quote.',
    '',
    '7. QR CODES:',
    '   - If the request says a QR code was decoded from the screenshot, treat that destination as part of the message. Flag it as "suspicious link" if it is not an official domain, is a shortened URL, an IP address, or a lookalike domain. Never tell the user to open it.'
  ].join('\n');

  function buildGeminiPayload({ text, imageBase64, imageMimeType, model, qrText }) {
    const resolvedModel = resolveGeminiModel(model);
    const parts = [];
    const cleanText = typeof text === 'string' ? text.trim() : '';

    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      });
    }

    if (cleanText && imageBase64) {
      parts.push({
        text: `Customer pasted message text:\n"""\n${cleanText}\n"""\n\nA screenshot is also attached. Analyze both for trading support scam warning signs. Ensure exact_phrase matches verbatim substrings from the pasted text (or transcribed_text from the screenshot).`
      });
    } else if (cleanText) {
      parts.push({
        text: `Analyze this message claiming to be from online trading support:\n"""\n${cleanText}\n"""`
      });
    } else if (imageBase64) {
      parts.push({
        text: 'Transcribe the message shown in this screenshot verbatim into transcribed_text, then analyze it for online trading support scam warning signs. Every flag exact_phrase must be a verbatim substring of transcribed_text.'
      });
    } else {
      throw new Error('Please paste a message or upload a screenshot to check.');
    }

    const cleanQr = typeof qrText === 'string' ? qrText.trim().slice(0, 2000) : '';
    if (cleanQr) {
      parts.push({
        text: `A QR code was decoded from the screenshot. Its destination is:\n"""\n${cleanQr}\n"""\nAnalyze this destination as part of the message (it was NOT opened).`
      });
    }

    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA
    };

    if (/^gemini-3/i.test(resolvedModel)) {
      generationConfig.thinkingConfig = {
        thinkingLevel: 'LOW',
        includeThoughts: false
      };
    }

    return {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: [
        {
          role: 'user',
          parts
        }
      ],
      generationConfig
    };
  }

  function extractStructuredJsonFromGeminiResponse(geminiData) {
    const parts = geminiData?.candidates?.[0]?.content?.parts;
    const candidateText = Array.isArray(parts)
      ? parts
          .filter((p) => p && !p.thought && typeof p.text === 'string')
          .map((p) => p.text)
          .join('')
          .trim()
      : '';

    if (!candidateText) {
      const blockReason =
        geminiData?.promptFeedback?.blockReason ||
        geminiData?.candidates?.[0]?.finishReason;
      const err = new Error('Empty Gemini response');
      err.code =
        blockReason && /SAFETY|BLOCKLIST|PROHIBITED|RECITATION/i.test(String(blockReason))
          ? 'CONTENT_BLOCKED'
          : 'EMPTY_RESPONSE';
      throw err;
    }

    try {
      return JSON.parse(candidateText);
    } catch {
      const stripped = candidateText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
      try {
        return JSON.parse(stripped);
      } catch {
        const err = new Error('Malformed JSON response');
        err.code = 'MALFORMED_RESPONSE';
        throw err;
      }
    }
  }

  function mapGeminiErrorToFriendlyMessage(status, rawError) {
    const errObj = rawError && typeof rawError === 'object' ? rawError : null;
    const nestedErr = errObj?.error && typeof errObj.error === 'object' ? errObj.error : errObj;

    const code = String(nestedErr?.code || errObj?.code || '');
    const apiStatus = String(nestedErr?.status || '');
    const detailsText = Array.isArray(nestedErr?.details)
      ? JSON.stringify(nestedErr.details)
      : '';
    const rawMsg =
      typeof rawError === 'string'
        ? rawError
        : String(nestedErr?.message || errObj?.message || '');
    const combined = `${apiStatus} ${code} ${rawMsg} ${detailsText}`.toLowerCase();

    if (code === 'CONTENT_BLOCKED') {
      return 'This message could not be analyzed automatically – please treat unexpected support messages with caution and verify inside the official app.';
    }

    if (code === 'EMPTY_RESPONSE' || code === 'MALFORMED_RESPONSE') {
      return 'The AI model returned an incomplete response – please try again.';
    }

    if (
      status === 401 ||
      combined.includes('api_key_invalid') ||
      combined.includes('api key not valid') ||
      combined.includes('invalid api key') ||
      combined.includes('unauthenticated') ||
      (status === 403 && /api[_\s-]?key|permission|credential|unregistered/i.test(combined))
    ) {
      return 'Invalid API key – please check your Gemini API key and try again.';
    }

    if (
      status === 404 ||
      apiStatus.toLowerCase() === 'not_found' ||
      /model.*(not found|no longer available|unavailable|deprecated|not supported|retired)/i.test(combined) ||
      /(no longer available to new users|models\/gemini-)/i.test(combined)
    ) {
      return 'The AI model is unavailable – please try again.';
    }

    if (
      status === 429 ||
      apiStatus.toLowerCase() === 'resource_exhausted' ||
      /quota|rate[_\s-]?limit|too many requests|exhausted/i.test(combined)
    ) {
      return 'Too many requests right now – please wait a moment and try again.';
    }

    if (
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      /overloaded|unavailable|internal error|deadline_exceeded/i.test(combined)
    ) {
      return 'The AI model is unavailable – please try again.';
    }

    if (/failed to fetch|networkerror|enotfound|econnrefused|etimedout|socket/i.test(combined)) {
      return 'Could not connect to the verification service – please check your internet connection and try again.';
    }

    if (status === 400) {
      return 'Could not process this message or screenshot – please check your input and try again.';
    }

    return 'Unable to check this message right now – please try again.';
  }

  function sanitizeNoSafeClaim(str) {
    if (typeof str !== 'string') return '';
    // Replace standalone claims like "This message is safe" while preserving "safely"
    return str
      .replace(/\b(is|looks|appears|seems)\s+(completely\s+|totally\s+|100%\s+)?safe\b/gi, '$1 free of obvious red flags, though you should still verify')
      .replace(/^safe$/i, 'No warning signs found – still verify')
      .trim();
  }

  function normalizeVerdict(rawVerdict, flagsCount) {
    if (typeof rawVerdict === 'string') {
      const normalizedDash = rawVerdict.trim().replace(/[\u2012\u2013\u2014-]+/g, '–').replace(/\s*–\s*/g, ' – ');
      const lower = normalizedDash.toLowerCase();
      if (lower === 'high risk' || lower.includes('high')) {
        return 'High risk';
      }
      if (lower === 'suspicious' || lower.includes('suspicious')) {
        return 'Suspicious';
      }
      if (lower.startsWith('no warning signs found')) {
        return 'No warning signs found – still verify';
      }
    }
    return flagsCount > 0 ? 'Suspicious' : 'No warning signs found – still verify';
  }

  function normalizeCategory(rawCategory) {
    if (typeof rawCategory !== 'string') return 'impersonation';
    const trimmed = rawCategory.trim();
    if (ALLOWED_CATEGORIES.includes(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    if (lower.includes('visual')) return 'visual cue';
    if (lower.includes('urgen') || lower.includes('threat') || lower.includes('freeze')) return 'urgency/threat';
    if (lower.includes('password') || lower.includes('otp') || lower.includes('card') || lower.includes('pin') || lower.includes('tac')) {
      return 'asks for password/OTP/card details';
    }
    if (lower.includes('link') || lower.includes('url') || lower.includes('domain')) return 'suspicious link';
    if (lower.includes('app') || lower.includes('whatsapp') || lower.includes('telegram')) return 'asks to move to another app';
    if (lower.includes('remote') || lower.includes('payment') || lower.includes('fee') || lower.includes('anydesk')) {
      return 'asks for remote access or payment';
    }
    if (lower.includes('offer') || lower.includes('profit') || lower.includes('bonus') || lower.includes('good')) {
      return 'too-good-to-be-true offer';
    }
    return 'impersonation';
  }

  function normalizeLanguage(rawLang) {
    if (typeof rawLang !== 'string') return 'English';
    const trimmed = rawLang.trim();
    if (ALLOWED_LANGUAGES.includes(trimmed)) return trimmed;
    const lower = trimmed.toLowerCase();
    if (lower.includes('manglish')) return 'Manglish';
    if (lower.includes('malay') || lower.includes('bahasa') || lower === 'bm' || lower === 'ms') return 'Bahasa Malaysia';
    if (lower.includes('chin') || lower.includes('mandarin') || lower.includes('zh') || lower.includes('中文')) return 'Chinese';
    return 'English';
  }

  function ensureMandatorySafeSteps(rawSteps, langDefaults) {
    const fallback = langDefaults.safeSteps;
    if (!Array.isArray(rawSteps) || rawSteps.length < 4) {
      return fallback.slice();
    }
    const cleaned = rawSteps
      .map((s) => (typeof s === 'string' ? s.replace(/^\s*\d+[\.\)]\s*/, '').trim() : ''))
      .filter(Boolean);

    if (cleaned.length < 4) {
      return fallback.slice();
    }

    // Verify all 4 required safety actions are explicitly present; otherwise use canonical localized steps
    const joined = cleaned.join(' ').toLowerCase();
    const hasNoTapLinks = /link|pautan|链接|url/i.test(joined);
    const hasNoReply = /reply|balas|回复|respond/i.test(joined);
    const hasOfficialAppOrWeb =
      (/official|rasmi|官方/i.test(joined)) &&
      (/app|aplikasi|website|laman|browser|官网|网址/i.test(joined));
    const hasInsideSupport = /support|khidmat|客服/i.test(joined);
    const hasPasswords = /password|kata laluan|密码/i.test(joined);
    const hasOtps = /otp|tac|验证码|2fa/i.test(joined);

    if (hasNoTapLinks && hasNoReply && hasOfficialAppOrWeb && hasInsideSupport && hasPasswords && hasOtps) {
      return cleaned.slice(0, 6);
    }
    return fallback.slice();
  }

  function normalizeAnalysisResult(raw, inputText) {
    const obj = raw && typeof raw === 'object' ? raw : {};
    const detected_language = normalizeLanguage(obj.detected_language);
    const langDefaults = LOCALIZED_DEFAULTS[detected_language] || LOCALIZED_DEFAULTS.English;

    const rawFlags = Array.isArray(obj.flags) ? obj.flags : [];
    const flags = rawFlags
      .filter((f) => f && typeof f === 'object')
      .map((f) => ({
        exact_phrase: typeof f.exact_phrase === 'string' ? f.exact_phrase.trim() : '',
        category: normalizeCategory(f.category),
        plain_reason: sanitizeNoSafeClaim(typeof f.plain_reason === 'string' ? f.plain_reason.trim() : '')
      }))
      .filter((f) => f.exact_phrase.length > 0 && f.plain_reason.length > 0);

    const verdict = normalizeVerdict(obj.verdict, flags.length);

    let verdict_localized = sanitizeNoSafeClaim(obj.verdict_localized || '');
    if (!verdict_localized || /\bsafe\b/i.test(verdict_localized) || /selamat/i.test(verdict_localized)) {
      verdict_localized = langDefaults.verdicts[verdict];
    }

    const transcribed_text = typeof obj.transcribed_text === 'string' ? obj.transcribed_text.trim() : '';
    const cleanInput = typeof inputText === 'string' ? inputText.trim() : '';

    let display_message = cleanInput;
    if (!display_message && transcribed_text) {
      display_message = transcribed_text;
    } else if (
      display_message &&
      transcribed_text &&
      !display_message.toLowerCase().includes(transcribed_text.slice(0, 24).toLowerCase())
    ) {
      display_message = `${display_message}\n\n[Screenshot text]\n${transcribed_text}`;
    }

    let neverDoes = Array.isArray(obj.what_real_support_never_does)
      ? obj.what_real_support_never_does
          .map((s) => (typeof s === 'string' ? s.replace(/^\s*[-•*]\s*/, '').trim() : ''))
          .filter(Boolean)
      : [];

    if (neverDoes.length < 2) {
      neverDoes = langDefaults.neverDoes.slice(0, 3);
    } else if (neverDoes.length > 3) {
      neverDoes = neverDoes.slice(0, 3);
    }

    const safe_steps = ensureMandatorySafeSteps(obj.safe_steps, langDefaults);

    const summary = sanitizeNoSafeClaim(typeof obj.summary === 'string' ? obj.summary : '');

    return {
      verdict,
      verdict_localized,
      detected_language,
      summary,
      transcribed_text,
      display_message,
      flags,
      what_real_support_never_does: neverDoes,
      safe_steps
    };
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findPhraseRange(haystack, phrase) {
    if (!haystack || !phrase) return null;

    // 1. Exact match
    let idx = haystack.indexOf(phrase);
    if (idx !== -1) {
      return { start: idx, end: idx + phrase.length };
    }

    // 2. Case-insensitive match
    const lowerHaystack = haystack.toLowerCase();
    const lowerPhrase = phrase.toLowerCase();
    idx = lowerHaystack.indexOf(lowerPhrase);
    if (idx !== -1) {
      return { start: idx, end: idx + phrase.length };
    }

    // 3. Flexible whitespace and smart-quote tolerant match
    const tokens = phrase
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((tok) =>
        escapeRegExp(tok)
          .replace(/['’‘]/g, "['’‘]")
          .replace(/["“”]/g, '["“”]')
          .replace(/[-–—]/g, '[-–—]')
      );

    if (tokens.length === 0) return null;
    const pattern = new RegExp(tokens.join('\\s+'), 'i');
    const match = pattern.exec(haystack);
    if (match) {
      return { start: match.index, end: match.index + match[0].length };
    }

    // 4. CJK line-wrap tolerant match when phrase contains Chinese characters
    if (/[\u4e00-\u9fff]/.test(phrase)) {
      const chars = Array.from(phrase.replace(/\s+/g, '')).map(escapeRegExp);
      if (chars.length > 0) {
        const cjkPattern = new RegExp(chars.join('\\s*'), 'i');
        const cjkMatch = cjkPattern.exec(haystack);
        if (cjkMatch) {
          return { start: cjkMatch.index, end: cjkMatch.index + cjkMatch[0].length };
        }
      }
    }

    return null;
  }

  function segmentMessageWithHighlights(messageText, flags) {
    const text = typeof messageText === 'string' ? messageText : '';
    const flagList = Array.isArray(flags) ? flags : [];

    if (!text) {
      return {
        segments: [],
        unmatchedFlags: flagList.map((flag, flagIndex) => ({ flag, flagIndex }))
      };
    }

    const candidates = [];
    const unmatchedFlags = [];

    flagList.forEach((flag, flagIndex) => {
      const range = findPhraseRange(text, flag.exact_phrase);
      if (range && range.end > range.start) {
        candidates.push({
          start: range.start,
          end: range.end,
          flagIndex,
          flag
        });
      } else {
        unmatchedFlags.push({ flag, flagIndex });
      }
    });

    // Sort by earliest start; if tied, prefer longer phrase
    candidates.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    const accepted = [];
    let cursor = 0;
    for (const cand of candidates) {
      if (cand.start >= cursor) {
        accepted.push(cand);
        cursor = cand.end;
      } else {
        // Overlapping highlight: keep it visible in unmatchedFlags so its reason is still accessible if distinct
        const alreadySamePhrase = accepted.some(
          (acc) => acc.start === cand.start && acc.end === cand.end && acc.flag.category === cand.flag.category
        );
        if (!alreadySamePhrase) {
          unmatchedFlags.push({ flag: cand.flag, flagIndex: cand.flagIndex });
        }
      }
    }

    const segments = [];
    let pos = 0;
    for (const item of accepted) {
      if (item.start > pos) {
        segments.push({
          type: 'text',
          text: text.slice(pos, item.start)
        });
      }
      segments.push({
        type: 'highlight',
        text: text.slice(item.start, item.end),
        flagIndex: item.flagIndex,
        flag: item.flag
      });
      pos = item.end;
    }

    if (pos < text.length) {
      segments.push({
        type: 'text',
        text: text.slice(pos)
      });
    }

    return { segments, unmatchedFlags };
  }

  return {
    DEFAULT_GEMINI_MODEL,
    resolveGeminiModel,
    ALLOWED_VERDICTS,
    ALLOWED_CATEGORIES,
    ALLOWED_LANGUAGES,
    LOCALIZED_DEFAULTS,
    RESPONSE_SCHEMA,
    SYSTEM_INSTRUCTION,
    buildGeminiPayload,
    extractStructuredJsonFromGeminiResponse,
    mapGeminiErrorToFriendlyMessage,
    normalizeAnalysisResult,
    segmentMessageWithHighlights,
    findPhraseRange
  };
});
