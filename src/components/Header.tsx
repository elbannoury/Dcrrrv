import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Search, ShoppingBag, Menu, X, Globe, ChevronDown } from 'lucide-react';

export default function Header() {
  const { t, language, setLanguage, dir } = useLanguage();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('ecom_collections')
        .select('id, title, handle')
        .eq('is_visible', true);
      setCollections(data || []);
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const langLabels: Record<string, string> = { en: 'English', ar: 'العربية', fr: 'Français' };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'}`}>
        {/* Top bar */}
        <div className="bg-[#2C3E50] text-white text-xs py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <span className="hidden sm:block">{language === 'ar' ? 'شحن مجاني على جميع الطلبات' : language === 'fr' ? 'Livraison gratuite sur toutes les commandes' : 'Free shipping on all orders'}</span>
            <span className="sm:hidden text-center w-full">{t('product.free_shipping')}</span>
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/admin" className="hover:text-[#D4AF37] transition-colors">{t('nav.admin')}</Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
              decrv
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors relative group">
              {t('nav.home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors relative group">
              {t('nav.products')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
            </Link>
            {collections.filter(c => !['new-arrivals', 'sale'].includes(c.handle)).map(col => (
              <Link key={col.id} to={`/collections/${col.handle}`} className="text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors relative group">
                {col.title}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            {collections.find(c => c.handle === 'sale') && (
              <Link to="/collections/sale" className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors relative group">
                {collections.find(c => c.handle === 'sale')?.title}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300" />
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search size={20} className="text-gray-700" />
            </button>

            {/* Language */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1">
                <Globe size={20} className="text-gray-700" />
                <span className="hidden md:inline text-xs font-medium text-gray-600">{language.toUpperCase()}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 bg-white rounded-xl shadow-xl border py-2 min-w-[140px] z-50 animate-in fade-in slide-in-from-top-2`}>
                    {(['en', 'ar', 'fr'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLangOpen(false); }}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${language === lang ? 'text-[#D4AF37] font-medium' : 'text-gray-700'}`}
                      >
                        {langLabels[lang]}
                        {language === lang && <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-20 border-t' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 py-3 flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm"
              autoFocus={searchOpen}
            />
            <button type="submit" className="px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg text-sm font-medium hover:bg-[#34495E] transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-80 h-full bg-white shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>decrv</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">{t('nav.home')}</Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">{t('nav.products')}</Link>
              {collections.map(col => (
                <Link key={col.id} to={`/collections/${col.handle}`} onClick={() => setMobileOpen(false)} className={`block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium transition-colors ${col.handle === 'sale' ? 'text-red-500' : 'text-gray-700'}`}>
                  {col.title}
                </Link>
              ))}
              <div className="border-t my-4" />
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">{t('nav.admin')}</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[88px] md:h-[92px]" />
    </>
  );
}
