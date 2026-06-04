import { supabase } from './supabase';

export async function signUp({ email, password, firstName, lastName, phone }: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<string | undefined> {
  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      }
    }
  })

  if (error) {
    console.error(`[signUp] ${error.code} ${error.message}`);
    console.debug(`[signUp] ${error}`);
    return error.message;
  }
}

export async function signIn({ email, password }: {
  email: string;
  password: string;
}): Promise<string | undefined> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    console.error(`[signIn] ${error.code} ${error.message}`);
    console.debug(`[signUp] ${error}`);
    return error.message;
  }
}

export async function signInWithGoogle(): Promise<string | undefined> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error(`[signInWithGoogle] ${error.code} ${error.message}`);
    console.debug(`[signUp] ${error}`);
    return error.message;
  }
}