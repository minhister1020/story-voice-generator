---
title: "Production Polish and Deploy Ready"
type: feat
date: 2026-02-03
phase: 4
---

# Production Polish and Deploy Ready

## Overview

Add professional polish to the Story Voice Generator for public sharing on LinkedIn and deployment to Vercel. Focus on UX enhancements, SEO/social metadata, accessibility, and documentation.

## Problem Statement

The MVP is functional but lacks:
- Professional header/footer for branding
- Social sharing metadata for LinkedIn previews
- Keyboard shortcuts for power users
- Empty states and loading feedback
- Production documentation (README, env examples)

## Proposed Solution

Implement polish in 4 focused sub-phases:
1. **Layout & Branding** - Header, footer, responsive polish
2. **UX Enhancements** - Keyboard shortcuts, empty states, toast notifications
3. **SEO & Social** - Open Graph metadata, favicon
4. **Deploy Prep** - README, .env.example, deployment checklist

---

## Implementation Phases

### Phase 4.1: Layout & Branding

#### Create Header Component

**File:** `src/components/Header.tsx`

```tsx
"use client";

export default function Header() {
  return (
    <header className="border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <span className="font-semibold text-slate-100">Story Voice</span>
        </div>
        <a
          href="https://github.com/YOUR_USERNAME/story-voice-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="View source on GitHub"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </header>
  );
}
```

#### Create Footer Component

**File:** `src/components/Footer.tsx`

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
        <p>
          Built by{" "}
          <a
            href="https://linkedin.com/in/YOUR_LINKEDIN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Your Name
          </a>
          {" "}• Powered by{" "}
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ElevenLabs
          </a>
        </p>
      </div>
    </footer>
  );
}
```

#### Update page.tsx Structure

```tsx
// Add imports
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Update return JSX
return (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
      {/* Existing content - remove inline header */}
    </main>
    <Footer />
  </div>
);
```

---

### Phase 4.2: UX Enhancements

#### Add Keyboard Shortcut (Cmd/Ctrl+Enter)

**File:** `src/app/page.tsx` - Add useEffect for keyboard handler

```tsx
// Add keyboard shortcut for generate
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Cmd/Ctrl + Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isGenerateDisabled && !isGenerating) {
        handleGenerate();
      }
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isGenerateDisabled, isGenerating]);
```

#### Add Keyboard Hint to Generate Button

**File:** `src/components/GenerateButton.tsx`

```tsx
// Add hint below button text
<span className="hidden sm:inline text-xs text-indigo-300/70 ml-2">
  (⌘↵)
</span>
```

#### Add Empty State for Audio Section

**File:** `src/app/page.tsx` - Below AudioPlayer

```tsx
{/* Empty state when no audio yet */}
{!audioUrl && !isGenerating && (
  <div className="text-center py-8 text-slate-500">
    <p>Your generated audio will appear here</p>
  </div>
)}
```

#### Add Success Toast (Simple Implementation)

**File:** `src/components/Toast.tsx`

```tsx
"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
```

**File:** `src/app/globals.css` - Add animation

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

### Phase 4.3: SEO & Social Sharing

#### Update Metadata in layout.tsx

**File:** `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Story Voice Generator | AI Text-to-Speech",
  description:
    "Transform your stories into natural-sounding speech with AI voices. Free text-to-speech powered by ElevenLabs.",
  keywords: ["text-to-speech", "AI voice", "story generator", "ElevenLabs", "TTS"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    title: "Story Voice Generator",
    description: "Transform your stories into natural-sounding speech with AI voices",
    url: "https://your-app.vercel.app",
    siteName: "Story Voice Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Story Voice Generator - AI Text-to-Speech",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Story Voice Generator",
    description: "Transform your stories into natural-sounding speech with AI voices",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://your-app.vercel.app"),
};
```

#### Create OG Image

**File:** `public/og-image.png`

Create a 1200x630px image with:
- App title "Story Voice Generator"
- Tagline "Transform text to speech with AI"
- Dark slate background matching app theme
- Simple microphone or waveform icon

---

### Phase 4.4: Deploy Prep & Documentation

#### Create .env.example

**File:** `.env.example`

```bash
# ElevenLabs API Configuration
# Get your API key at https://elevenlabs.io/
ELEVENLABS_API_KEY=your_api_key_here
```

#### Create Comprehensive README.md

**File:** `README.md`

```markdown
# Story Voice Generator 🎙️

Transform your stories into natural-sounding speech with AI voices powered by ElevenLabs.

## Features

- 📝 Write or paste any text (up to 100,000 characters)
- 🎤 Choose from multiple AI voices
- 🔊 Generate natural-sounding audio
- ⬇️ Download as MP3
- ⌨️ Keyboard shortcut: Cmd/Ctrl+Enter to generate
- 🌙 Beautiful dark theme

## Demo

[Live Demo](https://your-app.vercel.app)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI Voice:** ElevenLabs API
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- ElevenLabs API key ([Get one free](https://elevenlabs.io/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/story-voice-generator.git
   cd story-voice-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your ElevenLabs API key to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | Yes |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/voices` | GET | Fetch available voices |
| `/api/generate-voice` | POST | Generate speech from text |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add `ELEVENLABS_API_KEY` environment variable
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/story-voice-generator&env=ELEVENLABS_API_KEY)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── voices/route.ts      # GET voices endpoint
│   │   └── generate-voice/route.ts  # POST generate endpoint
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main page component
│   └── globals.css              # Global styles
├── components/
│   ├── AudioPlayer.tsx          # Audio playback & download
│   ├── GenerateButton.tsx       # Generate action button
│   ├── StoryInput.tsx           # Text input with counter
│   └── VoiceSelector.tsx        # Voice dropdown
├── lib/
│   ├── constants.ts             # Shared constants
│   └── elevenlabs.ts            # ElevenLabs API helpers
└── types/
    └── index.ts                 # TypeScript interfaces
```

## License

MIT

## Author

**Your Name**
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/YOUR_LINKEDIN)
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

Built with ❤️ using [Next.js](https://nextjs.org/) and [ElevenLabs](https://elevenlabs.io/)
```

---

## Acceptance Criteria

### Functional Requirements

- [ ] Header displays app branding and GitHub link
- [ ] Footer displays author info and ElevenLabs credit
- [ ] Cmd/Ctrl+Enter triggers audio generation
- [ ] Empty state shows when no audio generated
- [ ] Success toast appears after generation completes
- [ ] LinkedIn preview shows proper title, description, and image

### Non-Functional Requirements

- [ ] Page loads under 3 seconds on 3G
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA
- [ ] No console errors in production build
- [ ] README enables new developer setup in < 5 minutes

### Deploy Checklist

- [ ] `.env.local` in `.gitignore` (already done)
- [ ] `.env.example` created with placeholder
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] TypeScript compiles with no errors
- [ ] All environment variables documented
- [ ] OG image created and placed in `/public`
- [ ] Metadata URLs updated to production domain

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/Header.tsx` | Create | App header with branding |
| `src/components/Footer.tsx` | Create | Footer with credits |
| `src/components/Toast.tsx` | Create | Success notification |
| `src/app/page.tsx` | Modify | Integrate header/footer, keyboard shortcuts, empty state |
| `src/app/layout.tsx` | Modify | Add OpenGraph and Twitter metadata |
| `src/app/globals.css` | Modify | Add toast animation |
| `public/og-image.png` | Create | Social preview image |
| `.env.example` | Create | Environment variable template |
| `README.md` | Replace | Comprehensive setup guide |

---

## Testing Plan

### Manual Testing

1. **Layout:** Verify header/footer appear on all screen sizes
2. **Keyboard:** Press Cmd+Enter with valid input, verify generation starts
3. **Empty State:** Load page fresh, verify placeholder text shows
4. **Toast:** Generate audio, verify success toast appears
5. **Social Preview:** Use LinkedIn Post Inspector to verify OG tags
6. **Deploy:** Run `npm run build && npm start`, test all features

### Accessibility Testing

1. Tab through all interactive elements
2. Verify focus is visible on all elements
3. Test with screen reader (VoiceOver/NVDA)
4. Verify color contrast with browser dev tools

---

## References

### Internal Files
- `src/app/page.tsx:1-153` - Current page implementation
- `src/app/layout.tsx:1-34` - Current layout with basic metadata
- `src/components/*.tsx` - All component files

### External Resources
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
