'use client';

import React, { useState } from 'react';
import { Calculator, Receipt, Building, Globe, ChevronDown, ChevronUp } from 'lucide-react';

export default function GSTFAQ() {
  const lastUpdated = '2024-01-15';
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const gstFAQs = [
    {
      id: '1',
      question: 'What is GST and how does it apply to spice purchases?',
      answer: 'GST (Goods and Services Tax) is a comprehensive indirect tax levied on the supply of goods and services in India. For spices, the current GST rate is 5% for most whole spices and 12% for processed or ground spices. This tax is included in the price displayed on our website.',
      category: 'general'
    },
    {
      id: '2',
      question: 'Do I need to pay GST on my spice order?',
      answer: 'Yes, GST is applicable on all spice purchases. The tax is already included in the price you see on our website, so the amount you pay at checkout is the final amount including all taxes.',
      category: 'general'
    },
    {
      id: '3',
      question: 'What is your GST registration number?',
      answer: 'Our GST registration number is 32ABCDE1234F1Z5. This number is printed on all invoices and can be used for tax compliance and input tax credit claims.',
      category: 'general'
    },
    {
      id: '4',
      question: 'Will I receive a GST invoice for my purchase?',
      answer: 'Yes, all purchases come with a proper GST invoice that includes our GST registration number, HSN codes for the products, and the applicable tax rates. This invoice is essential for business customers who need to claim input tax credit.',
      category: 'b2b'
    },
    {
      id: '5',
      question: 'What are HSN codes for spices?',
      answer: 'HSN (Harmonized System of Nomenclature) codes are used to classify goods for GST purposes. Common HSN codes for spices include: 0904 for pepper, 0908 for cardamom, 0909 for seeds of anise, badian, fennel, coriander, cumin, and caraway, and 0910 for ginger, saffron, turmeric, thyme, bay leaves, and curry.',
      category: 'b2b'
    },
    {
      id: '6',
      question: 'Can I claim input tax credit on spice purchases?',
      answer: 'Yes, if you are a registered business entity with a valid GST registration, you can claim input tax credit on spice purchases for business use. The credit can be used to offset your output tax liability.',
      category: 'b2b'
    },
    {
      id: '7',
      question: 'What is the difference between CGST, SGST, and IGST?',
      answer: 'CGST (Central GST) and SGST (State GST) apply to intra-state supplies, while IGST (Integrated GST) applies to inter-state supplies. For example, if you order from Kerala to Delhi, IGST will be charged. If you order within Kerala, CGST + SGST will be charged.',
      category: 'general'
    },
    {
      id: '8',
      question: 'Do you charge different GST rates for different types of spices?',
      answer: 'Yes, different spice categories have different GST rates: Whole spices (like cardamom, pepper, cinnamon) are taxed at 5%, while processed spices (ground, powdered, or mixed) are taxed at 12%. We automatically apply the correct rate based on the product category.',
      category: 'general'
    },
    {
      id: '9',
      question: 'What if I need a reverse charge mechanism invoice?',
      answer: 'We can provide reverse charge mechanism invoices for specific business requirements. Please contact our B2B team at b2b@newhillspices.com with your GST registration details and requirements.',
      category: 'b2b'
    },
    {
      id: '10',
      question: 'How do I update my GST details for invoicing?',
      answer: 'You can update your GST registration details in your account settings or contact our customer service team. For B2B customers, we require your GST registration certificate and business details for proper invoicing.',
      category: 'b2b'
    },
    {
      id: '11',
      question: 'What happens if I provide incorrect GST details?',
      answer: 'Incorrect GST details may result in incorrect invoicing and could affect your input tax credit claims. Please ensure all details are accurate. If you notice an error, contact us immediately to correct the invoice.',
      category: 'b2b'
    },
    {
      id: '12',
      question: 'Do you have different GST rates for different states?',
      answer: 'GST rates are uniform across all states in India. However, the type of tax (CGST+SGST vs IGST) depends on whether the supply is intra-state or inter-state. The total tax rate remains the same regardless of the state.',
      category: 'general'
    },
    {
      id: '13',
      question: 'Can I get a tax-exempt invoice for export purposes?',
      answer: 'Yes, for export orders, we can provide tax-exempt invoices under the GST export provisions. Please provide your export documentation and IEC code when placing the order.',
      category: 'b2b'
    },
    {
      id: '14',
      question: 'What is the composition scheme and does it apply to spices?',
      answer: 'The composition scheme is a simplified tax regime for small businesses. However, it doesn\'t apply to spice trading as it\'s excluded from the composition scheme. All spice businesses must register under the regular GST regime.',
      category: 'general'
    },
    {
      id: '15',
      question: 'How do I verify your GST registration?',
      answer: 'You can verify our GST registration on the official GST portal (gst.gov.in) using our GST number: 32ABCDE1234F1Z5. This ensures you\'re dealing with a legitimate registered business.',
      category: 'general'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Questions' },
    { value: 'general', label: 'General GST' },
    { value: 'b2b', label: 'B2B & Business' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = gstFAQs.filter(faq => 
    selectedCategory === 'all' || faq.category === selectedCategory
  );

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              GST & Tax FAQ
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Everything you need to know about GST, taxes, and invoicing for your spice purchases. 
              Get clarity on tax rates, input credit, and compliance requirements.
            </p>
            <div className="mt-6 text-sm text-emerald-200">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <Receipt className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                GST Included
              </h3>
              <p className="text-sm text-neutral-600">
                All prices include applicable GST
              </p>
            </div>
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <Building className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                B2B Invoicing
              </h3>
              <p className="text-sm text-neutral-600">
                Proper GST invoices for businesses
              </p>
            </div>
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <Globe className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                Pan India
              </h3>
              <p className="text-sm text-neutral-600">
                Uniform GST rates across India
              </p>
            </div>
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <Calculator className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                Input Credit
              </h3>
              <p className="text-sm text-neutral-600">
                Claim input tax credit on purchases
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-neutral-600">
                Find answers to common GST and tax-related questions
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GST Rates Table */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
                GST Rates for Spices
              </h2>
              <p className="text-lg text-neutral-600">
                Current GST rates applicable to different categories of spices
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="border border-neutral-200 px-6 py-4 text-left font-semibold">
                      Spice Category
                    </th>
                    <th className="border border-neutral-200 px-6 py-4 text-left font-semibold">
                      HSN Code
                    </th>
                    <th className="border border-neutral-200 px-6 py-4 text-center font-semibold">
                      GST Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 px-6 py-4">Whole Spices (Cardamom, Pepper, Cinnamon)</td>
                    <td className="border border-neutral-200 px-6 py-4">0904, 0908, 0909</td>
                    <td className="border border-neutral-200 px-6 py-4 text-center font-semibold text-emerald-600">5%</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 px-6 py-4">Ground/Powdered Spices</td>
                    <td className="border border-neutral-200 px-6 py-4">0910</td>
                    <td className="border border-neutral-200 px-6 py-4 text-center font-semibold text-emerald-600">12%</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 px-6 py-4">Spice Blends and Mixtures</td>
                    <td className="border border-neutral-200 px-6 py-4">0910</td>
                    <td className="border border-neutral-200 px-6 py-4 text-center font-semibold text-emerald-600">12%</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 px-6 py-4">Turmeric (Whole)</td>
                    <td className="border border-neutral-200 px-6 py-4">0910</td>
                    <td className="border border-neutral-200 px-6 py-4 text-center font-semibold text-emerald-600">5%</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 px-6 py-4">Turmeric (Powdered)</td>
                    <td className="border border-neutral-200 px-6 py-4">0910</td>
                    <td className="border border-neutral-200 px-6 py-4 text-center font-semibold text-emerald-600">12%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
              Need More Help with GST?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Our team is here to help you understand GST requirements and ensure compliance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Building className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  B2B Support
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  For business customers and GST compliance
                </p>
                <p className="text-sm text-neutral-600 mb-2">Email: b2b@newhillspices.com</p>
                <p className="text-sm text-neutral-600">Phone: +91 98765 43210</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Receipt className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  Invoice Support
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  For invoice-related queries and corrections
                </p>
                <p className="text-sm text-neutral-600 mb-2">Email: invoices@newhillspices.com</p>
                <p className="text-sm text-neutral-600">Phone: +91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-emerald-600 text-white">
        <div className="container-max text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Place Your Order?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Browse our collection of premium spices with transparent pricing and proper GST invoicing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="/products"
              className="btn-primary bg-white text-emerald-600 hover:bg-emerald-50"
            >
              Shop Now
            </a>
            <a
              href="/contact"
              className="btn-secondary border-white text-white hover:bg-white hover:text-emerald-600"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

