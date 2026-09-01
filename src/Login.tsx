import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './lib/api';
import { cn } from './lib/utils';
import { Shield, Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Failed to login. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kavach-AI</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to the Responsible AI Governance & Security Platform</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Username</label>
              <input 
                name="username" 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="relative block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm" 
                placeholder="demo" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="relative block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          {error && <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className={cn(
                "group relative flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <Lock className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Authenticating...' : 'Sign in'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Create an account</Link>
            <Link to="/reset-password" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
