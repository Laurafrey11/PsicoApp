import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';

interface CsvEntry {
  fecha: string;
  animo: number;
  energia?: number;
  ansiedad?: number;
  sueno?: number;
  emocion?: string;
  notas?: string;
}

export async function POST(request: Request) {
  try {
    const { entries } = (await request.json()) as { entries: CsvEntry[] };

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ imported: 0, errors: ['No hay datos para importar'] });
    }

    if (entries.length > 500) {
      return NextResponse.json({ imported: 0, errors: ['Máximo 500 registros por importación'] });
    }

    const supabase = createAdminClient();

    const insertData = entries.map((entry) => ({
      user_id: ANONYMOUS_USER_ID,
      mood_score: entry.animo,
      energy_level: entry.energia ?? null,
      anxiety_level: entry.ansiedad ?? null,
      sleep_quality: entry.sueno ?? null,
      primary_emotion: entry.emocion ?? null,
      notes: entry.notas ?? null,
      recorded_at: new Date(entry.fecha).toISOString(),
    }));

    const { error } = await supabase.from('mood_entries').insert(insertData);

    if (error) {
      console.error('Error importing CSV:', error);
      return NextResponse.json({ imported: 0, errors: [error.message] });
    }

    return NextResponse.json({ imported: entries.length, errors: [] });
  } catch (err) {
    console.error('Import CSV error:', err);
    return NextResponse.json({ imported: 0, errors: ['Error interno del servidor'] });
  }
}
