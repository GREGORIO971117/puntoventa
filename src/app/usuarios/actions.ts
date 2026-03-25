'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createNormalClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ⚠️ ESTE ES EL CLIENTE ADMINISTRADOR (Usa la llave secreta para saltarse la seguridad normal)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function guardarUsuario(formData: FormData) {
  const id = formData.get('id') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const rol = formData.get('rol') as string;
  const sucursal_id = formData.get('sucursal_id') as string || null;

  if (id) {
    // 🔵 MODO EDICIÓN
    // 1. Si escribió una contraseña nueva, la actualizamos en la bóveda
    if (password && password.trim() !== '') {
      const { error: errPass } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
      if (errPass) return { error: 'No se pudo actualizar la contraseña.' };
    }

    // 2. Actualizamos su rol y sucursal en nuestra tabla pública
    const { error: errPerfil } = await supabaseAdmin.from('perfiles')
      .update({ rol, sucursal_id })
      .eq('id', id);

    if (errPerfil) return { error: 'No se pudo actualizar el perfil.' };

  } else {
    // 🟢 MODO CREACIÓN
    if (!password) return { error: 'La contraseña es obligatoria para usuarios nuevos.' };

    const emailOculto = `${username.toLowerCase().trim()}@galindos.local`;

    // 1. Creamos el usuario en la bóveda de Supabase saltando el correo de confirmación
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailOculto,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error Auth:", authError);
      return { error: 'No se pudo crear el usuario. ¿Quizás el nombre de usuario ya existe?' };
    }

    // 2. Lo registramos en nuestra tabla de perfiles
    const { error: errPerfil } = await supabaseAdmin.from('perfiles').insert({
      id: authData.user.id,
      username: username.toLowerCase().trim(),
      rol,
      sucursal_id,
    });

    if (errPerfil) return { error: 'Usuario creado en bóveda, pero falló el perfil.' };
  }

  revalidatePath('/usuarios');
  return { success: true };
}

export async function eliminarUsuario(id: string) {
  // Al borrarlo de la bóveda (auth), la base de datos borrará automáticamente 
  // su registro en la tabla "perfiles" gracias al "ON DELETE CASCADE" que configuramos en SQL.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error("Error al eliminar usuario:", error);
    return { error: 'No se pudo eliminar el usuario.' };
  }

  revalidatePath('/usuarios');
  return { success: true };
}