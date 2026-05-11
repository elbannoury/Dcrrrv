import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2C3E50] text-white">
      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} decrv. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
