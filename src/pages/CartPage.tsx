import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function CartPage() {
  const { t } = useLanguage();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C3E50] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{t('cart.empty')}</h1>
          <p className="text-gray-500 mb-8 text-sm">{t('cart.empty_sub')}</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2C3E50] text-white rounded-full font-medium hover:bg-[#34495E] transition-colors">
            {t('cart.continue')} <ArrowRight size={16} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('cart.title')}
          </h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1.5">
            <Trash2 size={14} /> {t('cart.clear')}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product_id + (item.variant_id || '')} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex gap-4 md:gap-6 group hover:shadow-md transition-shadow">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</h3>
                      {item.variant_title && <p className="text-xs text-gray-500 mt-0.5">{item.variant_title}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-[#2C3E50] mt-2">${(item.price / 100).toFixed(2)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-[#2C3E50]">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-lg font-bold text-[#2C3E50] mb-6">{t('checkout.order_summary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('cart.subtotal')}</span>
                  <span className="font-medium">${(cartTotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('cart.shipping')}</span>
                  <span className="font-medium text-green-600">{t('cart.free_shipping')}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-[#2C3E50]">{t('cart.total')}</span>
                  <span className="font-bold text-xl text-[#2C3E50]">${(cartTotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-4 bg-[#D4AF37] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#C4A030] transition-colors text-sm"
              >
                {t('cart.checkout')} <ArrowRight size={16} />
              </Link>

              <Link to="/products" className="block text-center mt-4 text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">
                {t('cart.continue')}
              </Link>

              <div className="mt-6 pt-6 border-t flex items-center gap-2 text-xs text-gray-500">
                <Truck size={16} className="text-[#D4AF37]" />
                <span>{t('product.free_shipping')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
