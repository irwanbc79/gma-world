import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth';
import SEO from '../components/SEO';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: 'admin@gma.co.id', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      nav('/admin');
    } catch (e) {
      const d = e.response?.data?.detail;
      setErr(typeof d === 'string' ? d : t('admin.login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title={t('admin.login.heading')} />
      <section className="min-h-screen flex items-center pt-24 pb-20 bg-[hsl(var(--surface))]">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-background border border-border p-8 md:p-10">
            <div className="gma-overline mb-3">{t('admin.title')}</div>
            <h1 className="font-display text-3xl font-semibold mb-2">{t('admin.login.heading')}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">{t('admin.login.sub')}</p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('admin.login.email')}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="admin-login-email"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('admin.login.password')}
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  data-testid="admin-login-password"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2"
                />
              </div>
              {err && <div className="text-sm text-[hsl(var(--destructive))]" data-testid="admin-login-error">{err}</div>}
              <button
                type="submit"
                disabled={loading}
                data-testid="admin-login-submit"
                className="gma-btn gma-btn-primary w-full justify-center disabled:opacity-60"
              >
                {loading ? t('admin.login.submitting') : t('admin.login.submit')} <LogIn size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
