import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import About from '../components/About';
import Services from '../components/Services';
import Sectors from '../components/Sectors';
import WhyUs from '../components/WhyUs';
import BlogPreview from '../components/BlogPreview';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import CTA from '../components/CTA';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { i18n } = useTranslation();
  return (
    <>
      <SEO lang={i18n.language} />
      <Hero />
      <Ticker />
      <About />
      <Services />
      <Sectors />
      <WhyUs />
      <BlogPreview />
      <FAQ />
      <Contact />
      <CTA />
    </>
  );
}
