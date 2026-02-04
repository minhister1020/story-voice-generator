---
title: "Connect UI Components to API Routes"
type: feat
date: 2026-02-03
phase: 3
---

# Connect UI Components to API Routes

## Overview

Wire up the 4 existing UI components (StoryInput, VoiceSelector, GenerateButton, AudioPlayer) with the 2 API routes (/api/voices, /api/generate-voice) to create a fully functional Story Voice Generator application.

## Problem Statement

The application has all the building blocks in place but they're not connected:
- Components exist but aren't rendered on the page
- API routes work but aren't called from the frontend
- No state management orchestrates the user flow
- Default Next.js boilerplate still shows on the homepage

## Proposed Solution

Replace the boilerplate `page.tsx` with a client component that:
1. Manages all application state with `useState`
2. Fetches voices on mount with `useEffect`
3. Handles audio generation with proper loading/error states
4. Cleans up blob URLs to prevent memory leaks

## Technical Approach

### State Architecture

```typescript
// Core data state
const [storyText, setStoryText] = useState<string>('');
const [voices, setVoices] = useState<Voice[]>([]);
const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
const [audioUrl, setAudioUrl] = useState<string | null>(null);

// UI state
const [isGenerating, setIsGenerating] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  State: storyText, voices, selectedVoiceId,         │    │
│  │         audioUrl, isGenerating, error               │    │
│  └─────────────────────────────────────────────────────┘    │
│         │              │              │           │          │
│         ▼              ▼              ▼           ▼          │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐  │
│  │StoryInput │  │VoiceSelector│  │GenerateBtn│  │AudioPlayer│
│  └───────────┘  └────────────┘  └──────────┘  └─────────┘  │
│                       │                │                     │
└───────────────────────┼────────────────┼─────────────────────┘
                        │                │
                        ▼                ▼
                 GET /api/voices   POST /api/generate-voice
                        │                │
                        ▼                ▼
                   ElevenLabs API (server-side only)
```

## Implementation Phases

### Phase 3.1: Update layout.tsx

**File:** `src/app/layout.tsx`

**Changes:**
- [ ] Update metadata title to "Story Voice Generator"
- [ ] Update metadata description
- [ ] Ensure dark theme is applied via body class

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "Story Voice Generator",
  description: "Convert your stories to speech with AI voices powered by ElevenLabs",
};
```

**Add body background class:**
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}>
```

---

### Phase 3.2: Clean up globals.css

**File:** `src/app/globals.css`

**Changes:**
- [ ] Verify Tailwind import is correct
- [ ] Update CSS variables for slate-900 dark theme
- [ ] Remove any conflicting styles

```css
@import "tailwindcss";

:root {
  --background: #0f172a; /* slate-900 */
  --foreground: #f1f5f9; /* slate-100 */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

---

### Phase 3.3: Implement page.tsx (Main Work)

**File:** `src/app/page.tsx`

**Complete replacement with client component:**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Voice } from "@/types";
import StoryInput from "@/components/StoryInput";
import VoiceSelector from "@/components/VoiceSelector";
import GenerateButton from "@/components/GenerateButton";
import AudioPlayer from "@/components/AudioPlayer";

const MAX_TEXT_LENGTH = 100000;

export default function Home() {
  // Core state
  const [storyText, setStoryText] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch voices on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        const response = await fetch("/api/voices");
        const data = await response.json();

        if (data.success && data.voices) {
          setVoices(data.voices);
        } else {
          setError(data.error || "Failed to load voices");
        }
      } catch {
        setError("Failed to connect to server");
      }
    }

    loadVoices();
  }, []);

  // Cleanup blob URL on unmount or when audioUrl changes
  useEffect(() => {
    const currentUrl = audioUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio generation
  const handleGenerate = useCallback(async () => {
    if (!storyText.trim() || !selectedVoiceId) return;

    // Cleanup previous audio URL before generating new one
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: storyText,
          voice_id: selectedVoiceId,
        }),
      });

      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("audio/mpeg")) {
        // Success - create blob URL for audio player
        const blob = await response.blob();
        setAudioUrl(URL.createObjectURL(blob));
      } else {
        // Error response - parse JSON
        const data = await response.json();
        setError(data.error || "Failed to generate audio");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [storyText, selectedVoiceId, audioUrl]);

  // Determine if generate button should be disabled
  const isGenerateDisabled = !storyText.trim() || !selectedVoiceId;

  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Story Voice Generator
          </h1>
          <p className="text-slate-400">
            Transform your text into natural-sounding speech
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 flex items-start gap-3"
            role="alert"
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <div className="space-y-6">
          <StoryInput
            value={storyText}
            onChange={setStoryText}
            maxLength={MAX_TEXT_LENGTH}
            disabled={isGenerating}
          />

          <VoiceSelector
            voices={voices}
            selectedVoice={selectedVoiceId}
            onVoiceChange={setSelectedVoiceId}
            disabled={isGenerating}
          />

          <div className="flex justify-center sm:justify-start">
            <GenerateButton
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={isGenerateDisabled}
            />
          </div>

          <AudioPlayer
            audioUrl={audioUrl}
            onError={() => setError("Failed to play audio")}
          />
        </div>
      </main>
    </div>
  );
}
```

---

## Acceptance Criteria

### Functional Requirements

- [ ] Voice dropdown populates from `/api/voices` on page load
- [ ] User can type story text with character counter showing
- [ ] Character counter shows warning color at >90% capacity
- [ ] User can select a voice from dropdown
- [ ] Generate button is disabled when text or voice is missing
- [ ] Clicking generate shows loading spinner and "Generating..." text
- [ ] Successful generation shows audio player with controls
- [ ] Audio player has working download button
- [ ] Errors display user-friendly messages in red alert box
- [ ] All components use slate/indigo design system

### Non-Functional Requirements

- [ ] Layout is responsive (stacks vertically on mobile, max-width on desktop)
- [ ] No memory leaks from blob URLs (verified via cleanup)
- [ ] TypeScript compiles with no errors
- [ ] No `any` types used
- [ ] All components have proper accessibility attributes

### Testing Checkpoints

1. **After Phase 3.1 (layout.tsx):**
   - [ ] Browser tab shows "Story Voice Generator" title
   - [ ] Page has dark background

2. **After Phase 3.2 (globals.css):**
   - [ ] Background is slate-900 (#0f172a)
   - [ ] Text is slate-100 (#f1f5f9)

3. **After Phase 3.3 (page.tsx):**
   - [ ] Page loads without errors
   - [ ] Voices load into dropdown (check Network tab)
   - [ ] Character counter updates as you type
   - [ ] Generate button enables when text + voice selected
   - [ ] Audio plays after generation
   - [ ] Download button downloads .mp3 file
   - [ ] Error message shows if API key is invalid

---

## Error Handling Strategy

| Scenario | User Message | Technical Handling |
|----------|--------------|-------------------|
| Voices fail to load | "Failed to load voices" | Catch fetch error, set error state |
| API key not configured | "Server configuration error: API key not set" | API returns 500, display error |
| Invalid API key | "Invalid API key configuration" | API returns 401, display error |
| Rate limit exceeded | "Rate limit exceeded, please try again later" | API returns 429, display error |
| Network failure | "Network error. Please try again." | Catch generic error |
| Audio playback fails | "Failed to play audio" | AudioPlayer calls onError prop |

---

## Memory Leak Prevention

**Blob URL Lifecycle:**

```typescript
// 1. Store URL in state for tracking
setAudioUrl(URL.createObjectURL(blob));

// 2. Cleanup when new audio generated (before setting new URL)
if (audioUrl) {
  URL.revokeObjectURL(audioUrl);
  setAudioUrl(null);
}

// 3. Cleanup on component unmount
useEffect(() => {
  const currentUrl = audioUrl;
  return () => {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
  };
}, [audioUrl]);
```

---

## Files Modified Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/app/layout.tsx` | Modify | ~5 lines |
| `src/app/globals.css` | Modify | ~10 lines |
| `src/app/page.tsx` | Replace | ~130 lines |

---

## Dependencies

- All 4 UI components must be working (Phase 1) ✅
- Both API routes must be working (Phase 2) ✅
- Valid ElevenLabs API key in `.env.local` ✅

---

## References

### Internal Files
- `src/components/StoryInput.tsx` - Textarea component
- `src/components/VoiceSelector.tsx` - Voice dropdown
- `src/components/GenerateButton.tsx` - Submit button
- `src/components/AudioPlayer.tsx` - Audio playback
- `src/app/api/voices/route.ts` - Voices endpoint
- `src/app/api/generate-voice/route.ts` - Generation endpoint
- `src/types/index.ts` - TypeScript interfaces

### Design System
- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Text primary: `#f1f5f9` (slate-100)
- Text secondary: `#94a3b8` (slate-400)
- Accent: `#6366f1` (indigo-500)
- Error: `#ef4444` (red-500)
