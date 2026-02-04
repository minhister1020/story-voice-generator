"use client";

import { Voice } from "@/types";

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string | null;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
}

export default function VoiceSelector({
  voices,
  selectedVoice,
  onVoiceChange,
  disabled = false,
}: VoiceSelectorProps) {
  const isLoading = voices.length === 0;
  const selectId = "voice-selector";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVoiceChange(e.target.value);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-100 mb-2"
      >
        Voice
      </label>
      <select
        id={selectId}
        value={selectedVoice ?? ""}
        onChange={handleChange}
        disabled={disabled || isLoading}
        aria-label="Select a voice for text-to-speech"
        className={`
          w-full p-3
          bg-slate-800 text-slate-100
          border border-slate-700 rounded-lg
          appearance-none cursor-pointer
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? "animate-pulse" : ""}
        `}
        style={{
          // Custom dropdown arrow using CSS
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "20px",
          paddingRight: "44px",
        }}
      >
        {isLoading ? (
          <option value="" disabled>
            Loading voices...
          </option>
        ) : (
          <>
            <option value="" disabled>
              Select a voice
            </option>
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
                {voice.description ? ` — ${voice.description}` : ""}
              </option>
            ))}
          </>
        )}
      </select>
      {/* Additional context for selected voice */}
      {selectedVoice && !isLoading && (
        <p className="mt-2 text-sm text-slate-400">
          {voices.find((v) => v.voice_id === selectedVoice)?.category &&
            `Category: ${voices.find((v) => v.voice_id === selectedVoice)?.category}`}
        </p>
      )}
    </div>
  );
}
