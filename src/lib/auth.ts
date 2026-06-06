import { supabase } from './supabase';

const EMAIL_NOT_CONFIRMED_MESSAGE = 'Please verify your email before logging in.';

type AuthResult = {
  error?: string;
  message?: string;
};

function isEmailNotConfirmedError(error: { code?: string; message?: string }) {
  const text = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  return text.includes('email_not_confirmed') || text.includes('email not confirmed');
}

function isEmailConfirmed(user: { email_confirmed_at?: string; confirmed_at?: string } | null) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

export async function signUp({ email, password, firstName, lastName, phone }: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/sign-in`,
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
    return { error: error.message };
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  return {
    message: 'Please check your email to verify your account before logging in.',
  };
}

export async function signIn({ email, password }: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    console.error(`[signIn] ${error.code} ${error.message}`);
    console.debug(`[signIn] ${error}`);
    return {
      error: isEmailNotConfirmedError(error) ? EMAIL_NOT_CONFIRMED_MESSAGE : error.message,
    };
  }

  if (!isEmailConfirmed(data.user)) {
    await supabase.auth.signOut();
    return { error: EMAIL_NOT_CONFIRMED_MESSAGE };
  }

  return {};
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
    console.debug(`[signInWithGoogle] ${error}`);
    return error.message;
  }
}
