import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('');
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('ecom_products')
        .select('*')
        .eq('status', 'active');

      const { data } = await query;
      if (data) {
        const types = [...new Set(data.map(p => p.product_type).filter(Boolean))];
        setProductTypes(types as string[]);

        let filtered = data;

        // Search
        const search = searchParams.get('search') || searchQuery;
        if (search) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase()) ||
            p.product_type?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Filter by type
        if (filterType) {
          filtered = filtered.filter(p => p.product_type === filterType);
        }

        // Price range
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Sort
        switch (sortBy) {
          case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
          case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
          case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
          default: filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        setProducts(filtered);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [searchQuery, sortBy, filterType, priceRange, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      {/* Page Header */}
      <div className="bg-[#2C3E50] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('products.title')}
          </h1>
          <p className="text-gray-300 text-sm">{products.length} {t('products.items')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm bg-white"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSearchParams({}); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 border rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${showFilters ? 'bg-[#2C3E50] text-white border-[#2C3E50]' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'}`}
            >
              <SlidersHorizontal size={16} /> {t('products.filter')}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none px-5 py-3 pr-10 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 cursor-pointer"
              >
                <option value="newest">{t('products.sort_newest')}</option>
                <option value="price_asc">{t('products.sort_price_asc')}</option>
                <option value="price_desc">{t('products.sort_price_desc')}</option>
                <option value="name">{t('products.sort_name')}</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('products.filter')} - Type</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('')}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${!filterType ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    All
                  </button>
                  {productTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${filterType === type ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('products.filter')} - Price</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', range: [0, 300000] as [number, number] },
                    { label: 'Under $500', range: [0, 50000] as [number, number] },
                    { label: '$500 - $1000', range: [50000, 100000] as [number, number] },
                    { label: '$1000 - $2000', range: [100000, 200000] as [number, number] },
                    { label: 'Over $2000', range: [200000, 300000] as [number, number] },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => setPriceRange(item.range)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${priceRange[0] === item.range[0] && priceRange[1] === item.range[1] ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3"><div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-5 bg-gray-200 rounded w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">{t('products.no_results')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
