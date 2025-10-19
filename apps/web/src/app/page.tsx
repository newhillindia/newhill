'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Award, Truck, Clock, Star, Users, Shield } from 'lucide-react';
import Hero3D from '@/components/sections/Hero3D';
import USPCard from '@/components/sections/USPCard';
import ProductCard from '@/components/catalog/ProductCard';
import Carousel from '@/components/ui/Carousel';
import Testimonials from '@/components/sections/Testimonials';
import { Product } from '@newhill/shared';

// Mock data - in real app, this would come from API
const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'premium-cardamom',
    name: { en: 'Premium Cardamom', hi: 'प्रीमियम इलायची', ar: 'هيل مميز' },
    description: { en: 'Aromatic green cardamom pods from the hills of Munnar', hi: 'मुन्नार की पहाड़ियों से सुगंधित हरी इलायची', ar: 'حبات هيل خضراء عطرة من تلال مونار' },
    shortDescription: { en: 'Fresh, aromatic cardamom pods', hi: 'ताजी, सुगंधित इलायची', ar: 'حبات هيل طازجة وعطرة' },
    price: 450,
    currency: 'INR',
    category: 'Whole Spices',
    subcategory: 'Cardamom',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 50,
    images: ['/images/cardamom.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'whole'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'black-pepper',
    name: { en: 'Black Pepper', hi: 'काली मिर्च', ar: 'فلفل أسود' },
    description: { en: 'Premium black pepper corns with intense flavor', hi: 'तीव्र स्वाद के साथ प्रीमियम काली मिर्च', ar: 'حبات فلفل أسود مميزة بنكهة قوية' },
    shortDescription: { en: 'Intense black pepper corns', hi: 'तीव्र काली मिर्च', ar: 'حبات فلفل أسود قوية' },
    price: 320,
    currency: 'INR',
    category: 'Whole Spices',
    subcategory: 'Pepper',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 75,
    images: ['/images/black-pepper.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'whole'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    slug: 'cinnamon-sticks',
    name: { en: 'Cinnamon Sticks', hi: 'दालचीनी', ar: 'عصي القرفة' },
    description: { en: 'Sweet and aromatic cinnamon sticks from Kerala', hi: 'केरल से मीठी और सुगंधित दालचीनी', ar: 'عصي قرفة حلوة وعطرة من كيرالا' },
    shortDescription: { en: 'Sweet cinnamon sticks', hi: 'मीठी दालचीनी', ar: 'عصي قرفة حلوة' },
    price: 280,
    currency: 'INR',
    category: 'Whole Spices',
    subcategory: 'Cinnamon',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 40,
    images: ['/images/cinnamon.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'whole'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockTestimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Home Chef',
    location: 'Mumbai',
    content: 'The quality of spices from Newhill is exceptional. Every dish I make with their spices turns out amazing. The cardamom has such a beautiful aroma!',
    rating: 5,
    verified: true,
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    role: 'Restaurant Owner',
    company: 'Spice Garden Restaurant',
    location: 'Delhi',
    content: 'We\'ve been using Newhill spices for over 3 years now. The consistency in quality and the authentic flavors have made our restaurant famous.',
    rating: 5,
    verified: true,
  },
  {
    id: '3',
    name: 'Sarah Ahmed',
    role: 'Food Blogger',
    location: 'Dubai',
    content: 'As a food blogger, I\'ve tried many spice brands, but Newhill stands out. Their organic certification and farm-to-table approach is exactly what I look for.',
    rating: 5,
    verified: true,
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement search functionality
  };

  const handleCTAClick = (ctaType: 'primary' | 'secondary') => {
    console.log('CTA clicked:', ctaType);
    // Track analytics
  };

  const handleAddToCart = (productId: string, variantId?: string) => {
    console.log('Add to cart:', productId, variantId);
    // Implement add to cart
  };

  const handleAddToWishlist = (productId: string) => {
    console.log('Add to wishlist:', productId);
    // Implement add to wishlist
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero3D
        title="Premium Spices from Farm to Table"
        subtitle="Discover the finest spices directly from our farms in Munnar, Kerala. Since 1995, we've been bringing you authentic flavors that transform every meal."
        primaryCTA={{
          text: "Shop Now",
          href: "/products"
        }}
        secondaryCTA={{
          text: "Our Story",
          href: "/about"
        }}
        onCTAClick={handleCTAClick}
      />

      {/* USP Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Newhill Spices?
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              We're committed to bringing you the finest spices with uncompromising quality and authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <USPCard
              icon={Leaf}
              title="Farm Fresh"
              description="Our spices come directly from our own farms in Munnar, ensuring freshness and quality in every batch."
              features={['Direct from farm', 'No middlemen', 'Fresh harvest']}
              variant="featured"
            />
            <USPCard
              icon={Award}
              title="Premium Quality"
              description="FSSAI certified organic spices that meet the highest standards of quality and purity."
              features={['FSSAI Certified', 'Organic', 'Premium grade']}
            />
            <USPCard
              icon={Truck}
              title="Fast Delivery"
              description="Free shipping across India with fast, secure delivery to your doorstep."
              features={['Free shipping', 'Fast delivery', 'Secure packaging']}
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Discover our most popular and premium spice selections, carefully curated for the best culinary experience.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="card-hover p-6">
                  <div className="skeleton h-64 mb-4 rounded-lg" />
                  <div className="skeleton h-6 mb-2" />
                  <div className="skeleton h-4 mb-4" />
                  <div className="skeleton h-10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products" className="btn-primary inline-flex items-center space-x-2">
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              From harvest to your kitchen, here's how we ensure you get the freshest spices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">1. Harvest</h3>
              <p className="text-neutral-600">
                We carefully harvest our spices at the perfect time to ensure maximum flavor and aroma.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">2. Pack</h3>
              <p className="text-neutral-600">
                Our spices are carefully processed and packed in premium packaging to maintain freshness.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">3. Ship</h3>
              <p className="text-neutral-600">
                We deliver fresh spices directly to your doorstep with fast, secure shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        testimonials={mockTestimonials}
        title="What Our Customers Say"
        subtitle="Don't just take our word for it. Here's what our valued customers have to say about our premium spices."
      />

      {/* Trust Indicators */}
      <section className="section-padding bg-emerald-600 text-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust Newhill Spices for their culinary needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-emerald-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-emerald-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-emerald-100">Spice Varieties</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-emerald-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-neutral-900 text-white">
        <div className="container-max text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Our Latest Spices
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Get exclusive offers, new product announcements, and cooking tips delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
              <button className="btn-gold px-6 py-3 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
