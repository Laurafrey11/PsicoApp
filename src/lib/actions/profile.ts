'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ProfileFormData {
  fullName: string;
  therapistName?: string;
  timezone?: string;
  locale?: string;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function updateProfile(formData: ProfileFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      therapist_name: formData.therapistName || null,
      timezone: formData.timezone || 'America/Argentina/Buenos_Aires',
      locale: formData.locale || 'es',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return { error: 'Error al actualizar el perfil' };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  if (error) {
    return { error: 'Error al completar onboarding' };
  }

  return { success: true };
}
