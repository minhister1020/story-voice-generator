# Story Voice Generator

AI text-to-speech app powered by ElevenLabs. Transform your stories into natural-sounding speech.

## Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/minhister1020/story-voice-generator.git
   cd story-voice-generator
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Add your [ElevenLabs API key](https://elevenlabs.io/) to `.env.local`

3. **Run:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add `ELEVENLABS_API_KEY` environment variable
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/minhister1020/story-voice-generator&env=ELEVENLABS_API_KEY)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- ElevenLabs API

## Author

**Minh Bui** - [GitHub](https://github.com/minhister1020)

## License

MIT
