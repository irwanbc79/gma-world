import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { api } from '../lib/config';

export default function BlogPreview() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog?limit=3').then((r) => setPosts(r.data.slice(0, 3))).finally(() => setLoading(false));
  }, []);

  const lang = i18n.language === 'en' ? 'en' : 'id';

  return (
    <section className="gma-section bg-[hsl(var(--surface))]" id="blog">
      <div className="gma-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="gma-overline mb-4">{t('blog.overline')}</div>
            <h2 className="gma-h2">{t('blog.title')}</h2>
          </div>
          <Link to="/blog" className="gma-btn gma-btn-ghost self-start md:self-end" data-testid="blog-view-all">
            {t('blog.viewAll')} <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">{t('blog.loading')}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">{t('blog.noPosts')}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background border border-border hover:border-[hsl(var(--accent))] transition-colors group"
                data-testid={`blog-card-${i}`}
              >
                <Link to={`/blog/${p.slug}`} className="block">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={p.image}
                      alt={lang === 'en' ? p.title_en : p.title_id}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] font-semibold">
                        {lang === 'en' ? p.category_en : p.category_id}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        <Calendar size={11} />
                        {new Date(p.published_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold leading-tight mb-3 group-hover:text-[hsl(var(--accent))] transition-colors">
                      {lang === 'en' ? p.title_en : p.title_id}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3">
                      {lang === 'en' ? p.excerpt_en : p.excerpt_id}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] uppercase tracking-wider">
                      {t('blog.readMore')} <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
