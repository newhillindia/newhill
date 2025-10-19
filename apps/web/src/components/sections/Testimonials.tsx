'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import Carousel from '../ui/Carousel';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
  location?: string;
  verified?: boolean;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  showCarousel?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function Testimonials({
  testimonials,
  title = "What Our Customers Say",
  subtitle = "Don't just take our word for it. Here's what our valued customers have to say about our premium spices.",
  showCarousel = true,
  autoplay = true,
  className = ''
}: TestimonialsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300'
        }`}
      />
    ));
  };

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="testimonial-card h-full">
      <div className="flex items-start space-x-4">
        {/* Quote Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Quote className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {renderStars(testimonial.rating)}
          </div>

          {/* Testimonial Text */}
          <blockquote className="text-neutral-700 mb-4 leading-relaxed">
            "{testimonial.content}"
          </blockquote>

          {/* Author Info */}
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {testimonial.image ? (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Author Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-neutral-900">{testimonial.name}</h4>
                {testimonial.verified && (
                  <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                {testimonial.role}
                {testimonial.company && ` at ${testimonial.company}`}
              </p>
              {testimonial.location && (
                <p className="text-xs text-neutral-500">{testimonial.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={`section-padding bg-neutral-50 ${className}`}>
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Testimonials */}
        {showCarousel ? (
          <Carousel
            autoplay={autoplay}
            autoplayInterval={6000}
            showDots={true}
            showArrows={true}
            slidesToShow={1}
            slidesToScroll={1}
            infinite={true}
            className="max-w-4xl mx-auto"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-lg px-8 py-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">4.9</div>
              <div className="text-sm text-neutral-600">Average Rating</div>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10K+</div>
              <div className="text-sm text-neutral-600">Happy Customers</div>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">98%</div>
              <div className="text-sm text-neutral-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

