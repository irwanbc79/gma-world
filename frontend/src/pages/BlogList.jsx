import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, Tag, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import { blogPosts, getCategoryList } from '../data/blogPosts';

const POSTS_PER_PAGE = 9;

function ReadTime({ minutes, lang }) {
  return (
    <span className="flex items-center gap-1">
      <Clock size={11} />
      {lang === 'en' ? `${minutes} min read` : `${minutes} menit baca`}
    </span>
  );
}

function PostCard({ post, lang, index }) {
  const title = lang === 'en' ? post.title_en : post.title_id;
  const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_id;
  const category = lang === 'en' ? post.category_en : post.category_id;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % POSTS_PER_PAGE) * 0.05 }}
      className="group border border-border hover:border-[hsl(var(--accent))] transition-all duration-300 bg-background flex flex-col"
      data-testid={`blog-card-${post.id}`}
    >
      <Link to={`/blog/${post.slug}`} className="flex flex-col flex-1">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] font-bold">
              {category}
            </span>
            <span className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(post.published_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
              <span>·</span>
              <ReadTime minutes={post.read_time} lang={lang} />
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-tight mb-3 group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">
            {lang === 'en' ? 'Read more' : 'Baca selengkapnya'} <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function FeaturedCard({ post, lang }) {
  const title = lang === 'en' ? post.title_en : post.title_id;
  const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_id;
  const category = lang === 'en' ? post.category_en : post.category_id;
  return (
    <Link to={`/blog/${post.slug}`} className="group block" data-testid="blog-featured">
      <div className="grid md:grid-cols-2 gap-0 border border-border hover:border-[hsl(var(--accent))] transition-all duration-300 bg-background">
        <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
          <img
            src={post.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="gma-overline mb-3">{category}</div>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-4 group-hover:text-[hsl(var(--accent))] transition-colors">
            {title}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-6 line-clamp-4">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] mb-6">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.published_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {lang === 'en' ? `${post.read_time} min read` : `${post.read_time} menit baca`}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[hsl(var(--accent))]">
            {lang === 'en' ? 'Read article' : 'Baca artikel'} <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'id';

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => getCategoryList(lang), [lang]);

  const filtered = useMemo(() => {
    let list = blogPosts;
    if (activeCategory) {
      list = list.filter(p => (lang === 'en' ? p.category_en : p.category_id) === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const title = lang === 'en' ? p.title_en : p.title_id;
        const excerpt = lang === 'en' ? p.excerpt_en : p.excerpt_id;
        const tags = lang === 'en' ? p.tags_en : p.tags_id;
        return title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q) || tags.some(tg => tg.includes(q));
      });
    }
    return list;
  }, [search, activeCategory, lang]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const totalPages = Math.ceil(rest.length / POSTS_PER_PAGE);
  const paginated = rest.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleCategory = (cat) => {
    setActiveCategory(prev => prev === cat ? '' : cat);
    setPage(1);
  };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <>
      <SEO
        title={lang === 'en' ? 'Blog — GMA World Insights' : 'Blog — Wawasan GMA World'}
        description={lang === 'en'
          ? 'Insights on international trade, export-import, logistics, and maritime industry from the GMA World team.'
          : 'Wawasan perdagangan internasional, ekspor-impor, logistik, dan industri maritim dari tim GMA World.'}
        lang={lang}
      />

      {/* Hero */}
      <section className="pt-36 pb-14 border-b border-border">
        <div className="gma-container">
          <div className="max-w-3xl">
            <div className="gma-overline mb-4">{t('blog.overline')}</div>
            <h1 className="gma-h1 mb-4">{t('blog.title')}</h1>
            <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed">
              {lang === 'en'
                ? "Expert insights on international trade, export-import regulations, logistics, maritime industry, and Indonesia's commodity markets."
                : 'Insight ahli tentang perdagangan internasional, regulasi ekspor-impor, logistik, industri maritim, dan pasar komoditas Indonesia.'}
            </p>
          </div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="py-8 border-b border-border sticky top-[64px] z-30 bg-background/95 backdrop-blur">
        <div className="gma-container flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              placeholder={lang === 'en' ? 'Search articles…' : 'Cari artikel…'}
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border bg-background focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              data-testid="blog-search"
            />
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                    : 'border-border text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]'
                }`}
                data-testid={`cat-filter-${cat}`}
              >
                <Tag size={10} /> {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="gma-container">
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-[hsl(var(--muted-foreground))]">
              {lang === 'en' ? 'No articles found.' : 'Tidak ada artikel ditemukan.'}
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && !search && !activeCategory && page === 1 && (
                <div className="mb-12">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-[hsl(var(--accent))] mb-4">
                    {lang === 'en' ? '— Featured Article' : '— Artikel Unggulan'}
                  </p>
                  <FeaturedCard post={featured} lang={lang} />
                </div>
              )}

              {/* In-feed ad after featured */}
              {page === 1 && !search && !activeCategory && (
                <AdSlot slot="in-feed" className="mb-6" />
              )}

              {/* Grid */}
              {paginated.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginated.map((post, i) => (
                    <React.Fragment key={post.id}>
                      <PostCard post={post} lang={lang} index={i} />
                      {/* Insert in-feed ad after 5th card */}
                      {i === 4 && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <AdSlot slot="in-feed" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Search results — show all matches */}
              {(search || activeCategory) && filtered.map((post, i) => (
                <React.Fragment key={post.id}>
                  {i === 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Pagination */}
              {!search && !activeCategory && totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm border border-border disabled:opacity-30 hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {lang === 'en' ? '← Prev' : '← Sebelumnya'}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 text-sm border transition-colors ${
                        page === n
                          ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                          : 'border-border hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm border border-border disabled:opacity-30 hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {lang === 'en' ? 'Next →' : 'Berikutnya →'}
                  </button>
                </div>
              )}

              {/* Below-list ad */}
              <AdSlot slot="in-feed" className="mt-12" desktopOnly />
              <AdSlot slot="mobile-banner" className="mt-8" mobileOnly />
            </>
          )}
        </div>
      </main>
    </>
  );
}
