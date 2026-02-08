'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { EmotionType } from '@/types/database';

export interface MoodFormData {
  moodScore: number;
  energyLevel: number;
  anxietyLevel: number;
  sleepQuality: number;
  primaryEmotion: EmotionType | null;
  notes: string;
}

export interface MoodResult {
  success?: boolean;
  error?: string;
}

export async function saveMoodEntry(data: MoodFormData): Promise<MoodResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase.from('mood_entries').insert({
    user_id: user.id,
    mood_score: data.moodScore,
    energy_level: data.energyLevel,
    anxiety_level: data.anxietyLevel,
    sleep_quality: data.sleepQuality,
    primary_emotion: data.primaryEmotion,
    notes: data.notes || null,
    recorded_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving mood:', error);
    return { error: 'Error al guardar el registro' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/mood');

  return { success: true };
}

export async function getTodayMood() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', today.toISOString())
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function getRecentMoods(days: number = 7) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });

  return data || [];
}
