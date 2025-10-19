'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-emerald-600">
          <div className="container-max section-padding">
            <div className="text-center">
              <h3 className="text-2xl font-heading font-bold mb-4">
                Stay Updated with Our Latest Spices
              </h3>
              <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
                Get exclusive offers, new product announcements, and cooking tips delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-500 text-neutral-900"
                    required
                  />
                  <button
                    type="submit"
                    className="btn-gold px-6 py-3 whitespace-nowrap"
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
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
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
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/newhillspices"
                className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200"
                aria-label="YouTube"
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
                <div className="text-sm text-neutral-300">
                  <p>Newhill Spices</p>
                  <p>Munnar, Kerala 685612</p>
                  <p>India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-neutral-300 hover:text-emerald-400 transition-colors duration-200"
                >
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:info@newhillspices.com"
                  className="text-sm text-neutral-300 hover:text-emerald-400 transition-colors duration-200"
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
