'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Leaf, Users, Clock, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export default function About() {
  const timeline = [
    {
      year: '1995',
      title: 'The Beginning',
      description: 'PJ Chacko founded Newhill Spices with a vision to bring authentic, farm-fresh spices directly from Munnar to kitchens across India.',
      image: '/images/timeline-1995.jpg'
    },
    {
      year: '2005',
      title: 'Expansion',
      description: 'Expanded our operations to include organic farming practices and obtained FSSAI certification for quality assurance.',
      image: '/images/timeline-2005.jpg'
    },
    {
      year: '2015',
      title: 'Digital Transformation',
      description: 'Launched our online platform to reach customers nationwide, making premium spices accessible to everyone.',
      image: '/images/timeline-2015.jpg'
    },
    {
      year: '2020',
      title: 'B2B Growth',
      description: 'Introduced B2B services for restaurants and food businesses, establishing partnerships across the country.',
      image: '/images/timeline-2020.jpg'
    },
    {
      year: '2024',
      title: 'Present Day',
      description: 'Continuing to innovate with sustainable farming practices and expanding our reach to international markets.',
      image: '/images/timeline-2024.jpg'
    }
  ];

  const certifications = [
    { name: 'FSSAI Certified', description: 'Food Safety and Standards Authority of India' },
    { name: 'Organic Certified', description: 'Certified organic farming practices' },
    { name: 'ISO 22000', description: 'Food Safety Management System' },
    { name: 'HACCP', description: 'Hazard Analysis Critical Control Points' }
  ];

  const team = [
    {
      name: 'PJ Chacko',
      role: 'Founder',
      image: '/images/pj-chacko.jpg',
      description: 'With over 30 years of experience in spice farming, PJ Chacko founded Newhill Spices with a vision to bring authentic flavors to every kitchen.'
    },
    {
      name: 'Ebin Jacob',
      role: 'CEO',
      image: '/images/ebin-jacob.jpg',
      description: 'Leading our digital transformation and business growth, Ebin brings modern business practices while maintaining our traditional values.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              For over 25 years, we've been passionate about bringing you the finest spices 
              directly from our farms in Munnar, Kerala. Our journey is one of tradition, 
              quality, and unwavering commitment to authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="section-padding bg-white">
        <div className="container-max            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Meet Our Founder
              </h2>ont-bold text-neutral-900 mbm-6">
                Meet Our Founder
              </h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  PJ Chacko, our founder, started Newhill Spices in 1995 with a simple yet powerful vision: 
                  to bring authentic, farm-fresh spices directly from the hills of Munnar to kitchens across India.
                </p>
                <p>
                  Growing up in the spice-rich region of Kerala, PJ understood the importance of quality and 
                  authenticity in spices. He saw how middlemen were diluting the quality and increasing prices, 
                  making it difficult for families to access the pure, aromatic spices that Kerala is famous for.
                </p>
                <p>
                  Today, with over 30 years of experience in spice farming and processing, PJ continues to 
                  oversee our operations, ensuring that every batch of spices meets our high standards of 
                  quality and authenticity.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/contact" className="btn-primary">
                  Get in Touch
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src="/images/pj-chacko-founder.jpg"
                  alt="PJ Chacko, Founder of Newhill Spices"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-6 rounded-lg">
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              From a small farm in Munnar to becoming one of India's most trusted spice brands, 
              here's our story of growth and commitment to quality.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 w-full md:w-1/3">
                      <div className="aspect-video rounded-lg overflow-hidden bg-neutral-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-emerald-600 font-bold text-lg mb-2">{item.year}</div>
                      <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Our Certifications
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              We maintain the highest standards of quality and safety, backed by industry certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm text-neutral-600">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Our Team
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Meet the passionate people behind Newhill Spices, dedicated to bringing you the finest spices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-200 mx-auto mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-emerald-600 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              These core values guide everything we do, from farming to customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-4">
                Sustainability
              </h3>
              <p className="text-neutral-600">
                We practice sustainable farming methods that protect the environment 
                and ensure the long-term health of our land.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-4">
                Quality
              </h3>
              <p className="text-neutral-600">
                We never compromise on quality. Every spice that leaves our facility 
                meets our strict standards for purity and freshness.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-4">
                Community
              </h3>
              <p className="text-neutral-600">
                We support our local farming community and believe in fair trade 
                practices that benefit everyone involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-emerald-600 text-white">
        <div className="container-max text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Discover the authentic flavors of Kerala with our premium spices, 
            carefully selected and processed to bring you the best.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/products" className="btn-primary bg-white text-emerald-600 hover:bg-emerald-50">
              Shop Now
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-emerald-600">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

