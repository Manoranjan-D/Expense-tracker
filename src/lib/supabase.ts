import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env } from './env';

// On native, persist the session in AsyncStorage. On web, supabase-js defaults
// to localStorage, so we let it manage storage itself (passing AsyncStorage on
// web would break SSR/export). detectSessionInUrl is enabled only on web to
// complete the OAuth redirect flow.
const isWeb = Platform.OS === 'web';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    ...(isWeb ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
    flowType: 'pkce',
  },
});
