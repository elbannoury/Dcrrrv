import React from 'react'; 
import { useLanguage } from '@/contexts/LanguageContext'; 

export default function Footer() { 
  const { t } = useLanguage();
  return ( 
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Dcrrrv. {t('footer.rights')}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>📞 +212 6 12 34 56 78</span>
          <a href="https://instagram.com/@DECORWEV" className="hover:underline">📷 @DECORWEV</a>
        </div>
      </div>
    </footer>
  ); 
}
