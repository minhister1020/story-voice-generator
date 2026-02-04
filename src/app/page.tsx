"use client";

import { useState, useEffect } from "react";
import { Voice, VoicesApiResponse } from "@/types";
import { MAX_TEXT_LENGTH } from "@/lib/constants";
import StoryInput from "@/components/StoryInput";
import VoiceSelector from "@/components/VoiceSelector";
import GenerateButton from "@/components/GenerateButton";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  // Core state
  const [storyText, setStoryText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // UI state
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch voices on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        const response = await fetch("/api/voices");
        const data: VoicesApiResponse = await response.json();

        if (data.success && data.voices) {
          setVoices(data.voices);
        } else {
          setError(data.error || "Failed to load voices");
        }
      } catch {
        setError("Failed to connect to server");
      } finally {
        setIsLoadingVoices(false);
      }
    }

    loadVoices();
  }, []);

  // Cleanup blob URL when it changes or on unmount
  useEffect(() => {
    const currentUrl = audioUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio generation
  async function handleGenerate() {
    if (!storyText.trim() || !selectedVoiceId) return;

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: storyText,
          voice_id: selectedVoiceId,
        }),
      });

      // Check response status first (Kieran's feedback)
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Generation failed (${response.status})`);
        return;
      }

      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("audio/mpeg")) {
        const blob = await response.blob();
        setAudioUrl(URL.createObjectURL(blob));
      } else {
        setError("Unexpected response format from server");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const isGenerateDisabled =
    !storyText.trim() || !selectedVoiceId || isLoadingVoices;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-semibold text-slate-100">
            Story Voice Generator
          </span>
          <a
            href="https://github.com/minhister1020/story-voice-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="View source on GitHub"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            AI Text-to-Speech
          </h1>
          <p className="text-slate-400">
            Transform your text into natural-sounding speech
          </p>
        </div>

        {/* Error Display - simplified per reviewer feedback */}
        {error && (
          <p
            className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400"
            role="alert"
          >
            {error}
          </p>
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
            disabled={isGenerating || isLoadingVoices}
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

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          Built by{" "}
          <a
            href="https://github.com/minhister1020"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Minh Bui
          </a>
          {" · Powered by "}
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ElevenLabs
          </a>
        </div>
      </footer>
    </div>
  );
}
