import { NextResponse } from "next/server";
import { fetchElevenLabsVoices, ElevenLabsError } from "@/lib/elevenlabs";
import { Voice } from "@/types";

/**
 * Response type for the voices endpoint
 */
interface VoicesResponse {
  success: boolean;
  voices?: Voice[];
  error?: string;
}

/**
 * GET /api/voices
 *
 * Fetches available voices from ElevenLabs API.
 * The API key is read from server-side environment variables,
 * keeping it secure and never exposed to the client.
 *
 * @returns JSON response with voices array or error message
 *
 * @example Success response:
 * ```json
 * {
 *   "success": true,
 *   "voices": [
 *     { "voice_id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel", "category": "premade" }
 *   ]
 * }
 * ```
 *
 * @example Error response:
 * ```json
 * { "success": false, "error": "Failed to fetch voices" }
 * ```
 */
export async function GET(): Promise<NextResponse<VoicesResponse>> {
  // Read API key from server environment
  // This is secure - env vars are only accessible server-side in Next.js
  const apiKey = process.env.ELEVENLABS_API_KEY;

  // Check for missing API key configuration
  if (!apiKey || apiKey === "your_key_here") {
    console.error("[/api/voices] ELEVENLABS_API_KEY not configured");
    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error: API key not set",
      },
      { status: 500 }
    );
  }

  try {
    const voices = await fetchElevenLabsVoices(apiKey);

    return NextResponse.json({
      success: true,
      voices,
    });
  } catch (error) {
    // Log full error server-side for debugging
    console.error("[/api/voices] Error fetching voices:", error);

    // Handle known ElevenLabs errors with appropriate status codes
    if (error instanceof ElevenLabsError) {
      const statusCode = error.statusCode || 500;

      // Don't expose internal error details to client in production
      const clientMessage =
        statusCode === 401
          ? "Invalid API key configuration"
          : statusCode === 429
            ? "Rate limit exceeded, please try again later"
            : "Failed to fetch voices";

      return NextResponse.json(
        {
          success: false,
          error: clientMessage,
        },
        { status: statusCode >= 500 ? 500 : statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
