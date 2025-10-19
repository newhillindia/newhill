'use client';

import React from 'react';
import { RefreshCw, Clock, CheckCircle, AlertCircle, Package, CreditCard } from 'lucide-react';

export default function RefundPolicy() {
  const lastUpdated = '2024-01-15';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Refund Policy
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              We want you to be completely satisfied with your purchase. 
              Here's everything you need to know about our refund and return process.
            </p>
            <div className="mt-6 text-sm text-emerald-200">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto prose prose-lg">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">
                Our Commitment
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                At Newhill Spices, we stand behind the quality of our products. We want you to 
                be completely satisfied with your purchase. If you're not happy with your order, 
                we'll work with you to make it right.
              </p>
            </div>

            {/* Return Policy Overview */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Return Policy Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-emerald-50 rounded-lg">
                  <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    30-Day Window
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Returns must be initiated within 30 days of delivery
                  </p>
                </div>
                <div className="text-center p-6 bg-emerald-50 rounded-lg">
                  <Package className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Original Packaging
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Products must be unopened and in original packaging
                  </p>
                </div>
                <div className="text-center p-6 bg-emerald-50 rounded-lg">
                  <CreditCard className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Full Refund
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Receive a full refund to your original payment method
                  </p>
                </div>
              </div>
            </div>

            {/* Eligibility for Returns */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                What Can Be Returned
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Eligible for Return
                    </h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1">
                      <li>Unopened products in original packaging</li>
                      <li>Products damaged during shipping</li>
                      <li>Wrong items received</li>
                      <li>Products that don't match the description</li>
                      <li>Defective products</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-red-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Not Eligible for Return
                    </h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1">
                      <li>Opened or used products</li>
                      <li>Products damaged by customer</li>
                      <li>Perishable items (if opened)</li>
                      <li>Custom or personalized orders</li>
                      <li>Products returned after 30 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Process */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                How to Return an Item
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Contact Customer Service
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Email us at returns@newhillspices.com or call +91 98765 43210 with your 
                      order number and reason for return. We'll provide you with a Return 
                      Authorization (RA) number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Package the Item
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Pack the item securely in its original packaging. Include the RA number 
                      on the outside of the package. Use the original shipping box if possible.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Ship the Package
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Ship the package to our return address. We recommend using a trackable 
                      shipping method. You are responsible for return shipping costs unless 
                      the return is due to our error.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Receive Your Refund
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Once we receive and inspect the returned item, we'll process your refund 
                      within 5-7 business days. You'll receive an email confirmation when the 
                      refund is processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Processing */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Refund Processing
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Processing Time
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Refunds are typically processed within 5-7 business days after we receive 
                    the returned item. The refund will be credited to your original payment 
                    method within 7-10 business days, depending on your bank or credit card company.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Refund Amount
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    You'll receive a full refund of the product price. If the return is due to 
                    our error (wrong item, damaged item), we'll also refund the original shipping 
                    cost. Otherwise, return shipping costs are the customer's responsibility.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Refund Method
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Refunds are issued to the original payment method used for the purchase. 
                    If that's not possible, we'll issue a store credit or alternative refund method.
                  </p>
                </div>
              </div>
            </div>

            {/* Exchange Policy */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Exchange Policy
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-600 leading-relaxed">
                  We offer exchanges for the same product in a different size or variant, 
                  subject to availability. Exchange requests must be made within 30 days of 
                  delivery and follow the same process as returns.
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  If the replacement item costs more than the original, you'll need to pay 
                  the difference. If it costs less, we'll refund the difference.
                </p>
              </div>
            </div>

            {/* Damaged or Defective Items */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Damaged or Defective Items
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-600 leading-relaxed">
                  If you receive a damaged or defective item, please contact us immediately. 
                  We'll arrange for a replacement or full refund at no cost to you.
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  Please provide photos of the damage when contacting us, as this helps us 
                  process your claim faster and improve our packaging.
                </p>
              </div>
            </div>

            {/* Return Address */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Return Address
              </h2>
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="space-y-2 text-neutral-600">
                  <p><strong>Newhill Spices Returns</strong></p>
                  <p>Attn: Returns Department</p>
                  <p>Munnar, Kerala 685612</p>
                  <p>India</p>
                  <p className="mt-4"><strong>Phone:</strong> +91 98765 43210</p>
                  <p><strong>Email:</strong> returns@newhillspices.com</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Questions About Returns?
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                If you have any questions about our return policy or need help with a return, 
                please don't hesitate to contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-lg">
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Customer Service
                  </h3>
                  <p className="text-neutral-600 mb-2">Email: support@newhillspices.com</p>
                  <p className="text-neutral-600">Phone: +91 98765 43210</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-lg">
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Returns Department
                  </h3>
                  <p className="text-neutral-600 mb-2">Email: returns@newhillspices.com</p>
                  <p className="text-neutral-600">Phone: +91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-emerald-600 text-white">
        <div className="container-max text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Need Help with a Return?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our customer service team is here to help you with any questions about returns or refunds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="/contact"
              className="btn-primary bg-white text-emerald-600 hover:bg-emerald-50"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="btn-secondary border-white text-white hover:bg-white hover:text-emerald-600"
            >
              View FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

