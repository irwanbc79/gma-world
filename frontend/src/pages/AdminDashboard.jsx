import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Inbox, LogOut, Home, Plus, Trash2, Pencil, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth';
import { api } from '../lib/config';
import SEO from '../components/SEO';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('blog');

  if (loading) return <div className="pt-36 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return (
    <>
      <SEO title="Admin Dashboard" />
      <div className="min-h-screen flex bg-[hsl(var(--surface))]">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col bg-[hsl(var(--primary))] text-white fixed inset-y-0 left-0 z-40">
          <div className="p-6 border-b border-white/10">
            <div className="font-display text-2xl font-semibold">GMA</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{t('admin.title')}</div>
          </div>
          <nav className="p-4 flex-1">
            <button
              onClick={() => setTab('blog')}
              data-testid="admin-nav-blog"
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                tab === 'blog' ? 'bg-[hsl(var(--accent))]' : 'hover:bg-white/5'
              }`}
            >
              <FileText size={16} /> {t('admin.dashboard.navBlog')}
            </button>
            <button
              onClick={() => setTab('contacts')}
              data-testid="admin-nav-contacts"
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                tab === 'contacts' ? 'bg-[hsl(var(--accent))]' : 'hover:bg-white/5'
              }`}
            >
              <Inbox size={16} /> {t('admin.dashboard.navContacts')}
            </button>
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
              <Home size={16} /> {t('admin.dashboard.backToSite')}
            </Link>
            <button
              onClick={logout}
              data-testid="admin-logout"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
            >
              <LogOut size={16} /> {t('admin.dashboard.logout')}
            </button>
          </div>
        </aside>

        <div className="flex-1 md:ml-64">
          {/* Top bar */}
          <div className="bg-background border-b border-border p-4 md:p-6 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{t('admin.dashboard.welcome')}, </span>
              <span className="font-semibold">{user.name || user.email}</span>
            </div>
            {/* Mobile nav */}
            <div className="md:hidden flex gap-2">
              <button onClick={() => setTab('blog')} className={`p-2 ${tab === 'blog' ? 'bg-[hsl(var(--accent))] text-white' : ''}`}>
                <FileText size={16} />
              </button>
              <button onClick={() => setTab('contacts')} className={`p-2 ${tab === 'contacts' ? 'bg-[hsl(var(--accent))] text-white' : ''}`}>
                <Inbox size={16} />
              </button>
              <button onClick={logout} className="p-2"><LogOut size={16} /></button>
            </div>
          </div>

          <main className="p-4 md:p-8">
            {tab === 'blog' ? <BlogManager /> : <ContactsManager />}
          </main>
        </div>
      </div>
    </>
  );
}

// ═══ Blog Manager ═══
function BlogManager() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/admin/blog').then((r) => setPosts(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm(t('admin.blog.confirmDelete'))) return;
    await api.delete(`/admin/blog/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">{t('admin.blog.heading')}</h1>
        <button onClick={() => setEditing({})} data-testid="admin-blog-new" className="gma-btn gma-btn-primary">
          <Plus size={16} /> {t('admin.blog.new')}
        </button>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--surface-alt))]">
            <tr>
              <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">Title (EN)</th>
              <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">Category</th>
              <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">Date</th>
              <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">Status</th>
              <th className="text-right p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-4 font-semibold">{p.title_en}</td>
                <td className="p-4 text-[hsl(var(--muted-foreground))]">{p.category_en}</td>
                <td className="p-4 text-[hsl(var(--muted-foreground))]">{new Date(p.published_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${p.published ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} data-testid={`admin-blog-edit-${p.id}`} className="p-2 hover:text-[hsl(var(--accent))]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(p.id)} data-testid={`admin-blog-delete-${p.id}`} className="p-2 hover:text-[hsl(var(--destructive))]">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <BlogEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function BlogEditor({ initial, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title_id: '', title_en: '', excerpt_id: '', excerpt_en: '',
    content_id: '', content_en: '', category_id: '', category_en: '',
    image: '', author: 'GMA Editorial', published: true,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await api.put(`/admin/blog/${initial.id}`, form);
      else await api.post('/admin/blog', form);
      toast.success('Saved');
      onSaved();
    } catch (e) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onChg = (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: v });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-background border border-border max-w-3xl w-full my-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-semibold">{isEdit ? t('admin.blog.edit') : t('admin.blog.new')}</h2>
          <button onClick={onClose} className="p-2"><X size={18} /></button>
        </div>
        <form onSubmit={save} className="p-6 grid md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          <Field label={t('admin.blog.titleId')} name="title_id" value={form.title_id} onChange={onChg} required />
          <Field label={t('admin.blog.titleEn')} name="title_en" value={form.title_en} onChange={onChg} required />
          <Field label={t('admin.blog.categoryId')} name="category_id" value={form.category_id} onChange={onChg} required />
          <Field label={t('admin.blog.categoryEn')} name="category_en" value={form.category_en} onChange={onChg} required />
          <Field className="md:col-span-2" label={t('admin.blog.image')} name="image" value={form.image} onChange={onChg} required />
          <Field className="md:col-span-2" label={t('admin.blog.excerptId')} name="excerpt_id" value={form.excerpt_id} onChange={onChg} required textarea rows={2} />
          <Field className="md:col-span-2" label={t('admin.blog.excerptEn')} name="excerpt_en" value={form.excerpt_en} onChange={onChg} required textarea rows={2} />
          <Field className="md:col-span-2" label={t('admin.blog.contentId')} name="content_id" value={form.content_id} onChange={onChg} required textarea rows={6} />
          <Field className="md:col-span-2" label={t('admin.blog.contentEn')} name="content_en" value={form.content_en} onChange={onChg} required textarea rows={6} />
          <Field label={t('admin.blog.author')} name="author" value={form.author} onChange={onChg} />
          <label className="flex items-center gap-3 self-end">
            <input type="checkbox" name="published" checked={form.published} onChange={onChg} /> {t('admin.blog.published')}
          </label>
          <div className="md:col-span-2 flex gap-3 pt-2 border-t border-border">
            <button type="submit" disabled={saving} data-testid="admin-blog-save" className="gma-btn gma-btn-primary disabled:opacity-60">{t('admin.blog.save')}</button>
            <button type="button" onClick={onClose} className="gma-btn gma-btn-ghost">{t('admin.blog.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, className = '', textarea, rows = 3, ...props }) {
  return (
    <div className={className}>
      <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
        {label}
      </label>
      {textarea ? (
        <textarea {...props} rows={rows} className="w-full mt-2 bg-transparent border-2 border-border focus:border-[hsl(var(--accent))] outline-none p-3 text-sm resize-none" />
      ) : (
        <input {...props} className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm" />
      )}
    </div>
  );
}

// ═══ Contacts Manager ═══
function ContactsManager() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [viewing, setViewing] = useState(null);

  const load = () => api.get('/admin/contacts').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await api.delete(`/admin/contacts/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">{t('admin.contacts.heading')}</h1>
      <div className="bg-background border border-border overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">{t('admin.contacts.empty')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--surface-alt))]">
              <tr>
                <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.name')}</th>
                <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.email')}</th>
                <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.subject')}</th>
                <th className="text-left p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.date')}</th>
                <th className="text-right p-4 font-semibold uppercase text-xs tracking-wider">{t('admin.contacts.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className={`border-t border-border ${!c.read ? 'bg-[hsl(var(--accent))]/5' : ''}`}>
                  <td className="p-4 font-semibold">{c.name}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{c.email}</td>
                  <td className="p-4">{c.subject}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setViewing(c)} className="p-2 hover:text-[hsl(var(--accent))]"><Eye size={14} /></button>
                    <button onClick={() => remove(c.id)} className="p-2 hover:text-[hsl(var(--destructive))]"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-background border border-border max-w-xl w-full p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-semibold">{viewing.subject}</h2>
              <button onClick={() => setViewing(null)} className="p-2"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-[hsl(var(--muted-foreground))]">From:</span> <strong>{viewing.name}</strong> &lt;{viewing.email}&gt;</div>
              {viewing.phone && <div><span className="text-[hsl(var(--muted-foreground))]">Phone:</span> {viewing.phone}</div>}
              {viewing.company && <div><span className="text-[hsl(var(--muted-foreground))]">Company:</span> {viewing.company}</div>}
              <div><span className="text-[hsl(var(--muted-foreground))]">Date:</span> {new Date(viewing.created_at).toLocaleString()}</div>
              <div className="pt-4 border-t border-border whitespace-pre-wrap leading-relaxed">{viewing.message}</div>
              <div className="pt-4 flex gap-3">
                <a href={`mailto:${viewing.email}?subject=Re: ${viewing.subject}`} className="gma-btn gma-btn-primary">Reply Email</a>
                {viewing.phone && <a href={`https://wa.me/${viewing.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="gma-btn gma-btn-ghost">WhatsApp</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
