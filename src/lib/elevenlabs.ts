import { Voice } from "@/types";

/**
 * ElevenLabs API base URL
 * @see https://docs.elevenlabs.io/api-reference
 */
const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

/**
 * Error thrown when ElevenLabs API requests fail
 */
export class ElevenLabsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = "ElevenLabsError";
  }
}

/**
 * Response structure from ElevenLabs /voices endpoint
 * The API returns voices wrapped in a "voices" array
 */
interface ElevenLabsVoicesResponse {
  voices: Array<{
    voice_id: string;
    name: string;
    description?: string;
    category?: string;
    labels?: Record<string, string>;
    preview_url?: string;
  }>;
}

/**
 * Fetches available voices from ElevenLabs API
 *
 * @param apiKey - Your ElevenLabs API key
 * @returns Promise resolving to array of Voice objects
 * @throws {ElevenLabsError} When API request fails or returns invalid data
 *
 * @example
 * ```ts
 * const voices = await fetchElevenLabsVoices(process.env.ELEVENLABS_API_KEY);
 * console.log(voices[0].name); // "Rachel"
 * ```
 *
 * @see https://docs.elevenlabs.io/api-reference/get-voices
 */
export async function fetchElevenLabsVoices(apiKey: string): Promise<Voice[]> {
  if (!apiKey) {
    throw new ElevenLabsError("API key is required");
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ElevenLabsError(
      `Failed to fetch voices: ${response.statusText}`,
      response.status,
      errorBody
    );
  }

  const data: ElevenLabsVoicesResponse = await response.json();

  // Transform ElevenLabs response to our Voice interface
  // Only include fields we need to reduce payload size
  return data.voices.map((voice) => ({
    voice_id: voice.voice_id,
    name: voice.name,
    description: voice.description,
    category: voice.category,
  }));
}

/**
 * Request body structure for ElevenLabs text-to-speech endpoint
 */
interface TextToSpeechRequest {
  text: string;
  model_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

/**
 * Generates speech audio from text using ElevenLabs API
 *
 * @param apiKey - Your ElevenLabs API key
 * @param text - The text to convert to speech (max 5000 chars recommended)
 * @param voiceId - The voice ID to use for generation
 * @returns Promise resolving to audio data as ArrayBuffer
 * @throws {ElevenLabsError} When API request fails
 *
 * @example
 * ```ts
 * const audioBuffer = await generateSpeech(
 *   process.env.ELEVENLABS_API_KEY,
 *   "Hello, world!",
 *   "21m00Tcm4TlvDq8ikWAM" // Rachel voice ID
 * );
 * ```
 *
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech
 *
 * @remarks
 * - Uses eleven_monolingual_v1 model by default (English optimized)
 * - Returns MP3 audio format
 * - Default voice settings provide balanced output
 * - For long texts, consider streaming endpoint instead
 */
export async function generateSpeech(
  apiKey: string,
  text: string,
  voiceId: string
): Promise<ArrayBuffer> {
  if (!apiKey) {
    throw new ElevenLabsError("API key is required");
  }

  if (!text || text.trim().length === 0) {
    throw new ElevenLabsError("Text is required and cannot be empty");
  }

  if (!voiceId) {
    throw new ElevenLabsError("Voice ID is required");
  }

  const requestBody: TextToSpeechRequest = {
    text,
    // eleven_monolingual_v1: Optimized for English, good quality/speed balance
    // Alternative: eleven_multilingual_v2 for non-English text
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      // Stability: 0-1, higher = more consistent, lower = more expressive
      stability: 0.5,
      // Similarity boost: 0-1, higher = closer to original voice
      similarity_boost: 0.75,
    },
  };

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    // Parse common ElevenLabs error responses
    let errorMessage = `Failed to generate speech: ${response.statusText}`;

    if (response.status === 401) {
      errorMessage = "Invalid API key";
    } else if (response.status === 422) {
      errorMessage = "Invalid request: check text length and voice ID";
    } else if (response.status === 429) {
      errorMessage = "Rate limit exceeded: please try again later";
    }

    throw new ElevenLabsError(errorMessage, response.status, errorBody);
  }

  // Return raw audio data as ArrayBuffer
  return response.arrayBuffer();
}
