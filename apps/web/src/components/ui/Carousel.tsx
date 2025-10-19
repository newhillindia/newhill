'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  infinite?: boolean;
  className?: string;
  onSlideChange?: (currentSlide: number) => void;
}

export default function Carousel({
  children,
  autoplay = false,
  autoplayInterval = 5000,
  showDots = true,
  showArrows = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  infinite = true,
  className = '',
  onSlideChange
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = children.length;
  const maxSlide = Math.max(0, totalSlides - slidesToShow);

  const goToSlide = (slideIndex: number) => {
    if (isTransitioning) return;
    
    let newSlide = slideIndex;
    
    if (infinite) {
      if (slideIndex < 0) {
        newSlide = maxSlide;
      } else if (slideIndex > maxSlide) {
        newSlide = 0;
      }
    } else {
      newSlide = Math.max(0, Math.min(slideIndex, maxSlide));
    }
    
    setCurrentSlide(newSlide);
    setIsTransitioning(true);
    
    if (onSlideChange) {
      onSlideChange(newSlide);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    goToSlide(currentSlide + slidesToScroll);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - slidesToScroll);
  };

  const goToSlideByDot = (slideIndex: number) => {
    goToSlide(slideIndex);
  };

  // Autoplay effect
  useEffect(() => {
    if (autoplay && totalSlides > slidesToShow) {
      autoplayRef.current = setInterval(() => {
        nextSlide();
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, autoplayInterval, currentSlide, totalSlides, slidesToShow]);

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoplay && totalSlides > slidesToShow) {
      autoplayRef.current = setInterval(() => {
        nextSlide();
      }, autoplayInterval);
    }
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div 
      className={`carousel-container relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Track */}
      <div 
        ref={containerRef}
        className="carousel-track"
        style={{
          transform: `translateX(-${(currentSlide * 100) / slidesToShow}%)`,
          width: `${(totalSlides * 100) / slidesToShow}%`
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ width: `${100 / totalSlides}%` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > slidesToShow && (
        <>
          <button
            onClick={prevSlide}
            disabled={!infinite && currentSlide === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={!infinite && currentSlide >= maxSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && totalSlides > slidesToShow && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlideByDot(index * slidesToShow)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentSlide / slidesToShow) === index
                    ? 'bg-emerald-600 w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar (for autoplay) */}
      {autoplay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-emerald-600 transition-all duration-100"
            style={{
              width: `${((currentSlide + 1) / Math.ceil(totalSlides / slidesToShow)) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}

