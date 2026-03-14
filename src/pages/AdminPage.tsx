import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Package, ShoppingCart, Plus, Pencil, Trash2, Save, X, LogOut, Lock, MessageCircle, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductForm {
  name: string;
  handle: string;
  description: string;
  price: string;
  sku: string;
  inventory_qty: string;
  product_type: string;
  images: string;
  status: string;
  tags: string;
}

interface UploadedImage {
  file: File;
  preview: string;
}

const emptyForm: ProductForm = {
  name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '10',
  product_type: '', images: '', status: 'active', tags: '',
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
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: UploadedImage = {
          file,
          preview: reader.result as string,
        };
        setUploadedImages(prev => [...prev, newImage]);
        const currentImages = form.images ? form.images.split(',').map(s => s.trim()).filter(s => s) : [];
        setForm({
          ...form,
          images: [...currentImages, reader.result as string].join(', ')
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    const images = form.images.split(',').map(s => s.trim()).filter(s => s);
    images.splice(index, 1);
    setForm({ ...form, images: images.join(', ') });
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
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(s => s) : [],
      status: form.status,
      tags: form.tags ? form.tags.split(',').map(s => s.trim()) : [],
      has_variants: false,
      vendor: 'decrv',
    };

    if (editingProduct) {
      await supabase.from('ecom_products').update(productData).eq('id', editingProduct);
    } else {
      await supabase.from('ecom_products').insert(productData);
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setUploadedImages([]);
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
      images: (product.images || []).join(', '),
      status: product.status || 'active',
      tags: (product.tags || []).join(', '),
    });
    setEditingProduct(product.id);
    setShowForm(true);
    setUploadedImages([]);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('ecom_products').delete().eq('id', id);
      fetchProducts();
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
            <p className="text-xs text-gray-400 mt-4">Default: decrv2024</p>
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
                onClick={() => { setForm(emptyForm); setEditingProduct(null); setShowForm(true); setUploadedImages([]); }}
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
                    <button onClick={() => { setShowForm(false); setEditingProduct(null); setUploadedImages([]); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Price (DH) *</label>
                        <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                        <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Inventory</label>
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
                      
                      {/* Image Upload Section */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-2">Product Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload images or drag and drop</span>
                            <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
                          </label>
                        </div>
                        
                        {/* Image Preview */}
                        {form.images && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Uploaded Images:</p>
                            <div className="grid grid-cols-3 gap-3">
                              {form.images.split(',').map((img, idx) => {
                                const trimmed = img.trim();
                                if (!trimmed) return null;
                                return (
                                  <div key={idx} className="relative group">
                                    <img src={trimmed} alt={`Product ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(idx)}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                );
         
(Content truncated due to size limit. Use line ranges to read remaining content)
