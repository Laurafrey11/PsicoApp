# Ego-Core (PsicoApp)

Bio-Hacking Emocional & Seguimiento Terapéutico con IA.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth & DB**: Supabase (PostgreSQL + RLS)
- **IA**: OpenAI API (GPT-4o) + Vercel AI SDK
- **UI**: Tailwind CSS + Componentes custom
- **i18n**: next-intl (ES/EN)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Documentation

See `CONTEXT.md` for architecture details and project status.
