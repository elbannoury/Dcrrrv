import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2C3E50] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-3xl font-bold mb-4 text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>decrv</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{t('footer.about_text')}</p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-[#D4AF37]">{t('footer.quick_links')}</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 text-sm hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/products" className="text-gray-300 text-sm hover:text-white transition-colors">{t('nav.products')}</Link></li>
              <li><Link to="/collections/new-arrivals" className="text-gray-300 text-sm hover:text-white transition-colors">{t('home.new_arrivals')}</Link></li>
              <li><Link to="/collections/sale" className="text-gray-300 text-sm hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-[#D4AF37]">{t('footer.customer_service')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">{t('footer.returns')}</a></li>
              <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">{t('footer.shipping_policy')}</a></li>
              <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-[#D4AF37]">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">123 Design District, Creative Avenue, CA 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4AF37] flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-300 text-sm hover:text-white transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4AF37] flex-shrink-0" />
                <a href="mailto:hello@decrv.com" className="text-gray-300 text-sm hover:text-white transition-colors">hello@decrv.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} decrv. {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
