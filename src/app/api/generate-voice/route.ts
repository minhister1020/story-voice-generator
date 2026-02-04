import { NextRequest, NextResponse } from "next/server";
import { generateSpeech, ElevenLabsError } from "@/lib/elevenlabs";
import { MAX_TEXT_LENGTH } from "@/lib/constants";

/**
 * Minimum text length required
 */
const MIN_TEXT_LENGTH = 1;

/**
 * Request body structure for voice generation
 */
interface GenerateVoiceRequestBody {
  text?: string;
  voice_id?: string;
}

/**
 * Error response structure
 */
interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * POST /api/generate-voice
 *
 * Generates speech audio from text using ElevenLabs API.
 * Returns audio as MP3 blob on success, or JSON error on failure.
 *
 * @param request - Next.js request object containing JSON body
 * @returns Audio blob (audio/mpeg) on success, JSON error on failure
 *
 * @example Request:
 * ```bash
 * curl -X POST http://localhost:3000/api/generate-voice \
 *   -H "Content-Type: application/json" \
 *   -d '{"text": "Hello world", "voice_id": "21m00Tcm4TlvDq8ikWAM"}' \
 *   --output audio.mp3
 * ```
 *
 * @example Error response:
 * ```json
 * { "success": false, "error": "Text is required" }
 * ```
 *
 * @remarks
 * - Rate limiting: TODO - Consider implementing rate limiting per IP/session
 *   to prevent abuse. Options include:
 *   - Vercel Edge Config rate limiting
 *   - Redis-based rate limiting (e.g., @upstash/ratelimit)
 *   - Simple in-memory rate limiting for development
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read API key from server environment
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    console.error("[/api/generate-voice] ELEVENLABS_API_KEY not configured");
    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error: API key not set",
      },
      { status: 500 }
    );
  }

  // Parse and validate request body
  let body: GenerateVoiceRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body",
      },
      { status: 400 }
    );
  }

  const { text, voice_id } = body;

  // Validation: text is required
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Text is required and must be a string",
      },
      { status: 400 }
    );
  }

  // Validation: text length bounds
  const trimmedText = text.trim();
  if (trimmedText.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: "Text cannot be empty",
      },
      { status: 400 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH.toLocaleString()} characters`,
      },
      { status: 400 }
    );
  }

  // Validation: voice_id is required
  if (!voice_id || typeof voice_id !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Voice ID is required and must be a string",
      },
      { status: 400 }
    );
  }

  // TODO: Rate limiting implementation
  // Consider tracking requests per IP address or authenticated user
  // Example with @upstash/ratelimit:
  // const identifier = request.ip ?? "anonymous";
  // const { success: allowed } = await ratelimit.limit(identifier);
  // if (!allowed) {
  //   return NextResponse.json(
  //     { success: false, error: "Rate limit exceeded" },
  //     { status: 429 }
  //   );
  // }

  try {
    console.log(
      `[/api/generate-voice] Generating speech: ${text.length} chars, voice: ${voice_id}`
    );

    const audioBuffer = await generateSpeech(apiKey, trimmedText, voice_id);

    // Return audio as blob with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        // Cache audio for 1 hour - same text/voice will return cached response
        "Cache-Control": "private, max-age=3600",
        // Suggest filename for downloads
        "Content-Disposition": 'inline; filename="generated-audio.mp3"',
      },
    });
  } catch (error) {
    console.error("[/api/generate-voice] Error generating speech:", error);

    if (error instanceof ElevenLabsError) {
      const statusCode = error.statusCode || 500;

      // Map ElevenLabs errors to user-friendly messages
      let clientMessage: string;
      switch (statusCode) {
        case 401:
          clientMessage = "Authentication failed with speech service";
          break;
        case 422:
          clientMessage =
            "Invalid request: please check your text and try again";
          break;
        case 429:
          clientMessage =
            "Speech service rate limit exceeded, please try again later";
          break;
        default:
          clientMessage = "Failed to generate speech";
      }

      return NextResponse.json(
        {
          success: false,
          error: clientMessage,
        },
        { status: statusCode >= 500 ? 500 : statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while generating speech",
      },
      { status: 500 }
    );
  }
}
