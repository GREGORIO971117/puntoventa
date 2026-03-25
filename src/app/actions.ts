'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Por favor, llena todos los campos.' };
  }

  // Truco: Convertimos el usuario en un correo interno válido para Supabase
  const email = `${username.toLowerCase().trim()}@galindos.local`;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Usuario o contraseña incorrectos.' };
  }

  // Si todo sale bien, lo mandamos a la terminal de ventas (que crearemos después)
  redirect('/ventas');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}