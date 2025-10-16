'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Check if user is authenticated
        const session = await getSession();
        if (session) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to create events
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  className="form-input pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="form-input pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 h-4 w-4 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create one here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

