import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Package, ShoppingCart, Plus, Pencil, Trash2, Save, X, LogOut, Lock, MessageCircle, Eye, EyeOff, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductForm {
  name: string;
  handle: string;
  description: string;
  price: string;
  sku: string;
  inventory_qty: string;
  product_type: string;
  images: string[];
  status: string;
  tags: string;
}

const emptyForm: ProductForm = {
  name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '10',
  product_type: '', images: [], status: 'active', tags: '',
};

export default function AdminPage() {
  const { t } = useLanguage();
  const { isAdmin, adminLogin, adminLogout } = useAuth();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'whatsapp'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      const saved = localStorage.getItem('decrv_whatsapp');
      if (saved) {
        const config = JSON.parse(saved);
        setWhatsappNumber(config.number || '');
        setWhatsappApiKey(config.apiKey || '');
      }
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('ecom_products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('ecom_orders').select('*, items:ecom_order_items(*)').order('created_at', { ascending: false }).limit(50);
    setOrders(data || []);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLogin(password)) {
      setLoginError('Invalid password');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...form.images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading image: ${uploadError.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      newImages.push(publicUrl);
    }

    setForm({ ...form, images: newImages });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };

  const handleSaveProduct = async () => {
    const productData = {
      name: form.name,
      handle: form.handle || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      sku: form.sku,
      inventory_qty: parseInt(form.inventory_qty) || 0,
      product_type: form.product_type,
      images: form.images,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map(s => s.trim()) : [],
      has_variants: false,
      vendor: 'decrv',
    };

    if (editingProduct) {
      await supabase.from('ecom_products').update(productData).eq('id', editingProduct);
      toast.success('Product updated successfully');
    } else {
      await supabase.from('ecom_products').insert(productData);
      toast.success('Product created successfully');
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleEditProduct = (product: any) => {
    setForm({
      name: product.name,
      handle: product.handle,
      description: product.description || '',
      price: (product.price / 100).toFixed(2),
      sku: product.sku || '',
      inventory_qty: String(product.inventory_qty || 0),
      product_type: product.product_type || '',
      images: Array.isArray(product.images) ? product.images : [],
      status: product.status || 'active',
      tags: (product.tags || []).join(', '),
    });
    setEditingProduct(product.id);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('ecom_products').delete().eq('id', id);
      fetchProducts();
      toast.success('Product deleted');
    }
  };

  const handleSaveWhatsapp = () => {
    localStorage.setItem('decrv_whatsapp', JSON.stringify({ number: whatsappNumber, apiKey: whatsappApiKey }));
    setWhatsappSaved(true);
    setTimeout(() => setWhatsappSaved(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#2C3E50]/10 rounded-full flex items-center justify-center">
              <Lock size={28} className="text-[#2C3E50]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2C3E50] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('admin.title')}
            </h1>
            <p className="text-gray-500 text-sm mb-6">Enter admin password to continue</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm text-center"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#2C3E50] text-white font-semibold rounded-xl hover:bg-[#34495E] transition-colors">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#2C3E50]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('admin.title')}
          </h1>
          <button onClick={adminLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          {[
            { key: 'products' as const, icon: <Package size={16} />, label: t('admin.products') },
            { key: 'orders' as const, icon: <ShoppingCart size={16} />, label: t('admin.orders') },
            { key: 'whatsapp' as const, icon: <MessageCircle size={16} />, label: 'WhatsApp' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-[#2C3E50] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{products.length} products</p>
              <button
                onClick={() => { setForm(emptyForm); setEditingProduct(null); setShowForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-medium hover:bg-[#C4A030] transition-colors"
              >
                <Plus size={16} /> {t('admin.add_product')}
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">{editingProduct ? t('admin.edit') : t('admin.add_product')}</h2>
                    <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Product Images</label>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {form.images.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-gray-400 hover:text-[#D4AF37]"
                          >
                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            <span className="text-[10px] font-medium">{uploading ? 'Uploading...' : 'Upload'}</span>
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Handle (URL slug)</label>
                        <input value={form.handle} onChange={e => setForm({...form, handle: e.target.value})} placeholder="auto-generated" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Product Type</label>
                        <input value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value})} placeholder="e.g. Sofa, Table" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Price ($) *</label>
                        <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                        <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Inventory Qty</label>
                        <input type="number" value={form.inventory_qty} onChange={e => setForm({...form, inventory_qty: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30">
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                        <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="featured, new, sale" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button onClick={handleSaveProduct} className="flex-1 py-3 bg-[#2C3E50] text-white font-semibold rounded-xl hover:bg-[#34495E] transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> {editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                      <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[#2C3E50]">{product.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{product.sku || 'NO SKU'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' : 
                            product.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.inventory_qty} in stock</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#2C3E50]">${(product.price / 100).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E50] mb-1">Orders Management</h3>
            <p className="text-gray-500 text-sm mb-6">View and manage your customer orders here.</p>
            <div className="max-w-4xl mx-auto text-left">
              {orders.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No orders found yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border rounded-xl p-4 hover:border-[#D4AF37] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-mono text-gray-400">#{order.id.slice(0,8)}</span>
                          <h4 className="font-bold text-[#2C3E50]">{order.customer_name}</h4>
                        </div>
                        <span className="text-sm font-bold text-[#D4AF37]">${(order.total_amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {order.items?.length || 0} items • {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{order.status}</span>
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-bold uppercase">{order.payment_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C3E50]">WhatsApp Integration</h3>
                  <p className="text-xs text-gray-500">Configure your WhatsApp notifications</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp Number (with country code)</label>
                  <input 
                    type="text" 
                    value={whatsappNumber} 
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="+212600000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">API Key (Optional)</label>
                  <input 
                    type="password" 
                    value={whatsappApiKey} 
                    onChange={e => setWhatsappApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                  />
                </div>
                <button 
                  onClick={handleSaveWhatsapp}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    whatsappSaved ? 'bg-green-500 text-white' : 'bg-[#2C3E50] text-white hover:bg-[#34495E]'
                  }`}
                >
                  {whatsappSaved ? <><Save size={18} /> Saved!</> : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
