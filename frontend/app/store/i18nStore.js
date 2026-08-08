import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const dictionaries = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    profile: 'Profile',
    buses_online: 'Buses Online',
    total_active: 'Total Active',
    avg_speed: 'Avg Speed',
    trip_planner: 'Trip Planner',
    saved_stops: 'Saved Stops',
    search_stops: 'Search stops...',
    fastest: 'Fastest',
    mins: 'mins',
    save_stop: 'Save Stop',
    clear_all: 'Clear all',
    journey_history: 'Journey History',
    no_history: 'No past journeys found.',
    track_bus: 'Track this bus',
    accessibility: 'Accessibility',
    language: 'Language',
    theme: 'Theme',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    high_contrast: 'High Contrast',
  },
  es: {
    dashboard: 'Panel',
    analytics: 'Analítica',
    profile: 'Perfil',
    buses_online: 'Autobuses en línea',
    total_active: 'Total activos',
    avg_speed: 'Velocidad media',
    trip_planner: 'Planificador',
    saved_stops: 'Paradas guardadas',
    search_stops: 'Buscar paradas...',
    fastest: 'Más rápido',
    mins: 'min',
    save_stop: 'Guardar',
    clear_all: 'Borrar todo',
    journey_history: 'Historial de viajes',
    no_history: 'No se encontraron viajes.',
    track_bus: 'Rastrear autobús',
    accessibility: 'Accesibilidad',
    language: 'Idioma',
    theme: 'Tema',
    dark_mode: 'Modo oscuro',
    light_mode: 'Modo claro',
    high_contrast: 'Alto contraste',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    analytics: 'एनालिटिक्स',
    profile: 'प्रोफ़ाइल',
    buses_online: 'ऑनलाइन बसें',
    total_active: 'कुल सक्रिय',
    avg_speed: 'औसत गति',
    trip_planner: 'यात्रा योजनाकार',
    saved_stops: 'सहेजे गए स्टॉप',
    search_stops: 'स्टॉप खोजें...',
    fastest: 'सबसे तेज़',
    mins: 'मिनट',
    save_stop: 'सहेजें',
    clear_all: 'सभी साफ़ करें',
    journey_history: 'यात्रा इतिहास',
    no_history: 'कोई पिछली यात्रा नहीं मिली।',
    track_bus: 'बस को ट्रैक करें',
    accessibility: 'पहुंच (Accessibility)',
    language: 'भाषा',
    theme: 'थीम',
    dark_mode: 'डार्क मोड',
    light_mode: 'लाइट मोड',
    high_contrast: 'उच्च कंट्रास्ट',
  }
};

const useI18nStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      // Translation function `t('key')`
      t: (key) => {
        const lang = get().lang;
        return dictionaries[lang]?.[key] || dictionaries['en'][key] || key;
      },
    }),
    {
      name: 'bustrakpro-lang',
    }
  )
);

export default useI18nStore;
