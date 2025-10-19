'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'b2c' | 'b2b' | 'shipping' | 'returns' | 'general';
  tags: string[];
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqData: FAQItem[] = [
    // B2C FAQs
    {
      id: '1',
      question: 'How long does shipping take?',
      answer: 'We offer free shipping across India with delivery times of 3-5 business days for most locations. Express delivery options are available for urgent orders with 1-2 day delivery.',
      category: 'b2c',
      tags: ['shipping', 'delivery', 'timeline']
    },
    {
      id: '2',
      question: 'What are your shipping charges?',
      answer: 'We provide free shipping on all orders above ₹500. For orders below ₹500, a nominal shipping charge of ₹50 applies. Express delivery charges are ₹100.',
      category: 'b2c',
      tags: ['shipping', 'charges', 'free']
    },
    {
      id: '3',
      question: 'Are your spices organic?',
      answer: 'Yes, all our spices are certified organic and grown using sustainable farming practices. We maintain strict quality standards and are FSSAI certified for food safety.',
      category: 'b2c',
      tags: ['organic', 'certification', 'quality']
    },
    {
      id: '4',
      question: 'How should I store the spices?',
      answer: 'Store spices in a cool, dry place away from direct sunlight. Use airtight containers to maintain freshness. Ground spices stay fresh for 6 months, while whole spices can last up to 2 years.',
      category: 'b2c',
      tags: ['storage', 'freshness', 'shelf-life']
    },
    {
      id: '5',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unopened products. If you\'re not satisfied with your purchase, we\'ll provide a full refund or replacement. Contact our customer service to initiate a return.',
      category: 'b2c',
      tags: ['returns', 'refund', 'policy']
    },
    {
      id: '6',
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer discounts on bulk orders. For orders above ₹5000, you get 5% off. For orders above ₹10000, you get 10% off. Contact us for custom pricing on very large orders.',
      category: 'b2c',
      tags: ['bulk', 'discount', 'pricing']
    },
    
    // B2B FAQs
    {
      id: '7',
      question: 'Do you offer B2B pricing?',
      answer: 'Yes, we offer special pricing for restaurants, food businesses, and bulk orders. Our B2B pricing starts at 15% off retail prices with additional discounts for larger volumes.',
      category: 'b2b',
      tags: ['b2b', 'pricing', 'restaurant']
    },
    {
      id: '8',
      question: 'What are your minimum order quantities for B2B?',
      answer: 'Our minimum order quantity for B2B customers is ₹10,000. We can accommodate custom requirements for larger establishments and provide flexible payment terms.',
      category: 'b2b',
      tags: ['b2b', 'minimum', 'quantity']
    },
    {
      id: '9',
      question: 'Do you provide B2B customers with invoices?',
      answer: 'Yes, we provide proper GST invoices for all B2B orders. Our invoices include all necessary details for tax compliance and accounting purposes.',
      category: 'b2b',
      tags: ['b2b', 'invoice', 'gst']
    },
    {
      id: '10',
      question: 'Can you supply custom spice blends?',
      answer: 'Yes, we can create custom spice blends according to your specifications. Our team works with you to develop unique blends that meet your culinary requirements.',
      category: 'b2b',
      tags: ['b2b', 'custom', 'blends']
    },
    
    // Shipping FAQs
    {
      id: '11',
      question: 'Which areas do you deliver to?',
      answer: 'We deliver to all major cities and towns across India. We also deliver to remote areas, though delivery times may be longer. Contact us to confirm delivery to your specific location.',
      category: 'shipping',
      tags: ['delivery', 'areas', 'coverage']
    },
    {
      id: '12',
      question: 'Can I track my order?',
      answer: 'Yes, once your order is shipped, you\'ll receive a tracking number via SMS and email. You can track your order status on our website or through the courier company\'s website.',
      category: 'shipping',
      tags: ['tracking', 'order', 'status']
    },
    {
      id: '13',
      question: 'What if I\'m not available during delivery?',
      answer: 'Our delivery partners will attempt delivery twice. If you\'re not available, they\'ll leave a calling card with contact details. You can reschedule delivery or collect from their nearest facility.',
      category: 'shipping',
      tags: ['delivery', 'unavailable', 'reschedule']
    },
    
    // Returns FAQs
    {
      id: '14',
      question: 'How do I return a product?',
      answer: 'To return a product, contact our customer service team with your order number. We\'ll provide you with a return authorization and guide you through the process. Returns must be in original packaging.',
      category: 'returns',
      tags: ['return', 'process', 'packaging']
    },
    {
      id: '15',
      question: 'What if my product arrives damaged?',
      answer: 'If your product arrives damaged, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or refund at no additional cost to you.',
      category: 'returns',
      tags: ['damaged', 'replacement', 'refund']
    },
    {
      id: '16',
      question: 'How long does it take to process a refund?',
      answer: 'Once we receive your returned product, we process refunds within 3-5 business days. The refund will be credited to your original payment method within 7-10 business days.',
      category: 'returns',
      tags: ['refund', 'processing', 'timeline']
    },
    
    // General FAQs
    {
      id: '17',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery. All payments are processed securely through our payment partners.',
      category: 'general',
      tags: ['payment', 'methods', 'security']
    },
    {
      id: '18',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent.',
      category: 'general',
      tags: ['privacy', 'security', 'data']
    },
    {
      id: '19',
      question: 'Do you have a mobile app?',
      answer: 'Currently, we don\'t have a mobile app, but our website is fully optimized for mobile devices. We\'re working on a mobile app that will be available soon.',
      category: 'general',
      tags: ['mobile', 'app', 'website']
    },
    {
      id: '20',
      question: 'How can I contact customer support?',
      answer: 'You can contact our customer support team via phone (+91 98765 43210), email (support@newhillspices.com), or through our contact form. We\'re available Monday to Friday, 9 AM to 6 PM.',
      category: 'general',
      tags: ['support', 'contact', 'hours']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Questions' },
    { value: 'b2c', label: 'B2C Customers' },
    { value: 'b2b', label: 'B2B Customers' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'general', label: 'General' }
  ];

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const openAll = () => {
    setOpenItems(new Set(filteredFAQs.map(faq => faq.id)));
  };

  const closeAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Find answers to common questions about our products, shipping, returns, and more. 
              Can't find what you're looking for? We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-neutral-600">
                {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={openAll}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Open All
                </button>
                <span className="text-neutral-300">|</span>
                <button
                  onClick={closeAll}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Close All
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-2">
                  No questions found
                </h3>
                <p className="text-neutral-600 mb-6">
                  Try adjusting your search terms or browse different categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-neutral-200">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200"
                    >
                      <h3 className="font-heading text-lg font-semibold text-neutral-900 pr-4">
                        {faq.question}
                      </h3>
                      {openItems.has(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.has(faq.id) && (
                      <div className="px-6 pb-4">
                        <div className="pt-2 border-t border-neutral-100">
                          <p className="text-neutral-600 leading-relaxed">
                            {faq.answer}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {faq.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  Live Chat
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Chat with our support team in real-time
                </p>
                <button className="btn-primary text-sm">
                  Start Chat
                </button>
              </div>
              
              <div className="p-6 bg-neutral-50 rounded-lg">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  Call Us
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  +91 98765 43210
                </p>
                <a
                  href="tel:+919876543210"
                  className="btn-primary text-sm"
                >
                  Call Now
                </a>
              </div>
              
              <div className="p-6 bg-neutral-50 rounded-lg">
                <HelpCircle className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  Contact Form
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Send us a detailed message
                </p>
                <a
                  href="/contact"
                  className="btn-primary text-sm"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

