(function () {
  'use strict';

  const Shared = window.SemakShared;

  const SAMPLE_MESSAGES = {
    English: {
      obvious:
        '[URGENT] Official Trading Security Desk: Unusual withdrawal activity was detected on your trading account! Your wallet will be permanently frozen within 15 minutes unless you verify immediately at http://secure-trade-verify.top/auth and reply here with your login password and 6-digit SMS OTP code. For priority unlock, message our senior officer on Telegram @TradeDesk_VerifyNow.',
      subtle:
        'Hi Daniel, this is Marcus from the Account Compliance team following up on your recent P2P order #88412. To prevent a temporary compliance hold on your withdrawals, could you hop on a quick WhatsApp message at +60 11-3948 2201 or share your screen via AnyDesk so we can re-sync your trading session? No password needed.',
      genuine:
        'Hello, thank you for contacting Customer Support earlier regarding Ticket #492018 (annual tax statement export). Your statement is now ready. You can view and download it anytime by opening the official app and going to Profile > Statements. Please do not reply to this message with passwords or personal details.'
    },
    'Bahasa Malaysia': {
      obvious:
        '[PENTING] Unit Keselamatan Platform Dagangan: Pengeluaran luar biasa dikesan pada akaun anda! Akaun anda akan dibekukan sepenuhnya dalam masa 15 minit kecuali anda sahkan segera di http://semak-akaun-dagang.top/login dan balas mesej ini dengan kata laluan serta kod OTP 6 digit anda. Atau hubungi pegawai kami di Telegram @PegawaiSokonganVIP.',
      subtle:
        'Salam Encik Hafiz, saya Amir daripada bahagian Pematuhan Akaun berkenaan transaksi P2P #88412 sebentar tadi. Bagi mengelakkan gangguan sementara pada pengeluaran anda, boleh kita sambung di WhatsApp +60 11-3948 2201 atau kongsi skrin melalui AnyDesk untuk kemas kini sesi dompet? Tidak perlu beri kata laluan.',
      genuine:
        'Terima kasih kerana menghubungi Khidmat Pelanggan berhubung Tiket #492018 (penyata tahunan akaun). Penyata anda kini sedia untuk dimuat turun. Sila buka aplikasi rasmi sendiri dan pergi ke bahagian Profil > Penyata. Jangan balas mesej ini dengan maklumat sensitif.'
    },
    Chinese: {
      obvious:
        '【紧急通知】交易平台安全中心：系统检测到您的交易账户存在异常提现操作！您的账户资金将在15分钟内被永久冻结，请立即点击 http://trade-safe-check.top/verify 登录并回复您的登录密码及6位短信OTP验证码解除风控，或添加官方专员Telegram @VIP_SupportDesk 优先处理。',
      subtle:
        '您好陈先生，我是平台合规部门专员Jason，跟进您刚才的P2P订单 #88412。为避免您的提现功能被系统暂时限制，方便加一下工作WhatsApp +60 11-3948 2201，或者打开AnyDesk屏幕共享让我们帮您同步一下账户节点吗？不需要提供密码。',
      genuine:
        '您好，感谢您早前就工单 #492018（年度交易账单导出）联系客服团队。您的账单现已生成完毕，您可以随时自行打开官方App，前往“个人中心 > 账单明细”查看并下载。请勿在此回复任何密码或敏感信息。'
    },
    Manglish: {
      obvious:
        'Hello Boss! Urgent from Official Trading Support team here — your trading account kena suspicious login from overseas tau! Within 15 mins system auto freeze your funds unless you cepat tap http://mytrade-tac-check.top/unlock and reply your password + 6-digit TAC / OTP code now. Anything fast-fast PM our officer on Telegram @BossSupport_MY lah!',
      subtle:
        'Hi bro, Sarah here from Trading Compliance team checking on your P2P trade #88412 just now. Later takut your withdrawal kena hold by system lah, can you WhatsApp me quick at +60 11-3948 2201 or install AnyDesk share screen 2 mins so I help you refresh wallet sync? No need password one.',
      genuine:
        'Hi there, thanks for contacting Customer Support earlier about Ticket #492018 (statement download). Your PDF statement settle already. Whenever free, just open the official trading app yourself and check under Profile > Statements. Remember don’t reply with password or TAC ya.'
    }
  };

  const VERDICT_ICONS = {
    'High risk':
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    Suspicious:
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    'No warning signs found – still verify':
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  // DOM Elements
  const apiKeySection = document.getElementById('apiKeySection');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleKeyBtn = document.getElementById('toggleKeyBtn');

  const langPills = Array.from(document.querySelectorAll('.lang-pill'));
  const sampleButtons = Array.from(document.querySelectorAll('.sample-btn'));

  const checkForm = document.getElementById('checkForm');
  const messageInput = document.getElementById('messageInput');
  const clearTextBtn = document.getElementById('clearTextBtn');
  const screenshotInput = document.getElementById('screenshotInput');
  const dropZone = document.getElementById('dropZone');
  const imagePreviewCard = document.getElementById('imagePreviewCard');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const imagePreviewName = document.getElementById('imagePreviewName');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const errorAlert = document.getElementById('errorAlert');
  const checkBtn = document.getElementById('checkBtn');
  const checkBtnText = document.getElementById('checkBtnText');

  const resultsSection = document.getElementById('resultsSection');
  const verdictBanner = document.getElementById('verdictBanner');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictCanonicalBadge = document.getElementById('verdictCanonicalBadge');
  const detectedLangBadge = document.getElementById('detectedLangBadge');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictSummary = document.getElementById('verdictSummary');

  const messageReviewHeading = document.getElementById('messageReviewHeading');
  const tapHighlightHint = document.getElementById('tapHighlightHint');
  const highlightedMessageBox = document.getElementById('highlightedMessageBox');
  const flagReasonPanel = document.getElementById('flagReasonPanel');
  const flagCategoryBadge = document.getElementById('flagCategoryBadge');
  const closeReasonBtn = document.getElementById('closeReasonBtn');
  const flagExactQuote = document.getElementById('flagExactQuote');
  const flagPlainReason = document.getElementById('flagPlainReason');

  const unmatchedFlagsWrap = document.getElementById('unmatchedFlagsWrap');
  const unmatchedFlagsHeading = document.getElementById('unmatchedFlagsHeading');
  const unmatchedFlagsList = document.getElementById('unmatchedFlagsList');

  const realSupportHeading = document.getElementById('realSupportHeading');
  const realSupportList = document.getElementById('realSupportList');
  const safeStepsHeading = document.getElementById('safeStepsHeading');
  const safeStepsList = document.getElementById('safeStepsList');

  const cameraInput = document.getElementById('cameraInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const qrPreviewNote = document.getElementById('qrPreviewNote');
  const resultDot = document.getElementById('resultDot');
  const resultDetails = document.getElementById('resultDetails');
  const resultExtras = Array.from(document.querySelectorAll('.result-extra'));
  const qrResultBox = document.getElementById('qrResultBox');
  const qrResultText = document.getElementById('qrResultText');
  const inboxDots = Array.from(document.querySelectorAll('[data-dot-for]'));
  const inboxPreviews = Array.from(document.querySelectorAll('.inbox-row'));

  // Traffic-light dots: red / yellow / grey. Never green.
  const DOT_CLASSES = ['dot--unchecked', 'dot--red', 'dot--yellow', 'dot--grey'];
  function dotClassForVerdict(verdict) {
    if (verdict === 'High risk') return 'dot--red';
    if (verdict === 'Suspicious') return 'dot--yellow';
    return 'dot--grey';
  }
  function setDot(el, verdict) {
    DOT_CLASSES.forEach((c) => el.classList.remove(c));
    el.classList.add(verdict ? dotClassForVerdict(verdict) : 'dot--unchecked');
    el.title = verdict || 'Not checked yet';
    el.setAttribute('aria-label', verdict ? `Result: ${verdict}` : 'Not checked yet');
  }
  const sampleVerdicts = {}; // key: `${lang}|${sampleKey}` -> verdict (in memory only)

  // In-memory state only (nothing pasted is stored)
  let serverAvailable = false;
  let serverHasKey = false;
  let configuredModel = 'gemini-3.8-flash';
  let currentSampleLang = 'English';
  let activeSampleKey = null;
  let uploadedImage = null; // { base64, mimeType, dataUrl, name }
  let activeFlagIndex = null;
  let currentFlags = [];
  let currentLangDefaults = Shared.LOCALIZED_DEFAULTS.English;

  function renderInbox() {
    inboxPreviews.forEach((row) => {
      const key = row.getAttribute('data-sample');
      const text = SAMPLE_MESSAGES[currentSampleLang]?.[key] || '';
      const preview = row.querySelector('.inbox-preview');
      if (preview) preview.textContent = text.length > 80 ? `${text.slice(0, 80)}…` : text;
    });
    inboxDots.forEach((dot) => {
      const key = dot.getAttribute('data-dot-for');
      setDot(dot, sampleVerdicts[`${currentSampleLang}|${key}`]);
    });
  }

  function setDetailsOpen(open) {
    resultDetails.hidden = !open;
    resultExtras.forEach((el) => {
      el.hidden = !open;
    });
    resultDot.setAttribute('aria-expanded', String(open));
  }

  resultDot.addEventListener('click', () => {
    setDetailsOpen(resultDetails.hidden);
  });

  // QR code detection (runs in the browser; the link is never opened)
  function decodeQrFromDataUrl(dataUrl) {
    return new Promise((resolve) => {
      if (typeof window.jsQR !== 'function') {
        resolve('');
        return;
      }
      const img = new Image();
      img.onerror = () => resolve('');
      img.onload = () => {
        try {
          const maxDim = 1600;
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h);
          const code = window.jsQR(data.data, w, h, { inversionAttempts: 'attemptBoth' });
          resolve(code && code.data ? String(code.data).trim() : '');
        } catch {
          resolve('');
        }
      };
      img.src = dataUrl;
    });
  }

  async function detectServerConfig() {
    if (window.location.protocol === 'file:') {
      serverAvailable = false;
      serverHasKey = false;
      apiKeySection.hidden = false;
      return;
    }
    try {
      const res = await fetch('./api/config', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        serverAvailable = true;
        serverHasKey = Boolean(data.hasServerKey);
        if (data.model) configuredModel = data.model;
        apiKeySection.hidden = serverHasKey;
        return;
      }
    } catch {
      // Running as static files without Node backend
    }
    serverAvailable = false;
    serverHasKey = false;
    apiKeySection.hidden = false;
  }

  function showError(msg) {
    if (!msg) {
      errorAlert.hidden = true;
      errorAlert.textContent = '';
      return;
    }
    errorAlert.textContent = msg;
    errorAlert.hidden = false;
  }

  function updateClearButton() {
    clearTextBtn.hidden = messageInput.value.trim().length === 0;
  }

  function clearSampleSelection() {
    activeSampleKey = null;
    sampleButtons.forEach((btn) => btn.classList.remove('is-selected'));
  }

  // Toggle API key visibility
  toggleKeyBtn.addEventListener('click', () => {
    const isHidden = apiKeyInput.type === 'password';
    apiKeyInput.type = isHidden ? 'text' : 'password';
    toggleKeyBtn.textContent = isHidden ? 'Hide' : 'Show';
    toggleKeyBtn.setAttribute('aria-pressed', String(isHidden));
  });

  // Sample language pills
  langPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const lang = pill.getAttribute('data-lang');
      if (!SAMPLE_MESSAGES[lang]) return;
      currentSampleLang = lang;
      langPills.forEach((p) => p.classList.toggle('is-active', p === pill));
      renderInbox();
      if (activeSampleKey && SAMPLE_MESSAGES[currentSampleLang][activeSampleKey]) {
        messageInput.value = SAMPLE_MESSAGES[currentSampleLang][activeSampleKey];
        updateClearButton();
        resultsSection.hidden = true;
        showError('');
      }
    });
  });

  // Three sample-message buttons
  sampleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.getAttribute('data-sample');
      const sampleText = SAMPLE_MESSAGES[currentSampleLang]?.[sampleKey];
      if (!sampleText) return;

      activeSampleKey = sampleKey;
      sampleButtons.forEach((b) => b.classList.toggle('is-selected', b === btn));

      clearUploadedImage();
      messageInput.value = sampleText;
      updateClearButton();
      showError('');
      resultsSection.hidden = true;
      messageInput.focus();
    });
  });

  messageInput.addEventListener('input', () => {
    updateClearButton();
    if (activeSampleKey) {
      const expected = SAMPLE_MESSAGES[currentSampleLang]?.[activeSampleKey];
      if (messageInput.value !== expected) {
        clearSampleSelection();
      }
    }
    showError('');
  });

  clearTextBtn.addEventListener('click', () => {
    messageInput.value = '';
    clearSampleSelection();
    updateClearButton();
    messageInput.focus();
  });

  // Image handling & compression
  function clearUploadedImage() {
    uploadedImage = null;
    screenshotInput.value = '';
    imagePreviewImg.removeAttribute('src');
    imagePreviewName.textContent = '';
    imagePreviewCard.hidden = true;
    dropZone.hidden = false;
    cameraBtn.hidden = false;
    cameraInput.value = '';
    qrPreviewNote.hidden = true;
    qrPreviewNote.textContent = '';
  }

  removeImageBtn.addEventListener('click', () => {
    clearUploadedImage();
  });

  function readImageOptimized(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please choose a valid PNG, JPG, or WebP screenshot image.'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('Image is larger than 15 MB. Please choose a smaller screenshot.'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.onload = () => {
        const rawDataUrl = String(reader.result || '');
        const img = new Image();
        img.onerror = () => reject(new Error('Could not decode the uploaded image.'));
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width <= maxDim && height <= maxDim && file.size <= 3 * 1024 * 1024) {
            const commaIdx = rawDataUrl.indexOf(',');
            resolve({
              base64: rawDataUrl.slice(commaIdx + 1),
              mimeType: file.type || 'image/png',
              dataUrl: rawDataUrl,
              name: file.name || 'screenshot.png'
            });
            return;
          }

          const scale = Math.min(maxDim / width, maxDim / height, 1);
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const outMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const compressedUrl = canvas.toDataURL(outMime, 0.88);
          const commaIdx = compressedUrl.indexOf(',');
          resolve({
            base64: compressedUrl.slice(commaIdx + 1),
            mimeType: outMime,
            dataUrl: compressedUrl,
            name: file.name || 'screenshot.jpg'
          });
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleSelectedFile(file) {
    if (!file) return;
    showError('');
    try {
      const processed = await readImageOptimized(file);
      uploadedImage = processed;
      imagePreviewImg.src = processed.dataUrl;
      imagePreviewName.textContent = processed.name;
      imagePreviewCard.hidden = false;
      dropZone.hidden = true;
      cameraBtn.hidden = true;

      const qr = await decodeQrFromDataUrl(processed.dataUrl);
      processed.qrText = qr;
      if (qr) {
        qrPreviewNote.textContent = `QR code found – points to: ${qr} (not opened)`;
        qrPreviewNote.hidden = false;
      } else {
        qrPreviewNote.hidden = true;
        qrPreviewNote.textContent = '';
      }
    } catch (err) {
      showError(err.message || 'Could not process screenshot.');
    }
  }

  cameraInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleSelectedFile(file);
  });

  screenshotInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleSelectedFile(file);
  });

  // Drag & drop screenshot support
  ['dragenter', 'dragover'].forEach((evtName) => {
    dropZone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropZone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evtName) => {
    dropZone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('is-dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleSelectedFile(file);
  });

  // Clipboard image paste support
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleSelectedFile(new File([file], 'pasted-screenshot.png', { type: file.type }));
          break;
        }
      }
    }
  });

  // Calling Gemini (via server proxy or direct browser fallback)
  async function analyzeViaDirectGemini(apiKey, text, imageObj) {
    const payload = Shared.buildGeminiPayload({
      text,
      imageBase64: imageObj ? imageObj.base64 : null,
      imageMimeType: imageObj ? imageObj.mimeType : null,
      qrText: imageObj && imageObj.qrText ? imageObj.qrText : '',
      model: configuredModel
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(configuredModel)}:generateContent`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const m = String(data?.error?.message || '').toLowerCase();
      let friendly = 'Could not complete the check. Please try again.';
      if (res.status === 401 || res.status === 403 || m.includes('api key')) friendly = 'Invalid or unauthorised Gemini API key. Please check your key and try again.';
      else if (res.status === 429 || m.includes('quota')) friendly = 'Too many requests right now. Please wait a moment and try again.';
      else if (res.status === 404 || m.includes('no longer available') || m.includes('not found')) friendly = 'The AI model is unavailable right now. Please try again shortly.';
      else if (res.status >= 500) friendly = 'The AI service is temporarily unavailable. Please try again.';
      throw new Error(friendly);
    }

    const rawText = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('')
      .trim();

    if (!rawText) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return Shared.normalizeAnalysisResult(parsed, text);
  }

  async function runCheck(text, imageObj) {
    const userKey = apiKeyInput.value.trim();

    if (serverAvailable) {
      if (!serverHasKey && !userKey) {
        apiKeySection.hidden = false;
        apiKeyInput.focus();
        throw new Error('Please paste your Gemini API key above before checking a message.');
      }

      const headers = { 'Content-Type': 'application/json' };
      if (userKey) {
        headers['x-gemini-api-key'] = userKey;
      }

      const res = await fetch('./api/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          imageBase64: imageObj ? imageObj.base64 : '',
          imageMimeType: imageObj ? imageObj.mimeType : '',
          qrText: imageObj && imageObj.qrText ? imageObj.qrText : ''
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Could not complete check. Please try again.');
      }
      return data;
    }

    if (!userKey) {
      apiKeySection.hidden = false;
      apiKeyInput.focus();
      throw new Error('Please paste your Gemini API key above before checking a message.');
    }

    return analyzeViaDirectGemini(userKey, text, imageObj);
  }

  // Highlight selection & reason panel
  function setActiveFlag(flagIndex) {
    const allTriggerButtons = Array.from(
      document.querySelectorAll('[data-flag-index]')
    );

    if (flagIndex === null || flagIndex === activeFlagIndex || !currentFlags[flagIndex]) {
      activeFlagIndex = null;
      flagReasonPanel.hidden = true;
      allTriggerButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      });
      return;
    }

    activeFlagIndex = flagIndex;
    const flag = currentFlags[flagIndex];
    const catLabel =
      currentLangDefaults.ui.categoryLabels[flag.category] || flag.category;

    flagCategoryBadge.textContent =
      catLabel.toLowerCase() === flag.category.toLowerCase()
        ? flag.category
        : `${catLabel} (${flag.category})`;
    flagExactQuote.textContent = `“${flag.exact_phrase}”`;
    flagPlainReason.textContent = flag.plain_reason;
    flagReasonPanel.hidden = false;

    allTriggerButtons.forEach((btn) => {
      const idx = Number(btn.getAttribute('data-flag-index'));
      const isMatch = idx === flagIndex;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-expanded', String(isMatch));
    });

    if (typeof flagReasonPanel.scrollIntoView === 'function') {
      flagReasonPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  closeReasonBtn.addEventListener('click', () => {
    setActiveFlag(null);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeFlagIndex !== null) {
      setActiveFlag(null);
    }
  });

  function renderResults(result) {
    currentFlags = Array.isArray(result.flags) ? result.flags : [];
    const lang = result.detected_language || 'English';
    currentLangDefaults =
      Shared.LOCALIZED_DEFAULTS[lang] || Shared.LOCALIZED_DEFAULTS.English;
    const ui = currentLangDefaults.ui;

    activeFlagIndex = null;
    flagReasonPanel.hidden = true;

    // 1. Verdict Banner (Red / Amber / Grey)
    verdictBanner.className = 'verdict-banner';
    if (result.verdict === 'High risk') {
      verdictBanner.classList.add('verdict--red');
    } else if (result.verdict === 'Suspicious') {
      verdictBanner.classList.add('verdict--amber');
    } else {
      verdictBanner.classList.add('verdict--grey');
    }

    verdictIcon.innerHTML = VERDICT_ICONS[result.verdict] || VERDICT_ICONS.Suspicious;
    setDot(resultDot, result.verdict);
    setDetailsOpen(true);

    const qrText = result.qrText || '';
    qrResultText.textContent = qrText;
    qrResultBox.hidden = !qrText;

    const localizedTitle = result.verdict_localized || result.verdict;
    verdictTitle.textContent = localizedTitle;

    if (localizedTitle.toLowerCase() !== result.verdict.toLowerCase()) {
      verdictCanonicalBadge.textContent = result.verdict;
      verdictCanonicalBadge.hidden = false;
    } else {
      verdictCanonicalBadge.hidden = true;
    }

    detectedLangBadge.textContent = `${ui.detectedLanguageLabel}: ${lang}`;
    verdictSummary.textContent = result.summary || '';
    verdictSummary.hidden = !result.summary;

    // 2. Original Message with Highlighted Phrases
    messageReviewHeading.textContent = ui.originalMessageHeading;

    const messageToDisplay = result.display_message || '';
    const { segments, unmatchedFlags } = Shared.segmentMessageWithHighlights(
      messageToDisplay,
      currentFlags
    );

    highlightedMessageBox.textContent = '';

    if (currentFlags.length > 0) {
      tapHighlightHint.textContent = ui.tapHint;
    } else {
      tapHighlightHint.textContent = ui.noHighlightsNote;
    }

    let badgeCounter = 0;
    if (segments.length === 0) {
      highlightedMessageBox.textContent = 'Screenshot analyzed.';
    } else {
      segments.forEach((seg) => {
        if (seg.type === 'text') {
          highlightedMessageBox.appendChild(document.createTextNode(seg.text));
        } else {
          badgeCounter += 1;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'phrase-highlight';
          btn.setAttribute('data-flag-index', String(seg.flagIndex));
          btn.setAttribute('aria-expanded', 'false');
          btn.appendChild(document.createTextNode(seg.text));

          const numBadge = document.createElement('span');
          numBadge.className = 'phrase-badge-num';
          numBadge.setAttribute('aria-hidden', 'true');
          numBadge.textContent = String(badgeCounter);
          btn.appendChild(numBadge);

          btn.addEventListener('click', () => {
            setActiveFlag(seg.flagIndex);
          });

          highlightedMessageBox.appendChild(btn);
        }
      });
    }

    // Unmatched / visual flags
    unmatchedFlagsList.textContent = '';
    if (unmatchedFlags.length > 0) {
      unmatchedFlagsHeading.textContent = ui.visualFlagsHeading;
      unmatchedFlags.forEach(({ flag, flagIndex }) => {
        badgeCounter += 1;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'unmatched-chip';
        chip.setAttribute('data-flag-index', String(flagIndex));
        chip.setAttribute('aria-expanded', 'false');
        chip.textContent = `${badgeCounter}. ${flag.exact_phrase}`;
        chip.addEventListener('click', () => {
          setActiveFlag(flagIndex);
        });
        unmatchedFlagsList.appendChild(chip);
      });
      unmatchedFlagsWrap.hidden = false;
    } else {
      unmatchedFlagsWrap.hidden = true;
    }

    // 3. What Real Support Never Does
    realSupportHeading.textContent = ui.realSupportHeading;
    realSupportList.textContent = '';
    (result.what_real_support_never_does || []).forEach((bullet) => {
      const li = document.createElement('li');
      li.textContent = bullet;
      realSupportList.appendChild(li);
    });

    // 4. How to Check Safely (Numbered List)
    safeStepsHeading.textContent = ui.safeStepsHeading;
    safeStepsList.textContent = '';
    (result.safe_steps || []).forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      safeStepsList.appendChild(li);
    });

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setLoading(isLoading) {
    checkBtn.disabled = isLoading;
    const existingSpinner = checkBtn.querySelector('.spinner');
    if (isLoading) {
      if (!existingSpinner) {
        const sp = document.createElement('span');
        sp.className = 'spinner';
        sp.setAttribute('aria-hidden', 'true');
        checkBtn.insertBefore(sp, checkBtnText);
      }
      checkBtnText.textContent = 'Checking message…';
    } else {
      if (existingSpinner) existingSpinner.remove();
      checkBtnText.textContent = 'Check message';
    }
  }

  checkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');

    const text = messageInput.value;
    const sampleKeyAtSubmit =
      activeSampleKey && !uploadedImage && text === SAMPLE_MESSAGES[currentSampleLang]?.[activeSampleKey]
        ? activeSampleKey
        : null;
    const langAtSubmit = currentSampleLang;
    if (!text.trim() && !uploadedImage) {
      showError('Please paste the message text or upload a screenshot first.');
      messageInput.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await runCheck(text, uploadedImage);
      result.qrText = uploadedImage && uploadedImage.qrText ? uploadedImage.qrText : '';
      renderResults(result);
      if (sampleKeyAtSubmit) {
        sampleVerdicts[`${langAtSubmit}|${sampleKeyAtSubmit}`] = result.verdict;
        renderInbox();
      }
    } catch (err) {
      showError(err.message || 'Something went wrong while checking the message.');
    } finally {
      setLoading(false);
    }
  });

  renderInbox();
  detectServerConfig();
})();
