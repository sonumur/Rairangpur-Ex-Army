import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import './AdminAuthContext.css';

const AdminAuthContext = createContext(null);

const getAdminEmail = () => (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }

  return context;
};

const AdminLogin = () => {
  const { login, isConfigured, isSubmitting } = useAdminAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error || 'Access denied. Please check your admin credentials.');
    }
  };

  if (!isConfigured) {
    return (
      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-auth-badge">Private Area</p>
          <h1>Supabase admin access is not configured yet</h1>
          <p className="admin-auth-copy">
            Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_EMAIL`
            in `.env.local`, then restart the app.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-auth-shell">
      <div className="admin-auth-card">
        <p className="admin-auth-badge">Private Area</p>
        <h1>Admin sign in</h1>
        <p className="admin-auth-copy">
          Sign in with your approved Supabase account to open the private panel.
        </p>
        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label className="admin-auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, email: event.target.value }));
                setError('');
              }}
              required
            />
          </label>
          <label className="admin-auth-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, password: event.target.value }));
                setError('');
              }}
              required
            />
          </label>
          {error ? <p className="admin-auth-error">{error}</p> : null}
          <button type="submit" className="btn-primary admin-auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </section>
  );
};

export const AdminAuthProvider = ({ children }) => {
  const [adminEmail] = useState(getAdminEmail);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to restore Supabase session:', error.message);
      }

      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isOwner = Boolean(user?.email && adminEmail && user.email.toLowerCase() === adminEmail);

  const value = useMemo(() => ({
    isConfigured: Boolean(isSupabaseConfigured && adminEmail),
    isAuthenticated: isOwner,
    isLoading: loading,
    isSubmitting,
    login: async (email, password) => {
      if (!supabase || !isSupabaseConfigured || !adminEmail) {
        return {
          success: false,
          error: 'Supabase admin access is not configured yet.',
        };
      }

      setIsSubmitting(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const signedInEmail = data.user?.email?.toLowerCase() || '';

        if (signedInEmail !== adminEmail) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'This account is not allowed to access the admin panel.',
          };
        }

        return { success: true };
      } finally {
        setIsSubmitting(false);
      }
    },
    logout: async () => {
      if (!supabase) {
        return;
      }

      await supabase.auth.signOut();
    },
  }), [adminEmail, isOwner, isSubmitting, loading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const AdminGate = ({ children }) => {
  const { isAuthenticated, isConfigured, isLoading } = useAdminAuth();

  if (isAuthenticated) {
    return children;
  }

  if (!isConfigured) {
    return <AdminLogin />;
  }

  if (isLoading) {
    return (
      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-auth-badge">Private Area</p>
          <h1>Checking access...</h1>
          <p className="admin-auth-copy">Restoring your secure session.</p>
        </div>
      </section>
    );
  }

  return <AdminLogin />;
};
