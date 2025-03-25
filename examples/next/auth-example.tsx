// examples/next/auth-example.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useNextAuth } from 'pubflow/next';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useNextAuth({
    redirectIfAuthenticated: true
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      
      {formError && <div className="error-message">{formError}</div>}
      {error && <div className="error-message">{error.message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}