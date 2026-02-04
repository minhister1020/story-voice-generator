"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string | null;
  onError?: () => void;
}

export default function AudioPlayer({ audioUrl, onError }: AudioPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset error state when audioUrl changes
  useEffect(() => {
    setHasError(false);
  }, [audioUrl]);

  // Don't render if no audio URL
  if (!audioUrl) {
    return null;
  }

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `story-audio-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (hasError) {
    return (
      <div
        className="w-full p-4 bg-slate-800 border border-red-500 rounded-lg"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-3 text-red-500">
          {/* Error icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Failed to load audio. Please try generating again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <label className="block text-sm font-medium text-slate-100">
        Generated Audio
      </label>

      {/* HTML5 Audio Player */}
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        onError={handleError}
        aria-label="Generated story audio"
        className="w-full rounded-lg"
        style={{
          // Style the audio element for dark theme consistency
          filter: "invert(1) hue-rotate(180deg)",
        }}
      >
        Your browser does not support the audio element.
      </audio>

      {/* Download Button */}
      <button
        type="button"
        onClick={handleDownload}
        className={`
          w-full sm:w-auto px-6 py-2
          bg-slate-700 text-slate-100 font-medium
          rounded-lg border border-slate-600
          transition-all duration-200
          hover:bg-slate-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
          flex items-center justify-center gap-2
        `}
        aria-label="Download generated audio file"
      >
        {/* Download icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Download Audio</span>
      </button>
    </div>
  );
}
