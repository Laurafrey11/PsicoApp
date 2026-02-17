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
  // Stress fields
  estres?: number;
  situacion?: string;
  sintomas?: string;
  pensamientos?: string;
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

    // Insert mood entries
    const moodData = entries.map((entry) => ({
      user_id: ANONYMOUS_USER_ID,
      mood_score: entry.animo,
      energy_level: entry.energia ?? null,
      anxiety_level: entry.ansiedad ?? null,
      sleep_quality: entry.sueno ?? null,
      primary_emotion: entry.emocion ?? null,
      notes: entry.notas ?? null,
      recorded_at: new Date(entry.fecha).toISOString(),
    }));

    const { error: moodError } = await supabase.from('mood_entries').insert(moodData);

    if (moodError) {
      console.error('Error importing mood entries:', moodError);
      return NextResponse.json({ imported: 0, errors: [moodError.message] });
    }

    // Insert stress logs for entries that have stress data
    const stressEntries = entries.filter((e) => e.estres || e.situacion);
    let stressImported = 0;

    if (stressEntries.length > 0) {
      const stressData = stressEntries.map((entry) => {
        // Parse symptoms: comma-separated string → array
        const symptoms = entry.sintomas
          ? entry.sintomas.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        return {
          user_id: ANONYMOUS_USER_ID,
          intensity: entry.estres || 5,
          situation: entry.situacion || entry.notas || 'Importado desde CSV',
          physical_symptoms: symptoms,
          thoughts: entry.pensamientos || null,
          occurred_at: new Date(entry.fecha).toISOString(),
        };
      });

      const { error: stressError } = await supabase.from('stress_logs').insert(stressData);

      if (stressError) {
        console.error('Error importing stress logs:', stressError);
        // Don't fail the whole import, mood was already saved
        return NextResponse.json({
          imported: entries.length,
          stressImported: 0,
          errors: [`Ánimo importado OK. Error en estrés: ${stressError.message}`],
        });
      }

      stressImported = stressEntries.length;
    }

    return NextResponse.json({
      imported: entries.length,
      stressImported,
      errors: [],
    });
  } catch (err) {
    console.error('Import CSV error:', err);
    return NextResponse.json({ imported: 0, errors: ['Error interno del servidor'] });
  }
}
