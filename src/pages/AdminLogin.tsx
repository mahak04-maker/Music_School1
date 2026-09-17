import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Loader2, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message === 'User already registered'
          ? 'An account with this email already exists. Please sign in instead.'
          : 'Could not create account. Please try again.');
        return;
      }
      // After signup, Supabase auto-creates a session (email confirmation is off)
      navigate('/admin');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError('Incorrect email or password');
      } else {
        navigate('/admin');
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-gradient-to-br from-stone-800 to-stone-900 text-white">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <Music className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Harmony Music School</h1>
              <p className="text-stone-300 text-sm">Owner Access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5"
          >
            <h2 className="text-lg font-bold text-stone-800">
              {mode === 'login' ? 'Sign in to manage classes' : 'Create owner account'}
            </h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="owner@harmony.school"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                className="w-full text-base rounded-xl border border-stone-200 px-3 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 text-stone-900 font-bold text-base py-3 rounded-xl hover:bg-amber-300 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            {mode === 'login' ? (
              <>
                No account yet?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="font-semibold text-amber-600 hover:text-amber-700"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-semibold text-amber-600 hover:text-amber-700"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-sm text-stone-400 mt-2">
            <button onClick={() => navigate('/')} className="hover:text-stone-600">
              ← Back to public schedule
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
