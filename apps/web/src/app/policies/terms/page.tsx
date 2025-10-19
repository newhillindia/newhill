'use client';

import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsAndConditions() {
  const lastUpdated = '2024-01-15';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Terms & Conditions
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Please read these terms and conditions carefully before using our services. 
              By using our website, you agree to be bound by these terms.
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
                Introduction
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                These Terms and Conditions ("Terms") govern your use of the Newhill Spices website 
                and services. By accessing or using our website, you agree to be bound by these 
                Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </div>

            {/* Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Acceptance of Terms
              </h2>
              <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-neutral-600 leading-relaxed">
                    By using our website, you acknowledge that you have read, understood, and agree 
                    to be bound by these Terms. These Terms constitute a legally binding agreement 
                    between you and Newhill Spices.
                  </p>
                </div>
              </div>
            </div>

            {/* Use of Website */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Use of Website
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Permitted Use
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    You may use our website for lawful purposes only. You agree not to:
                  </p>
                  <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                    <li>Use the website in any way that violates applicable laws or regulations</li>
                    <li>Transmit or send unsolicited commercial communications</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the website</li>
                    <li>Use automated systems to access the website without permission</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Products and Services */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Products and Services
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Product Information
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We strive to provide accurate product information, including descriptions, 
                    prices, and availability. However, we do not warrant that product descriptions 
                    or other content is accurate, complete, or error-free.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Pricing and Payment
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    All prices are subject to change without notice. Payment must be made in full 
                    before products are shipped. We accept various payment methods as displayed 
                    on our website.
                  </p>
                </div>
              </div>
            </div>

            {/* Orders and Shipping */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Orders and Shipping
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Order Processing
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    All orders are subject to acceptance by us. We reserve the right to refuse 
                    or cancel any order at our sole discretion. We will notify you if your order 
                    is cancelled.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Shipping and Delivery
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Shipping times and costs are provided at checkout. We are not responsible 
                    for delays caused by shipping carriers or circumstances beyond our control. 
                    Risk of loss passes to you upon delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Returns and Refunds */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Returns and Refunds
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Return Policy
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We offer a 30-day return policy for unopened products in their original 
                    packaging. Returns must be initiated within 30 days of delivery. Please 
                    contact our customer service team to initiate a return.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                    Refund Process
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Refunds will be processed within 5-7 business days after we receive the 
                    returned product. Refunds will be issued to the original payment method 
                    used for the purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Intellectual Property
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-600 leading-relaxed">
                  All content on our website, including text, graphics, logos, images, and software, 
                  is the property of Newhill Spices and is protected by copyright and other 
                  intellectual property laws.
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  You may not reproduce, distribute, modify, or create derivative works from our 
                  content without our express written permission.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Limitation of Liability
              </h2>
              <div className="flex items-start space-x-4 p-6 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    To the maximum extent permitted by law, Newhill Spices shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages 
                    arising out of your use of our website or services.
                  </p>
                </div>
              </div>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Indemnification
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                You agree to indemnify and hold harmless Newhill Spices from any claims, damages, 
                or expenses arising from your use of our website or violation of these Terms.
              </p>
            </div>

            {/* Privacy */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Privacy
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of our website, to understand our practices.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Governing Law
              </h2>
              <div className="flex items-start space-x-4 p-6 bg-neutral-50 rounded-lg">
                <Scale className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-neutral-600 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws 
                    of India. Any disputes arising from these Terms shall be subject to the 
                    exclusive jurisdiction of the courts in Kerala, India.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Changes to Terms
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users 
                of any material changes by posting the new Terms on our website. Your continued 
                use of our services after such modifications constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Severability */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Severability
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, 
                the remaining provisions will remain in full force and effect.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Contact Information
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="space-y-2 text-neutral-600">
                  <p><strong>Email:</strong> legal@newhillspices.com</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
                  <p><strong>Address:</strong> Newhill Spices, Munnar, Kerala 685612, India</p>
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
            Questions About Our Terms?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            We're here to help clarify any questions you may have about our terms and conditions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="/contact"
              className="btn-primary bg-white text-emerald-600 hover:bg-emerald-50"
            >
              Contact Us
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

