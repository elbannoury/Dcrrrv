import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShoppingBag, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [isWished, setIsWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const price = product.price || 0;
  const image = product.images?.[0] || '';
  const isSale = product.tags?.includes('sale');
  const isFeatured = product.tags?.includes('featured');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      name: product.name,
      sku: product.sku || product.handle,
      price: price,
      image: image,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <Link to={`/product/${product.handle}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isSale && (
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">Sale</span>
          )}
          {isFeatured && (
            <span className="px-3 py-1 bg-[#D4AF37] text-white text-[10px] font-bold uppercase rounded-full tracking-wider">Featured</span>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 ${addedToCart ? 'bg-green-500 text-white' : 'bg-white text-gray-800 hover:bg-[#D4AF37] hover:text-white'}`}
          >
            <ShoppingBag size={18} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWished(!isWished); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75 ${isWished ? 'bg-red-500 text-white' : 'bg-white text-gray-800 hover:bg-red-500 hover:text-white'}`}
          >
            <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/product/${product.handle}`}
            onClick={(e) => e.stopPropagation()}
            className="w-11 h-11 bg-white text-gray-800 rounded-full flex items-center justify-center hover:bg-[#2C3E50] hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-150"
          >
            <Eye size={18} />
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-medium text-[#D4AF37] uppercase tracking-widest mb-1">{product.product_type}</p>
        <Link to={`/product/${product.handle}`}>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[#2C3E50]">{(price / 100).toFixed(2)} DH</p>
          <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{t('product.free_shipping')}</span>
        </div>
      </div>
    </div>
  );
}
