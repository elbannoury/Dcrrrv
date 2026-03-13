import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (orderId) {
      supabase.from('ecom_orders').select('*').eq('id', orderId).single().then(({ data }) => {
        if (data) setOrder(data);
      });
      supabase.from('ecom_order_items').select('*').eq('order_id', orderId).then(({ data }) => {
        if (data) setItems(data);
      });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t('order.success')}
        </h1>
        <p className="text-gray-500 mb-8">{t('order.thank_you')}</p>

        {order && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm text-left mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package size={20} className="text-[#D4AF37]" />
              <span className="text-sm text-gray-500">{t('order.number')}: <span className="font-mono font-bold text-gray-800">{orderId?.slice(0, 8).toUpperCase()}</span></span>
            </div>

            {items.length > 0 && (
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-medium text-gray-800">{item.product_name}</span>
                      {item.variant_title && <span className="text-gray-400 ml-2">({item.variant_title})</span>}
                      <span className="text-gray-400 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">${(item.total / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('cart.subtotal')}</span>
                <span>${((order.subtotal || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span className="text-green-600">{t('cart.free_shipping')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('cart.tax')}</span>
                <span>${((order.tax || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>{t('cart.total')}</span>
                <span className="text-[#D4AF37]">${((order.total || 0) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="px-8 py-3.5 bg-[#2C3E50] text-white font-semibold rounded-full hover:bg-[#34495E] transition-colors flex items-center justify-center gap-2">
            {t('order.back_home')} <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 transition-colors">
            {t('cart.continue')}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
