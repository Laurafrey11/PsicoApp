'use server';

import { createClient } from '@/lib/supabase/server';

export interface MoodDataPoint {
  date: string;
  mood: number;
  energy: number;
  anxiety: number;
  sleep: number;
}

export interface EmotionCount {
  emotion: string;
  count: number;
}

export interface WeeklyStats {
  avgMood: number;
  avgEnergy: number;
  avgAnxiety: number;
  avgSleep: number;
  totalEntries: number;
  moodTrend: 'up' | 'down' | 'stable';
  bestDay: string | null;
  worstDay: string | null;
}

export async function getMoodHistory(days: number = 30): Promise<MoodDataPoint[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('mood_entries')
    .select('mood_score, energy_level, anxiety_level, sleep_quality, recorded_at')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (!data) return [];

  // Group by date and calculate daily averages
  const groupedByDate = data.reduce((acc, entry) => {
    const date = new Date(entry.recorded_at).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    });

    if (!acc[date]) {
      acc[date] = { mood: [], energy: [], anxiety: [], sleep: [] };
    }

    acc[date].mood.push(entry.mood_score);
    if (entry.energy_level) acc[date].energy.push(entry.energy_level);
    if (entry.anxiety_level) acc[date].anxiety.push(entry.anxiety_level);
    if (entry.sleep_quality) acc[date].sleep.push(entry.sleep_quality);

    return acc;
  }, {} as Record<string, { mood: number[]; energy: number[]; anxiety: number[]; sleep: number[] }>);

  return Object.entries(groupedByDate).map(([date, values]) => ({
    date,
    mood: Math.round(values.mood.reduce((a, b) => a + b, 0) / values.mood.length * 10) / 10,
    energy: values.energy.length > 0
      ? Math.round(values.energy.reduce((a, b) => a + b, 0) / values.energy.length * 10) / 10
      : 0,
    anxiety: values.anxiety.length > 0
      ? Math.round(values.anxiety.reduce((a, b) => a + b, 0) / values.anxiety.length * 10) / 10
      : 0,
    sleep: values.sleep.length > 0
      ? Math.round(values.sleep.reduce((a, b) => a + b, 0) / values.sleep.length * 10) / 10
      : 0,
  }));
}

export async function getEmotionDistribution(days: number = 30): Promise<EmotionCount[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('mood_entries')
    .select('primary_emotion')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString())
    .not('primary_emotion', 'is', null);

  if (!data) return [];

  const counts = data.reduce((acc, entry) => {
    const emotion = entry.primary_emotion as string;
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getWeeklyStats(): Promise<WeeklyStats | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const prevStartDate = new Date();
  prevStartDate.setDate(prevStartDate.getDate() - 14);

  // Current week
  const { data: currentData } = await supabase
    .from('mood_entries')
    .select('mood_score, energy_level, anxiety_level, sleep_quality, recorded_at')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString());

  // Previous week for trend
  const { data: prevData } = await supabase
    .from('mood_entries')
    .select('mood_score')
    .eq('user_id', user.id)
    .gte('recorded_at', prevStartDate.toISOString())
    .lt('recorded_at', startDate.toISOString());

  if (!currentData || currentData.length === 0) {
    return null;
  }

  const avgMood = currentData.reduce((sum, e) => sum + e.mood_score, 0) / currentData.length;
  const avgEnergy = currentData.filter(e => e.energy_level).reduce((sum, e) => sum + (e.energy_level || 0), 0) /
    (currentData.filter(e => e.energy_level).length || 1);
  const avgAnxiety = currentData.filter(e => e.anxiety_level).reduce((sum, e) => sum + (e.anxiety_level || 0), 0) /
    (currentData.filter(e => e.anxiety_level).length || 1);
  const avgSleep = currentData.filter(e => e.sleep_quality).reduce((sum, e) => sum + (e.sleep_quality || 0), 0) /
    (currentData.filter(e => e.sleep_quality).length || 1);

  // Calculate trend
  let moodTrend: 'up' | 'down' | 'stable' = 'stable';
  if (prevData && prevData.length > 0) {
    const prevAvg = prevData.reduce((sum, e) => sum + e.mood_score, 0) / prevData.length;
    if (avgMood > prevAvg + 0.5) moodTrend = 'up';
    else if (avgMood < prevAvg - 0.5) moodTrend = 'down';
  }

  // Find best and worst days
  const dayAverages = currentData.reduce((acc, entry) => {
    const day = new Date(entry.recorded_at).toLocaleDateString('es-AR', { weekday: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry.mood_score);
    return acc;
  }, {} as Record<string, number[]>);

  let bestDay: string | null = null;
  let worstDay: string | null = null;
  let bestAvg = 0;
  let worstAvg = 11;

  for (const [day, scores] of Object.entries(dayAverages)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = day;
    }
  }

  return {
    avgMood: Math.round(avgMood * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgAnxiety: Math.round(avgAnxiety * 10) / 10,
    avgSleep: Math.round(avgSleep * 10) / 10,
    totalEntries: currentData.length,
    moodTrend,
    bestDay,
    worstDay,
  };
}

export async function getDefenseMechanismsStats(days: number = 30) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('stress_logs')
    .select('defense_mechanism')
    .eq('user_id', user.id)
    .gte('occurred_at', startDate.toISOString())
    .not('defense_mechanism', 'is', null);

  if (!data) return [];

  const counts = data.reduce((acc, entry) => {
    const mechanism = entry.defense_mechanism as string;
    acc[mechanism] = (acc[mechanism] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([mechanism, count]) => ({ mechanism, count }))
    .sort((a, b) => b.count - a.count);
}
