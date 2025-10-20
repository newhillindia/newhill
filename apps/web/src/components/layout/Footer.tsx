'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  showNewsletter?: boolean;
  onNewsletterSubscribe?: (email: string) => void;
}

export default function Footer({ 
  showNewsletter = true, 
  onNewsletterSubscribe 
}: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewsletterSubscribe && email.trim()) {
      onNewsletterSubscribe(email.trim());
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-900 text-white" role="contentinfo">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
          <div className="container-max section-padding relative z-10">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 animate-fade-in">
                Stay Updated with Our Latest Spices
              </h3>
              <p className="text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Get exclusive offers, new product announcements, and cooking tips delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto" aria-label="Newsletter signup">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-500 text-neutral-900 shadow-md"
                    required
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="btn-gold px-6 py-3 whitespace-nowrap shadow-md hover:shadow-lg transition-shadow"
                    aria-label="Subscribe to newsletter"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="https://i.ibb.co/4ZWLwbf6/NHS-White-3x.png"
                  alt="Newhill Spices Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Newhill Spices
              </span>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Premium, farm-to-table spices since 1995. We bring you the finest spices 
              directly from our farms in Munnar, Kerala, ensuring quality and authenticity 
              in every grain.
            </p>
            <div className="flex space-x-3" role="list" aria-label="Social media links">
              <a
                href="https://facebook.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-all duration-200 p-2 hover:bg-neutral-800 rounded-lg"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-all duration-200 p-2 hover:bg-neutral-800 rounded-lg"
                aria-label="Follow us on Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-all duration-200 p-2 hover:bg-neutral-800 rounded-lg"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-all duration-200 p-2 hover:bg-neutral-800 rounded-lg"
                aria-label="Subscribe to our YouTube channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=whole-spices"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Whole Spices
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=ground-spices"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Ground Spices
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=blends"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Spice Blends
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  B2B Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-white">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/refunds"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="text-neutral-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                <address className="text-sm text-neutral-300 not-italic">
                  <p>Newhill Spices</p>
                  <p>Munnar, Kerala 685612</p>
                  <p>India</p>
                </address>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-neutral-300 hover:text-emerald-400 transition-colors duration-200"
                  aria-label="Call us at +91 98765 43210"
                >
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:info@newhillspices.com"
                  className="text-sm text-neutral-300 hover:text-emerald-400 transition-colors duration-200"
                  aria-label="Email us at info@newhillspices.com"
                >
                  info@newhillspices.com
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4">
              <div className="flex flex-wrap gap-2">
                <span className="trust-badge bg-emerald-100 text-emerald-800">
                  FSSAI Certified
                </span>
                <span className="trust-badge bg-emerald-100 text-emerald-800">
                  Organic
                </span>
                <span className="trust-badge bg-emerald-100 text-emerald-800">
                  Since 1995
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-neutral-400">
              © {new Date().getFullYear()} Newhill Spices. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/policies/terms"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/policies/privacy"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/policies/gst-faq"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
              >
                GST FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
