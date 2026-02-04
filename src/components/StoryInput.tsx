"use client";

import { useCallback, useRef, useEffect } from "react";

interface StoryInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}

export default function StoryInput({
  value,
  onChange,
  maxLength,
  disabled = false,
}: StoryInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = value.length;
  const percentUsed = (characterCount / maxLength) * 100;
  const isWarning = percentUsed > 90;
  const counterId = "story-character-counter";

  // Auto-resize textarea based on content, clamped between 200px and 500px
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto";
    // Clamp between min (200px) and max (500px)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 200), 500);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when value changes
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Enforce maxLength on input
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="story-input"
        className="block text-sm font-medium text-slate-100 mb-2"
      >
        Your Story
      </label>
      <textarea
        ref={textareaRef}
        id="story-input"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={maxLength}
        aria-label="Enter your story text"
        aria-describedby={counterId}
        placeholder="Enter the text you want to convert to speech..."
        className={`
          w-full min-h-[200px] max-h-[500px] p-4
          bg-slate-800 text-slate-100 placeholder-slate-400
          border border-slate-700 rounded-lg
          resize-none overflow-y-auto
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />
      <div
        id={counterId}
        className={`
          mt-2 text-sm text-right
          transition-colors duration-200
          ${isWarning ? "text-amber-500" : "text-slate-400"}
        `}
        role="status"
        aria-live="polite"
      >
        {characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters
      </div>
    </div>
  );
}
