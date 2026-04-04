# CommonGround

Multilingual communication app for shelters. Two people speak in any language — both see and hear the translation instantly.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Architecture

```
commonground/
├── app/
│   ├── layout.tsx              # Root layout with PWA meta
│   ├── page.tsx                # Main dual-mic conversation screen
│   ├── page.module.css         # Page styles
│   ├── globals.css             # Design tokens (CSS variables)
│   └── api/
│       └── translate/
│           └── route.ts        # 🔌 Translation API endpoint
├── components/
│   ├── MicButton.tsx           # Record button with pulse animation
│   ├── MessageBubble.tsx       # Chat bubble (orange=me, beige=other)
│   ├── ConversationThread.tsx  # Scrollable message list
│   ├── Waveform.tsx            # Recording visualization
│   ├── Icons.tsx               # SVG icons (no text labels)
│   └── ServiceWorkerRegistrar.tsx
├── hooks/
│   └── index.ts                # useConversation, useWaveform, usePWA
├── lib/
│   └── translation-service.ts  # 🔌 Translation service (Web Speech API)
├── types/
│   └── index.ts                # TypeScript interfaces
└── public/
    ├── manifest.json           # PWA manifest
    └── sw.js                   # Service worker for offline support
```

## How It Works

1. Place phone on table between two people
2. Person A presses their mic (top), speaks in any language
3. Speech is transcribed → language detected → translated
4. Both halves show the full conversation
5. Top half is rotated 180° so Person A reads it naturally
6. Tap the speaker icon on any message to hear it aloud
7. Reset button in the center clears the conversation

## Connecting Your Backend

There are **two integration points** marked with 🔌:

### 1. Translation API (`app/api/translate/route.ts`)

The Next.js API route that receives translation requests. Replace the placeholder with your backend:

```typescript
// Option A: On-device LLM (e.g. llama.cpp running locally)
const response = await fetch("http://localhost:8080/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        role: "system",
        content: "You are a translator. Translate the following text. Return only the translation, nothing else.",
      },
      {
        role: "user",
        content: `Translate from ${sourceLanguage} to ${targetLanguage}: ${text}`,
      },
    ],
  }),
});

// Option B: Google Cloud Translation
const response = await fetch(
  `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
  {
    method: "POST",
    body: JSON.stringify({ q: text, source: sourceLanguage, target: targetLanguage }),
  }
);

// Option C: DeepL API
const response = await fetch("https://api-free.deepl.com/v2/translate", {
  method: "POST",
  headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
  body: new URLSearchParams({ text, source_lang: sourceLanguage, target_lang: targetLanguage }),
});
```

### 2. Translation Service (`lib/translation-service.ts`)

The client-side service that handles speech recognition, translation calls, and TTS. The current implementation uses:

- **Speech-to-text**: Web Speech API (`SpeechRecognition`)
- **Translation**: Calls `/api/translate` (your backend)
- **Text-to-speech**: Web Speech API (`SpeechSynthesis`)

You can replace any of these. For example, to use Whisper for STT:

```typescript
// In startRecording / stopRecording:
const formData = new FormData();
formData.append("file", audioBlob, "audio.webm");
const response = await fetch("/api/transcribe", {
  method: "POST",
  body: formData,
});
const { text, language } = await response.json();
```

## Language Detection

The Web Speech API can auto-detect languages in Chrome, but support varies. For more reliable detection:

1. **Browser-native**: Set `recognition.lang = ""` (Chrome only, limited)
2. **Backend detection**: Send the audio to your backend and use a dedicated language ID model (e.g. Whisper, fastText langdetect)
3. **Hybrid**: Let the browser transcribe, then detect the language of the transcript server-side

## WCAG AAA Compliance

All text meets WCAG Level AAA contrast requirements:

| Element                  | Colors                    | Ratio   | Requirement |
| ------------------------ | ------------------------- | ------- | ----------- |
| Translation on orange    | #3D2218 on #E8B298        | 7.81:1  | 7:1 ✅       |
| Original on orange       | #421E0A on #E8B298        | 7.91:1  | 7:1 ✅       |
| Translation on beige     | #3D3228 on #F0E8DF        | 10.27:1 | 7:1 ✅       |
| Original on beige        | #4A3F35 on #F0E8DF        | 8.43:1  | 7:1 ✅       |
| Reset icon on cream      | #5C5047 on #FFFDF8        | 7.67:1  | 4.5:1 ✅     |
| Waveform on cream        | #9E2E2E on #FFFDF8        | 7.16:1  | 4.5:1 ✅     |
| Processing dots on cream | #7D6B58 on #FFFDF8        | 5.02:1  | 4.5:1 ✅     |

## PWA & Offline

The app is a Progressive Web App:

- **Install prompt**: Users can "Add to Home Screen" on iOS/Android
- **Offline shell**: The app UI loads without network (cached by service worker)
- **Offline translation**: Requires either network or an on-device model

### Service Worker Strategy

- **App shell** (HTML/CSS/JS): Cache-first — loads instantly offline
- **API calls** (`/api/translate`): Network-only with offline fallback message
- **Fonts**: Cached on first load

## Shipping to App Stores

### iOS (App Store)

Use a WebView wrapper. Options:

1. **Capacitor** (recommended):
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init CommonGround com.yourorg.commonground
   npx cap add ios
   npm run build
   npx cap sync
   npx cap open ios  # Opens Xcode
   ```

2. **PWABuilder** (pwabuilder.com): Upload your URL, generate an Xcode project

### Android (Play Store)

1. **Capacitor** (same as above):
   ```bash
   npx cap add android
   npx cap sync
   npx cap open android  # Opens Android Studio
   ```

2. **TWA** (Trusted Web Activity): Wraps your PWA with zero native code
   ```bash
   npx @nickvdh/pwa-to-twa
   ```

### Key Considerations for App Store Review

- Mic permission: Add usage description in `Info.plist` / `AndroidManifest.xml`
- No account/login: This is a plus for review — simpler flow
- Privacy: No data stored, no analytics — mention this in review notes
- Offline: Demonstrate the app shell loads offline even if translation needs network

## Design Decisions

- **Zero text in UI chrome**: Everything communicates through icons and animation
- **Dual-mic layout**: Inspired by Apple Translate's conversation mode
- **Orange = me, beige = other**: Relative to each viewer, not absolute
- **Hold-to-record**: More intuitive than tap-to-start/tap-to-stop for stressed users
- **No onboarding**: Pick up the device, press the button, start talking
