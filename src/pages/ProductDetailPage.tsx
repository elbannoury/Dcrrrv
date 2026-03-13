import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Check } from 'lucide-react';

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) return;
      setLoading(true);
      setSelectedVariant(null);
      setSelectedSize('');
      setQuantity(1);

      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('handle', handle)
        .single();

      if (data) {
        let variants = data.variants || [];
        if (data.has_variants && variants.length === 0) {
          const { data: variantData } = await supabase
            .from('ecom_product_variants')
            .select('*')
            .eq('product_id', data.id)
            .order('position');
          variants = variantData || [];
          data.variants = variants;
        }
        setProduct(data);

        if (variants.length > 0) {
          const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          const firstInStock = sorted.find((v: any) => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
          setSelectedVariant(firstInStock);
          setSelectedSize(firstInStock?.option1 || '');
        }

        // Fetch related products
        const { data: related } = await supabase
          .from('ecom_products')
          .select('*')
          .eq('status', 'active')
          .eq('product_type', data.product_type)
          .neq('id', data.id)
          .limit(4);
        setRelatedProducts(related || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [handle]);

  const hasVariants = product?.has_variants && product?.variants?.length > 0;

  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants && product.variants.length > 0) {
      return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = product ? getInStock() : false;

  const currentPrice = selectedVariant?.price || product?.price || 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedSize) return;
    if (!inStock) return;

    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || undefined,
      name: product.name,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: currentPrice,
      image: product.images?.[0],
    }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = product?.variants?.find((v: any) =>
      v.option1 === size || v.title?.toLowerCase().includes(size.toLowerCase())
    );
    if (variant) setSelectedVariant(variant);
  };

  const variantSizes = [...new Set(product?.variants?.map((v: any) => v.option1).filter(Boolean) || [])];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-1/4" /><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-24 bg-gray-200 rounded" /><div className="h-14 bg-gray-200 rounded" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg">Product not found</p>
          <Link to="/products" className="mt-4 inline-block text-[#D4AF37] font-medium">{t('cart.continue')}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const metadata = product.metadata || {};

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">{t('nav.home')}</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-[#D4AF37] transition-colors">{t('nav.products')}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* Product */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
            <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
            {product.tags?.includes('sale') && (
              <span className="absolute top-4 left-4 px-4 py-1.5 bg-red-500 text-white text-xs font-bold uppercase rounded-full">Sale</span>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-medium text-[#D4AF37] uppercase tracking-[0.3em] mb-2">{product.product_type}</p>
            <h1 className="text-2xl md:text-4xl font-bold text-[#2C3E50] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-bold text-[#2C3E50]">${(currentPrice / 100).toFixed(2)}</p>
              {inStock ? (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                  <Check size={14} /> {t('product.in_stock')}
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">{t('product.out_of_stock')}</span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Variant selector */}
            {variantSizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Option</label>
                <div className="flex flex-wrap gap-2">
                  {variantSizes.map((size: string) => {
                    const variant = product.variants?.find((v: any) => v.option1 === size);
                    const sizeInStock = variant ? (variant.inventory_qty == null || variant.inventory_qty > 0) : true;
                    return (
                      <button
                        key={size}
                        onClick={() => sizeInStock && handleSizeSelect(size)}
                        disabled={!sizeInStock}
                        className={`px-5 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-[#2C3E50] text-white border-[#2C3E50]'
                            : sizeInStock
                            ? 'border-gray-200 text-gray-700 hover:border-[#D4AF37]'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('product.quantity')}</label>
              <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl w-fit overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-6 py-3 font-semibold text-sm border-x-2 border-gray-200 min-w-[60px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(hasVariants && !selectedSize) || !inStock}
              className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : !inStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#2C3E50] text-white hover:bg-[#34495E] hover:shadow-lg'
              }`}
            >
              {addedToCart ? (
                <><Check size={20} /> {t('product.added')}</>
              ) : !inStock ? (
                t('product.out_of_stock')
              ) : (
                <><ShoppingBag size={20} /> {t('product.add_to_cart')} — ${((currentPrice * quantity) / 100).toFixed(2)}</>
              )}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span>{t('product.free_shipping')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span>{t('home.why_warranty')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <RotateCcw size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span>{t('footer.returns')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 md:mt-20">
          <div className="flex border-b">
            {['description', 'specifications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab ? 'text-[#2C3E50]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t(`product.${tab}`)}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />}
              </button>
            ))}
          </div>
          <div className="py-8">
            {activeTab === 'description' ? (
              <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">{product.description}</p>
            ) : (
              <div className="max-w-lg">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-gray-800">{String(value)}</span>
                  </div>
                ))}
                {product.sku && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">SKU</span>
                    <span className="text-sm font-medium text-gray-800">{product.sku}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[#2C3E50] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('product.related')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
