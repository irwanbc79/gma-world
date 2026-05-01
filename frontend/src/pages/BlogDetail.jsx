import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import SEO from '../components/SEO';
import { api, COMPANY } from '../lib/config';

export default function BlogDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blog/${slug}`)
      .then((r) => setPost(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const lang = i18n.language === 'en' ? 'en' : 'id';

  if (loading) return <div className="pt-36 pb-20 text-center">{t('blog.loading')}</div>;
  if (notFound || !post) return (
    <div className="pt-36 pb-20 text-center">
      <p className="mb-5">{t('blog.noPosts')}</p>
      <Link to="/blog" className="gma-btn gma-btn-primary">{t('blog.backToBlog')}</Link>
    </div>
  );

  const title = lang === 'en' ? post.title_en : post.title_id;
  const content = lang === 'en' ? post.content_en : post.content_id;
  const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_id;
  const category = lang === 'en' ? post.category_en : post.category_id;

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    image: post.image,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: COMPANY.name },
    publisher: { '@type': 'Organization', name: COMPANY.name },
    description: excerpt,
  };

  return (
    <>
      <SEO title={title} description={excerpt} image={post.image} type="article" lang={lang} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>

      <article className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] transition-colors mb-10" data-testid="blog-back">
            <ArrowLeft size={14} /> {t('blog.backToBlog')}
          </Link>

          <div className="gma-overline mb-4">{category}</div>
          <h1 className="gma-h1 mb-6">{title}</h1>
          <div className="flex items-center gap-5 text-sm text-[hsl(var(--muted-foreground))] mb-10 pb-10 border-b border-border">
            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(post.published_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>

          <img src={post.image} alt={title} className="w-full aspect-[16/9] object-cover mb-12" />

          <div className="gma-prose whitespace-pre-wrap">{content}</div>
        </div>
      </article>
    </>
  );
}
