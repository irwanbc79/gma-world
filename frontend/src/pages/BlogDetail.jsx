import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, User, Share2, Copy, Check, ChevronRight, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import { blogPosts, getRelatedPosts } from '../data/blogPosts';
import { COMPANY } from '../lib/config';

// Parse markdown-style body into sections for TOC
function parseTOC(body) {
  if (!body) return [];
  const headings = [];
  const lines = body.split('\n');
  lines.forEach(line => {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2) headings.push({ level: 2, text: h2[1], id: slugify(h2[1]) });
    else if (h3) headings.push({ level: 3, text: h3[1], id: slugify(h3[1]) });
  });
  return headings;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// Very minimal Markdown → HTML renderer (h2, h3, bold, table, lists, code, paragraphs)
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/^\s+/, '')
    // h2, h3
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugify(t)}" class="gma-h2 mt-12 mb-4 scroll-mt-24">${t}</h2>`)
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugify(t)}" class="font-display text-xl font-bold mt-8 mb-3 scroll-mt-24">${t}</h3>`)
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // table — simplified: detect | lines
    .replace(/(\|.+\|\n)+/g, (table) => {
      const rows = table.trim().split('\n').filter(r => !/^\|[-\s|:]+\|$/.test(r));
      const tableRows = rows.map((row, i) => {
        const cells = row.split('|').filter((_, idx) => idx > 0 && idx < row.split('|').length - 1);
        const tag = i === 0 ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag} class="border border-border px-3 py-2 text-sm text-left">${c.trim()}</${tag}>`).join('')}</tr>`;
      });
      return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-border">${tableRows.join('')}</table></div>`;
    })
    // numbered list
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-5 list-decimal mb-1">$2</li>')
    .replace(/(<li[^>]*>.*<\/li>\n)+/g, m => `<ol class="my-4 space-y-1">${m}</ol>`)
    // bullet list
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-5 list-disc mb-1">$1</li>')
    .replace(/(<li class="ml-5 list-disc[^"]*"[^>]*>.*<\/li>\n)+/g, m => `<ul class="my-4 space-y-1">${m}</ul>`)
    // checkbox list
    .replace(/^- \[ \]\s+(.+)$/gm, '<li class="ml-5 mb-1 flex items-start gap-2"><span class="mt-0.5 w-4 h-4 border border-border inline-block flex-shrink-0"></span><span>$1</span></li>')
    // paragraphs (lines not starting with HTML tags)
    .replace(/^(?!<)(.+)$/gm, (line) => line.trim() ? `<p class="leading-relaxed mb-4">${line}</p>` : '')
    // clean double empty lines
    .replace(/\n{3,}/g, '\n\n');
  return html;
}

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-border">
      <div
        className="h-full bg-[hsl(var(--accent))] transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ShareButtons({ title, lang }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waText = encodeURIComponent(`${title}\n\n${url}`);
  const twText = encodeURIComponent(`${title} ${url}`);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
        <Share2 size={12} /> {lang === 'en' ? 'Share' : 'Bagikan'}
      </span>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-green-500 hover:text-green-500 transition-colors text-xs font-bold"
        title="Share via WhatsApp"
      >
        WA
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${twText}`}
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors text-xs font-bold"
        title="Share on Twitter/X"
      >
        X
      </a>
      <button
        onClick={copyLink}
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
        title={lang === 'en' ? 'Copy link' : 'Salin tautan'}
      >
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function TOC({ headings, lang }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <div className="hidden lg:block sticky top-28 self-start">
      <p className="text-[11px] uppercase tracking-widest font-bold text-[hsl(var(--muted-foreground))] mb-4 flex items-center gap-2">
        <BookOpen size={12} /> {lang === 'en' ? 'Table of Contents' : 'Daftar Isi'}
      </p>
      <nav className="space-y-1">
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-sm leading-snug transition-colors py-0.5 ${
              h.level === 3 ? 'pl-4' : ''
            } ${
              activeId === h.id
                ? 'text-[hsl(var(--accent))] font-semibold'
                : 'text-[hsl(var(--muted-foreground))] hover:text-foreground'
            }`}
          >
            {h.level === 3 && <span className="mr-1 opacity-40">↳</span>}
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'id';

  const post = useMemo(() => blogPosts.find(p => p.slug === slug), [slug]);
  const related = useMemo(() => post ? getRelatedPosts(post.id) : [], [post]);

  if (!post) {
    return (
      <div className="pt-36 pb-20 text-center">
        <p className="mb-5 text-[hsl(var(--muted-foreground))]">
          {lang === 'en' ? 'Article not found.' : 'Artikel tidak ditemukan.'}
        </p>
        <Link to="/blog" className="gma-btn gma-btn-primary">
          {lang === 'en' ? '← Back to Blog' : '← Kembali ke Blog'}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? post.title_en : post.title_id;
  const body = lang === 'en' ? post.body_en : post.body_id;
  const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_id;
  const category = lang === 'en' ? post.category_en : post.category_id;
  const tags = lang === 'en' ? post.tags_en : post.tags_id;

  const toc = parseTOC(body);
  const renderedBody = renderMarkdown(body);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    image: post.image,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: COMPANY.name },
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      logo: { '@type': 'ImageObject', url: `${window.location.origin}/logo-gma.jpeg` },
    },
    description: excerpt,
    keywords: tags.join(', '),
    articleSection: category,
    timeRequired: `PT${post.read_time}M`,
    inLanguage: lang === 'en' ? 'en-US' : 'id-ID',
  };

  return (
    <>
      <ReadingProgress />
      <SEO title={title} description={excerpt} image={post.image} type="article" lang={lang} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-28 pb-0">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] transition-colors mb-8"
            data-testid="blog-back"
          >
            <ArrowLeft size={13} /> {lang === 'en' ? 'All Articles' : 'Semua Artikel'}
          </Link>

          <div className="gma-overline mb-3">{category}</div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[hsl(var(--muted-foreground))] mb-6 pb-6 border-b border-border">
            <span className="flex items-center gap-1.5"><User size={13} /> {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(post.published_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {lang === 'en' ? `${post.read_time} min read` : `${post.read_time} menit baca`}
            </span>
            <ShareButtons title={title} lang={lang} />
          </div>
        </div>

        {/* Hero image */}
        <div className="max-w-5xl mx-auto px-0 md:px-6">
          <img
            src={post.image}
            alt={title}
            className="w-full aspect-[21/9] object-cover"
          />
        </div>
      </section>

      {/* Top leaderboard ad */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <AdSlot slot="top-leaderboard" desktopOnly />
      </div>

      {/* Content area with sidebar TOC */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_240px] gap-12">
          {/* Article body */}
          <article>
            {/* Excerpt lead */}
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-8 pb-8 border-b border-border font-medium italic">
              {excerpt}
            </p>

            {/* Mobile TOC */}
            {toc.length >= 3 && (
              <details className="lg:hidden mb-8 border border-border p-4">
                <summary className="text-[11px] uppercase tracking-widest font-bold cursor-pointer flex items-center gap-2">
                  <BookOpen size={12} /> {lang === 'en' ? 'Table of Contents' : 'Daftar Isi'}
                </summary>
                <nav className="mt-3 space-y-1">
                  {toc.map(h => (
                    <a key={h.id} href={`#${h.id}`} className={`block text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground py-0.5 ${h.level === 3 ? 'pl-4' : ''}`}>
                      {h.level === 3 && <span className="mr-1 opacity-40">↳</span>}
                      {h.text}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            {/* Rendered body */}
            <div
              className="gma-prose"
              dangerouslySetInnerHTML={{ __html: renderedBody }}
            />

            {/* In-article ad (mid-content) */}
            <AdSlot slot="in-article" className="my-10" />

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] mb-3">
                {lang === 'en' ? 'Tags' : 'Tag'}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[11px] uppercase tracking-wider font-semibold border border-border text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* KBLI badge */}
            <div className="mt-6 flex flex-wrap gap-2">
              {post.kbli.map(k => (
                <span key={k} className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]">
                  KBLI {k}
                </span>
              ))}
            </div>

            {/* Share bottom */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
              <ShareButtons title={title} lang={lang} />
              <Link
                to="/blog"
                className="text-xs uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={12} /> {lang === 'en' ? 'Back to all articles' : 'Kembali ke semua artikel'}
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <TOC headings={toc} lang={lang} />
            <div className="mt-10">
              <AdSlot slot="sidebar-mpu" />
            </div>
          </aside>
        </div>
      </div>

      {/* Below article ad */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <AdSlot slot="below-article" desktopOnly />
        <AdSlot slot="mobile-banner" mobileOnly />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-border py-16">
          <div className="gma-container">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[hsl(var(--accent))] mb-2">
              {lang === 'en' ? '— Related Articles' : '— Artikel Terkait'}
            </p>
            <h2 className="font-display text-2xl font-bold mb-8">
              {lang === 'en' ? 'You might also like' : 'Artikel lain yang relevan'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(p => {
                const relTitle = lang === 'en' ? p.title_en : p.title_id;
                const relExcerpt = lang === 'en' ? p.excerpt_en : p.excerpt_id;
                const relCat = lang === 'en' ? p.category_en : p.category_id;
                return (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group border border-border hover:border-[hsl(var(--accent))] transition-all"
                    data-testid={`related-${p.id}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={p.image}
                        alt={relTitle}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] font-bold mb-2">{relCat}</p>
                      <h3 className="font-display font-semibold leading-snug group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-2 mb-3">
                        {relTitle}
                      </h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">{relExcerpt}</p>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent))]">
                        {lang === 'en' ? 'Read' : 'Baca'} <ChevronRight size={11} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Author / Company CTA */}
      <section className="border-t border-border py-12">
        <div className="gma-container">
          <div className="border border-border p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start">
            <img
              src="/logo-gma.jpeg"
              alt="GMA World"
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[hsl(var(--accent))] mb-1">
                {lang === 'en' ? 'Written by' : 'Ditulis oleh'}
              </p>
              <h3 className="font-display text-xl font-bold mb-2">Tim GMA World</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {lang === 'en'
                  ? 'PT. Geya Mora Agung (GMA World) is a trusted partner for international trade, logistics, and maritime industry in North Sumatra. Our team has deep expertise in export-import, customs, and commodity trading.'
                  : 'PT. Geya Mora Agung (GMA World) adalah mitra terpercaya untuk perdagangan internasional, logistik, dan industri maritim di Sumatera Utara. Tim kami memiliki keahlian mendalam di bidang ekspor-impor, kepabeanan, dan perdagangan komoditas.'}
              </p>
            </div>
            <Link
              to="/#contact"
              className="gma-btn gma-btn-primary whitespace-nowrap flex-shrink-0"
            >
              {lang === 'en' ? 'Contact Us' : 'Hubungi Kami'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
