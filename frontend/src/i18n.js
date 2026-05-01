import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

const stored = typeof window !== 'undefined' ? window.localStorage.getItem('gma-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: stored || 'id',
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
});

export default i18n;
