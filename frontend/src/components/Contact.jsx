import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { api, COMPANY } from '../lib/config';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact', form);
      toast.success(t('contact.form.success'));
      setForm({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
    } catch {
      toast.error(t('contact.form.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="gma-section bg-[hsl(var(--surface))]" id="contact">
      <div className="gma-container">
        <div className="max-w-3xl mb-12">
          <div className="gma-overline mb-4">{t('contact.overline')}</div>
          <h2 className="gma-h2 mb-4">{t('contact.title')}</h2>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{t('contact.desc')}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-background border border-border p-6 md:p-10"
          >
            <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.name')} *
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  data-testid="contact-form-name"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.email')} *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  data-testid="contact-form-email"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.phone')}
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  data-testid="contact-form-phone"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.company')}
                </label>
                <input
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  data-testid="contact-form-company"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.subject')} *
                </label>
                <input
                  required
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  data-testid="contact-form-subject"
                  className="w-full mt-2 bg-transparent border-b-2 border-border focus:border-[hsl(var(--accent))] outline-none py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))]">
                  {t('contact.form.message')} *
                </label>
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  data-testid="contact-form-message"
                  className="w-full mt-2 bg-transparent border-2 border-border focus:border-[hsl(var(--accent))] outline-none p-3 text-sm resize-none"
                />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="contact-form-submit"
                  className="gma-btn gma-btn-primary disabled:opacity-60"
                >
                  {sending ? t('contact.form.sending') : t('contact.form.submit')}
                  <Send size={16} />
                </button>
                <a
                  href={`https://wa.me/${COMPANY.phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-whatsapp"
                  className="gma-btn gma-btn-ghost"
                >
                  <MessageSquare size={16} /> {t('contact.whatsapp')}
                </a>
              </div>
            </form>
          </motion.div>

          {/* Info + Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-5"
          >
            <div className="bg-[hsl(var(--primary))] text-white p-6 md:p-8 space-y-5">
              <InfoRow icon={<Phone size={18} />} label={t('contact.phoneLabel')} value={COMPANY.phone} href={`tel:${COMPANY.phoneDigits}`} />
              <InfoRow icon={<Mail size={18} />} label={t('contact.emailLabel')} value={COMPANY.email} href={`mailto:${COMPANY.email}`} />
              <InfoRow icon={<MapPin size={18} />} label={t('contact.addressLabel')} value={t('contact.address')} href={COMPANY.mapsLink} />
            </div>

            <div className="relative aspect-[4/3] bg-[hsl(var(--surface-alt))] overflow-hidden border border-border" data-testid="contact-map">
              <iframe
                title={t('contact.mapTitle')}
                src={COMPANY.mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, value, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
      <span className="w-11 h-11 bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--accent))] transition-colors">
        {icon}
      </span>
      <span className="block">
        <span className="block text-[10px] uppercase tracking-widest opacity-60 mb-1">{label}</span>
        <span className="block font-semibold text-sm leading-snug">{value}</span>
      </span>
    </a>
  );
}
