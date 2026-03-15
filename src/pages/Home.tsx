import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Hero from '@/sections/Hero';
import Categories from '@/sections/Categories';
import Products from '@/sections/Products';
import Features from '@/sections/Features';
import About from '@/sections/About';
import CTA from '@/sections/CTA';
import Testimonials from '@/sections/Testimonials';
import Footer from '@/sections/Footer';
import { products } from '@/data';

const Home = () => {
  // Initialize localStorage with products on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('ak-products');
    if (!savedProducts) {
      localStorage.setItem('ak-products', JSON.stringify(products));
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fff9ed]">
      <Navigation />
      <CartDrawer />
      <Hero />
      <Categories />
      <Products />
      <Features />
      <About />
      <CTA />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
