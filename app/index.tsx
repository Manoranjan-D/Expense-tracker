import { Redirect } from 'expo-router';

import { Loading } from '@/components/Loading';
import { env } from '@/lib/env';
import { useAuth } from '@/providers/AuthProvider';

// Entry route: send users to the app or the login screen based on session.
export default function Index() {
  const { session, loading } = useAuth();

  // If Supabase isn't configured yet, the login screen explains setup.
  if (!env.isConfigured) return <Redirect href="/login" />;
  if (loading) return <Loading label="Starting up…" />;
  return <Redirect href={session ? '/(tabs)/dashboard' : '/login'} />;
}
