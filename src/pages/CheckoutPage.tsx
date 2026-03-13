import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronRight, Lock, Truck, CreditCard } from 'lucide-react';

const PROJECT_ID = '69b4828f789f1e53343ae651';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [paymentError, setPaymentError] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US'
  });

  const subtotal = cartTotal;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    if (shippingAddress.state && subtotal > 0) {
      supabase.functions.invoke('calculate-tax', {
        body: { state: shippingAddress.state, subtotal }
      }).then(({ data }) => {
        if (data?.success) { setTax(data.taxCents); setTaxRate(data.taxRate); }
      });
    }
  }, [shippingAddress.state, subtotal]);

  useEffect(() => {
    if (subtotal > 0) {
      supabase.functions.invoke('calculate-shipping', {
        body: { cartItems: cart, subtotal }
      }).then(({ data }) => {
        if (data?.success) setShippingCost(data.shippingCents);
      });
    }
  }, [subtotal]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) return;
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const { data: customer } = await supabase
        .from('ecom_customers')
        .upsert({ email: shippingAddress.email, name: shippingAddress.name, phone: shippingAddress.phone }, { onConflict: 'email' })
        .select('id')
        .single();

      const { data: order } = await supabase
        .from('ecom_orders')
        .insert({
          customer_id: customer?.id,
          status: 'pending',
          subtotal, tax, shipping: shippingCost,
          total: subtotal + shippingCost + tax,
          shipping_address: shippingAddress,
        })
        .select('id')
        .single();

      if (order) {
        const orderItems = cart.map(item => ({
          order_id: order.id, product_id: item.product_id,
          variant_id: item.variant_id || null, product_name: item.name,
          variant_title: item.variant_title || null, sku: item.sku || null,
          quantity: item.quantity, unit_price: item.price, total: item.price * item.quantity,
        }));
        await supabase.from('ecom_order_items').insert(orderItems);

        // WhatsApp notification
        const whatsappConfig = localStorage.getItem('decrv_whatsapp');
        if (whatsappConfig) {
          try {
            const config = JSON.parse(whatsappConfig);
            await supabase.functions.invoke('send-whatsapp-order', {
              body: {
                orderId: order.id, customerName: shippingAddress.name,
                customerEmail: shippingAddress.email, customerPhone: shippingAddress.phone,
                items: cart, total: subtotal + shippingCost + tax,
                shippingAddress, whatsappNumber: config.number, apiKey: config.apiKey,
              }
            });
          } catch (e) { console.log('WhatsApp send attempted'); }
        }

        clearCart();
        navigate(`/order-confirmation?id=${order.id}`);
      }
    } catch (err) {
      setPaymentError('Something went wrong. Please try again.');
    }
    setProcessing(false);
  };

  if (cart.length === 0 && step === 'shipping') {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">{t('cart.empty')}</p>
          <Link to="/products" className="mt-4 inline-block text-[#D4AF37] font-medium">{t('cart.continue')}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm";

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/cart" className="hover:text-[#D4AF37]">{t('nav.cart')}</Link>
          <ChevronRight size={14} />
          <span className={step === 'shipping' ? 'text-[#D4AF37] font-medium' : ''}>{t('checkout.shipping_info')}</span>
          <ChevronRight size={14} />
          <span className={step === 'payment' ? 'text-[#D4AF37] font-medium' : 'text-gray-400'}>{t('checkout.payment')}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {step === 'shipping' ? (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><Truck size={20} className="text-[#D4AF37]" /></div>
                  <h2 className="text-xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('checkout.shipping_info')}</h2>
                </div>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.name')}</label><input type="text" required value={shippingAddress.name} onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.email')}</label><input type="email" required value={shippingAddress.email} onChange={e => setShippingAddress({...shippingAddress, email: e.target.value})} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.phone')}</label><input type="tel" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} className={inputCls} /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.address')}</label><input type="text" required value={shippingAddress.address} onChange={e => setShippingAddress({...shippingAddress, address: e.target.value})} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.city')}</label><input type="text" required value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.state')}</label><input type="text" required value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} placeholder="e.g. CA, NY" className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.zip')}</label><input type="text" required value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1.5">{t('checkout.country')}</label><input type="text" required value={shippingAddress.country} onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})} className={inputCls} /></div>
                  </div>
                  <button type="submit" className="w-full mt-4 py-4 bg-[#2C3E50] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#34495E] transition-colors">
                    <CreditCard size={18} /> {t('checkout.payment')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><CreditCard size={20} className="text-[#D4AF37]" /></div>
                    <h2 className="text-xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('checkout.payment')}</h2>
                  </div>
                  <button onClick={() => setStep('shipping')} className="text-sm text-[#D4AF37] font-medium hover:underline">{t('admin.edit')}</button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                  <p className="font-medium text-gray-800">{shippingAddress.name}</p>
                  <p className="text-gray-500">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                  <p className="text-gray-500">{shippingAddress.email}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl mb-6">
                  <p className="text-amber-800 font-medium text-sm mb-1">Payment processing is being set up</p>
                  <p className="text-amber-600 text-xs">Connect your payment account from the Payments tab to enable credit card payments. You can still place your order — it will be sent via WhatsApp.</p>
                </div>

                {paymentError && <p className="text-red-500 text-sm mb-4">{paymentError}</p>}

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="w-full py-4 bg-[#D4AF37] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#C4A030] transition-colors disabled:opacity-50"
                >
                  <Lock size={16} />
                  {processing ? t('checkout.processing') : t('checkout.place_order')}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                  {t('checkout.whatsapp_note')}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-[#2C3E50] mb-4">{t('checkout.order_summary')}</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product_id + (item.variant_id || '')} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      {item.variant_title && <p className="text-xs text-gray-400">{item.variant_title}</p>}
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">{t('cart.subtotal')}</span><span className="font-medium">${(subtotal / 100).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{t('cart.shipping')}</span><span className="font-medium text-green-600">{t('cart.free_shipping')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{t('cart.tax')} {taxRate > 0 && `(${taxRate}%)`}</span><span className="font-medium">${(tax / 100).toFixed(2)}</span></div>
                <div className="border-t pt-3 flex justify-between"><span className="font-bold text-[#2C3E50]">{t('cart.total')}</span><span className="font-bold text-xl text-[#2C3E50]">${(total / 100).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
