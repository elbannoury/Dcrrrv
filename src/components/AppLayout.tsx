import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Truck, Shield, Headphones, Award, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const HERO_IMG = 'https://d64gsuwffb70l.cloudfront.net/69b4828f789f1e53343ae651_1773437727452_3427fc4a.jpg';
const HERO_IMG2 = 'https://d64gsuwffb70l.cloudfront.net/69b4828f789f1e53343ae651_1773437896107_d28d271c.png';

export default function AppLayout() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const heroImages = [HERO_IMG, HERO_IMG2];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch featured products
      const { data: featured } = await supabase
        .from('ecom_products')
        .select('*')
        .eq('status', 'active')
        .contains('tags', ['featured'])
        .limit(8);
      setFeaturedProducts(featured || []);

      // Fetch new arrivals
      const { data: newArr } = await supabase
        .from('ecom_products')
        .select('*')
        .eq('status', 'active')
        .contains('tags', ['new'])
        .limit(4);
      setNewArrivals(newArr || []);

      // Fetch collections
      const { data: cols } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('is_visible', true);
      setCollections(cols || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  const testimonials = [
    { name: 'Sarah M.', text: language === 'ar' ? 'جودة الأثاث لا تصدق! الأريكة التي اشتريتها أنيقة ومريحة للغاية.' : language === 'fr' ? 'La qualité des meubles est incroyable ! Le canapé que j\'ai acheté est élégant et très confortable.' : 'The quality of furniture is incredible! The sofa I bought is elegant and extremely comfortable.', rating: 5 },
    { name: 'Ahmed K.', text: language === 'ar' ? 'خدمة عملاء ممتازة وتوصيل سريع. أنصح بشدة!' : language === 'fr' ? 'Excellent service client et livraison rapide. Je recommande vivement !' : 'Excellent customer service and fast delivery. Highly recommend!', rating: 5 },
    { name: 'Marie L.', text: language === 'ar' ? 'حولت غرفة المعيشة الخاصة بي بالكامل. كل قطعة مصنوعة بعناية فائقة.' : language === 'fr' ? 'J\'ai complètement transformé mon salon. Chaque pièce est fabriquée avec un soin exceptionnel.' : 'Completely transformed my living room. Every piece is crafted with exceptional care.', rating: 5 },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };

  const mainCollections = collections.filter(c => !['new-arrivals', 'sale'].includes(c.handle));

  // Scroll animation observer
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [loading]);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      {/* HERO SECTION */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${heroIndex === i ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-xl">
              <div className="overflow-hidden mb-4">
                <p className="text-[#D4AF37] text-sm md:text-base font-medium tracking-[0.3em] uppercase animate-in slide-in-from-bottom duration-700">
                  — decrv Collection 2026
                </p>
              </div>
              <div className="overflow-hidden mb-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-in slide-in-from-bottom duration-700 delay-200" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('hero.title')}
                </h1>
              </div>
              <div className="overflow-hidden mb-8">
                <p className="text-gray-200 text-base md:text-lg leading-relaxed animate-in slide-in-from-bottom duration-700 delay-300">
                  {t('hero.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom duration-700 delay-500">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-[#D4AF37] text-white font-semibold rounded-full hover:bg-[#C4A030] transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/30 flex items-center gap-2 group"
                >
                  {t('hero.cta')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/collections/living-room"
                  className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  {t('hero.secondary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${heroIndex === i ? 'bg-[#D4AF37] w-8' : 'bg-white/50 hover:bg-white/80'}`} />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" data-animate className={`py-16 md:py-20 bg-white transition-all duration-700 ${isVisible('why-us') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Award className="text-[#D4AF37]" size={28} />, title: t('home.why_quality'), desc: t('home.why_quality_desc') },
              { icon: <Truck className="text-[#D4AF37]" size={28} />, title: t('home.why_delivery'), desc: t('home.why_delivery_desc') },
              { icon: <Shield className="text-[#D4AF37]" size={28} />, title: t('home.why_warranty'), desc: t('home.why_warranty_desc') },
              { icon: <Headphones className="text-[#D4AF37]" size={28} />, title: t('home.why_support'), desc: t('home.why_support_desc') },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FAF9F6] rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="featured" data-animate className={`py-16 md:py-24 transition-all duration-700 ${isVisible('featured') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase mb-2">— {t('home.featured')}</p>
              <h2 className="text-2xl md:text-4xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('home.featured')}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">{t('home.featured_sub')}</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:text-[#C4A030] transition-colors group">
              {t('home.view_all')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3"><div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-5 bg-gray-200 rounded w-1/4" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-full text-sm font-medium hover:bg-[#34495E] transition-colors">
              {t('home.view_all')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY ROOM / CATEGORIES */}
      <section id="categories" data-animate className={`py-16 md:py-24 bg-white transition-all duration-700 ${isVisible('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase mb-2">— {t('home.categories')}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.categories')}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">{t('home.categories_sub')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mainCollections.map((col, i) => (
              <Link
                key={col.id}
                to={`/collections/${col.handle}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img
                  src={col.image_url || HERO_IMG}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{col.title}</h3>
                  <p className="text-white/70 text-xs flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
                    {t('hero.secondary')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section id="new-arrivals" data-animate className={`py-16 md:py-24 transition-all duration-700 ${isVisible('new-arrivals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase mb-2">— {t('home.new_arrivals')}</p>
                <h2 className="text-2xl md:text-4xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('home.new_arrivals')}
                </h2>
                <p className="text-gray-500 mt-2 text-sm">{t('home.new_arrivals_sub')}</p>
              </div>
              <Link to="/collections/new-arrivals" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:text-[#C4A030] transition-colors group">
                {t('home.view_all')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSPIRATION BANNER */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={HERO_IMG2} alt="Inspiration" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase mb-4">— {t('home.inspiration')}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.inspiration')}
            </h2>
            <p className="text-white/80 mb-8 text-sm md:text-base">{t('home.inspiration_sub')}</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-white font-semibold rounded-full hover:bg-[#C4A030] transition-all duration-300 group">
              {t('hero.cta')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" data-animate className={`py-16 md:py-24 bg-white transition-all duration-700 ${isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase mb-2">— {t('home.testimonials')}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.testimonials')}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#FAF9F6] rounded-3xl p-8 md:p-12">
              <Quote size={40} className="text-[#D4AF37]/20 mb-4" />
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic">
                "{testimonials[testimonialIndex].text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-[#D4AF37] fill-[#D4AF37]" />
                ))}
              </div>
              <p className="font-semibold text-[#2C3E50]">{testimonials[testimonialIndex].name}</p>
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${testimonialIndex === i ? 'bg-[#D4AF37] w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" data-animate className={`py-16 md:py-24 transition-all duration-700 ${isVisible('newsletter') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#2C3E50] rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('home.newsletter')}
              </h2>
              <p className="text-gray-300 mb-8 text-sm md:text-base max-w-md mx-auto">{t('home.newsletter_sub')}</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('home.newsletter_placeholder')}
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-sm"
                  required
                />
                <button type="submit" className="px-8 py-3.5 bg-[#D4AF37] text-white font-semibold rounded-full hover:bg-[#C4A030] transition-colors text-sm">
                  {subscribed ? t('home.newsletter_success') : t('home.newsletter_btn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
