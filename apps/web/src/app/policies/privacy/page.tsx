'use client';

import React from 'react';
import { Shield, Eye, Lock, Database, Users, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = '2024-01-15';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
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
                Newhill Spices ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you visit our website or use our services. Please read this 
                privacy policy carefully. If you do not agree with the terms of this privacy 
                policy, please do not access the site.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Information We Collect
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3 flex items-center">
                    <Database className="w-5 h-5 text-emerald-600 mr-2" />
                    Personal Information
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    We may collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                    <li>Register for an account</li>
                    <li>Make a purchase</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Contact us for support</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  <p className="text-neutral-600 leading-relaxed mt-4">
                    This information may include your name, email address, phone number, 
                    billing address, shipping address, and payment information.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3 flex items-center">
                    <Eye className="w-5 h-5 text-emerald-600 mr-2" />
                    Automatically Collected Information
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We automatically collect certain information when you visit our website, including:
                  </p>
                  <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4 mt-4">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website</li>
                    <li>Device information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 text-emerald-600 mr-2" />
                    Cookies and Tracking Technologies
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience 
                    and analyze website traffic. You can control cookie settings through your 
                    browser preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                How We Use Your Information
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer support</li>
                <li>Sending order confirmations and shipping updates</li>
                <li>Marketing communications (with your consent)</li>
                <li>Improving our website and services</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Information Sharing and Disclosure
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third 
                parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>With service providers who assist us in operating our website and conducting our business</li>
                <li>With payment processors to complete transactions</li>
                <li>With shipping companies to deliver your orders</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Data Security
              </h2>
              <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-lg">
                <Lock className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                    Security Measures
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We implement appropriate security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction. This includes 
                    encryption, secure servers, and regular security audits.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Your Rights and Choices
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Withdraw consent for data processing</li>
                <li>File a complaint with supervisory authorities</li>
              </ul>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                International Data Transfers
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your 
                country of residence. We ensure that such transfers comply with applicable data 
                protection laws and implement appropriate safeguards.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Children's Privacy
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13. If you are a 
                parent or guardian and believe your child has provided us with personal 
                information, please contact us.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Changes to This Privacy Policy
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last 
                updated" date. You are advised to review this Privacy Policy periodically for 
                any changes.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-6">
                Contact Us
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="space-y-2 text-neutral-600">
                  <p><strong>Email:</strong> privacy@newhillspices.com</p>
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
            Questions About Your Privacy?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            We're committed to transparency and protecting your privacy. 
            Contact us if you have any questions or concerns.
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

