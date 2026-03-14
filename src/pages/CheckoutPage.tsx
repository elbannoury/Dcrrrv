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
