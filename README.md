# Semak Dulu – Check Before You Act

Built at DevFest KL 2026 Vibing Lounge (GDG KL) for Deriv Challenge 03: *Help Customers Recognize a Suspicious Message*.

**Live demo:** https://shermaineyap.github.io/gdg-deriv/ (paste your own Gemini API key; it stays in your browser session only)

A single-page web app that helps online trading platform customers check messages claiming to be from "support" for scam warning signs before clicking links or replying.

## Quick Start

1. **(Optional) Configure a server-side Gemini API key**
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   *(If you leave `GEMINI_API_KEY` blank in `.env`, the app shows a session-only Gemini API key input field in the browser.)*

2. **Start the server**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

   *(You can also open `public/index.html` directly in a browser and paste your Gemini API key into the top input bar.)*

3. **Run tests**
   ```bash
   npm test
   ```

## Features

- **Text or Screenshot Input**: Paste a suspicious SMS/WhatsApp/Telegram/email message, or upload/drop/paste a screenshot (`gemini-3.8-flash` multimodal OCR + scam analysis).
- **Gemini Structured JSON Output**:
  - `verdict`: `"High risk"` | `"Suspicious"` | `"No warning signs found – still verify"` (never declares a message `"safe"`)
  - `flags`: `{ exact_phrase, category, plain_reason }[]` across 8 categories, including `visual cue` for screenshot-only warning signs
  - `what_real_support_never_does`: 2–3 concise bullets
  - `safe_steps`: numbered steps that always include the 4 core verification steps
- **Interactive Phrase Highlighting**: Highlights each flagged phrase inside the original message; tapping any highlight shows its category and plain-language reason.
- **Multilingual Detection & Response**: Automatically detects **English**, **Bahasa Malaysia**, **Chinese**, or **Manglish** and responds in the same language.
- **Zero Storage**: All checks happen in memory with `Cache-Control: no-store`; nothing pasted or uploaded is stored.
- **Chat-style result with traffic lights**: The checked message is shown as a chat bubble with a dot – red (High risk), yellow (Suspicious), grey (No warning signs found – still verify). Never green. Tap the dot to show or hide the warning signs and safe steps.
- **Mock inbox**: The three sample messages appear as an inbox, each with its own dot once checked.
- **Visual cues in screenshots**: Sender number, missing verified badge, logo quality, lookalike URLs and personal-looking accounts are flagged.
- **QR code check**: QR codes in screenshots are decoded in the browser with [jsQR](https://github.com/cozmo/jsQR) (Apache-2.0). The destination is shown as plain text, never opened, and included in the analysis.
- **Scan with camera**: On phones, photograph another screen or a printed letter directly.

- **Instant demo mode**: The three English sample inbox messages show saved results from real Gemini checks (`public/demo-results.json`), so the demo stays fast even when the Gemini API is overloaded. Anything you paste yourself is checked live.
- **Busy-API handling**: Each Gemini call times out after 75 s, and if the main model (`gemini-3.8-flash`) is overloaded (429/503/timeout) the app retries once with `gemini-3.5-flash`.

## Disclaimer

This tool gives guidance, not a guarantee. Always verify through the official app or website.
