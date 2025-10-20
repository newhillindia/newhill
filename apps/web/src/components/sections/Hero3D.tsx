'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Play, Sparkles } from 'lucide-react';

interface Hero3DProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  backgroundImage?: string;
  showParticles?: boolean;
  onCTAClick?: (ctaType: 'primary' | 'secondary') => void;
}

export default function Hero3D({
  title = "Premium Spices from Farm to Table",
  subtitle = "Discover the finest spices directly from our farms in Munnar, Kerala. Since 1995, we've been bringing you authentic flavors that transform every meal.",
  primaryCTA = {
    text: "Shop Now",
    href: "/products"
  },
  secondaryCTA = {
    text: "Our Story",
    href: "/about"
  },
  backgroundImage,
  showParticles = true,
  onCTAClick
}: Hero3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!showParticles || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initParticles = () => {
      const newParticles = [];
      const colors = ['#046E5B', '#0A8B73', '#D4AF37', '#E6C659'];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setParticles(newParticles);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Draw connections
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = particle.color + Math.floor((1 - distance / 100) * 50).toString(16).padStart(2, '0');
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      });
      
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    setIsLoaded(true);
    
    const animationId = requestAnimationFrame(animate);
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [showParticles, part  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-3d-container" aria-label="Hero section">);
       {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-emerald-600/20" />
        </div>
      )}        class      {/* Particles Canvas */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 w-full h-full"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          aria-hidden="true"
          role="presentation"
        />
      )}ame="absolute inset-0 z-10 w-full h-full"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
        />
      )}

      {/* Conte          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in shadow-lg" role="banner">
            <Sparkles className="w-4 h-4 text-gold animate-pulse-slow" aria-hidden="true" />
            <span className="text-sm font-semibold">Premium Quality Since 1995</span>
          </div>    <Sp          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight animate-slide-up">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>ubtitle */}          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <a
              href={primaryCTA.href}
              onClick={() => handleCTAClick('primary')}
              className="btn-primary text-lg px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 group shadow-lg hover:shadow-xl"
              aria-label={`${primaryCTA.text} - Browse our products`}
            >
              <span className="flex items-center space-x-2">
                <span>{primaryCTA.text}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              </span>
            </a>
            
            <a
              href={secondaryCTA.href}
              onClick={() => handleCTAClick('secondary')}
              className="btn-secondary text-lg px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 group shadow-lg hover:shadow-xl"
              aria-label={`${secondaryCTA.text} - Learn more about us`}
            >
              <span className="flex items-center space-x-2">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                <span>{secondaryCTA.text}</span>
              </span>
            </a>
          </div>-hover:scale-110 transition-transform duration-200" />
                <span>{secondaryCTA.text}</span>
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Farm Fresh</h3>
              <p className="text-sm text-emerald-100">Direct from our farms in Munnar</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-emerald-100">FSSAI certified & organic</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2"      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20" aria-hidden="true">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center shadow-md">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div> border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

