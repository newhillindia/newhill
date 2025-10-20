'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Globe, ChevronDown } from 'lucide-react';

interface HeaderProps {
  cartItemCount?: number;
  onSearch?: (query: string) => void;
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
  availableLanguages?: string[];
}

export default function Header({
  cartItemCount = 0,
  onSearch,
  onLanguageChange,
  currentLanguage = 'en',
  availableLanguages = ['en', 'hi', 'ar'  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);olled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLanguageChange = (language: string) => {
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-l      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white shadow-sm'
        }`}
        role="banner"
      >
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="container-max">
          <div className="flex items-            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg" aria-label="Newhill Spices Home">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-heading text-xl font-bold text-emerald-600 hidden sm:block">
                Newhill Spices
              </span>
            </Link>  Newhill            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              <Link
                href="/"
                className="text-neutral-700 hover:text-emerald-600 transition-colors duration-200 font-medium relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full" />
              </Link>
              <Link
                href="/products"
                className="text-neutral-700 hover:text-emerald-600 transition-colors duration-200 font-medium relative group"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full" />
              </Link>
              <Link
                href="/about"
                className="text-neutral-700 hover:text-emerald-600 transition-colors duration-200 font-medium relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full" />
              </Link>
              <Link
                href="/contact"
                className="text-neutral-700 hover:text-emerald-600 transition-colors duration-200 font-medium relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full" />
              </Link>
            </nav>            >
                Contact
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search spices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  />
                </div>
              </form>
            </div>

            {/* Right sid              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                  className="flex items-center space-x-1 text-neutral-700 hover:text-emerald-600 transition-colors duration-200 p-2 rounded-lg hover:bg-neutral-50"
                  aria-label="Select language"
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="true"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase hidden sm:inline">{currentLanguage}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-neutral-200 transition-all duration-200 ${
                  isLanguageOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`} role="menu">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        handleLanguageChange(lang);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        currentLanguage === lang ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-neutral-700'
                      }`}
                      role="menuitem"
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'العربية'}
                    </button>
                  ))}
                </div>
              </div>                </button>
                  ))}
                </div>
              </div>

              {/* Search Button (Mobile) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-neutral-700 hover:text-emerald-600 transition-colors duration-200"
                aria-label="Search"
                    {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-neutral-700 hover:text-emerald-600 transition-all duration-200 hover:bg-neutral-50 rounded-lg group"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center font-semibold shadow-md animate-scale-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link> 99 ? '99+' : c              {/* Account */}
              <Link
                href="/account"
                className="p-2 text-neutral-700 hover:text-emerald-600 transition-all duration-200 hover:bg-neutral-50 rounded-lg group"
                aria-label="My account"
              >
                <User className="w-5 h-5 transition-transform group-hover:scale-110" />
              </Link>Account"
               {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-neutral-700 hover:text-emerald-600 transition-all duration-200 hover:bg-neutral-50 rounded-lg"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>sMenuOpen ? <X className="w-5 h-5" /> : <Menu cl          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="lg:hidden border-t border-neutral-200 px-4 py-3 animate-slide-down" role="search">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="search"
                    placeholder="Search spices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    aria-label="Search spices"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}"
                         {/* Mobile Menu */}
          {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden border-t border-neutral-200 bg-white animate-slide-down" role="navigation" aria-label="Mobile navigation">
              <nav className="px-4 py-4 space-y-1">
                <Link
                  href="/"
                  className="block text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium py-3 px-4 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium py-3 px-4 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="block text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium py-3 px-4 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium py-3 px-4 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/faq"
                  className="block text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium py-3 px-4 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </nav>
            </div>
          )}(false)}
                >
                  FAQ
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-16" />
    </>
  );
}

