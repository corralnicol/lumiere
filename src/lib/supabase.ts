import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function makeNoop() {
  const noop = () => ({ data: null, error: null });

  const chainable = () => ({ select: noop, eq: noop, maybeSingle: noop, insert: () => ({ select: noop, single: noop }), update: noop, single: noop });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
    from: (_: string) => chainable(),
  } as unknown as ReturnType<typeof createClient>;
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient<Database>(supabaseUrl, supabaseKey)
    : makeNoop();

if (!supabaseUrl || !supabaseKey) {
  // Do not throw — create a safe noop client so the app can render static pages in dev
  // and provide a clear console warning for the developer.
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set — using noop Supabase client"
  );
}