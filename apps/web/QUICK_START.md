# Quick Start Guide - Newhill Spices Frontend

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── about/              # About page
│   │   ├── contact/            # Contact page
│   │   ├── products/           # Products listing & detail
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── account/            # User account pages
│   │   └── admin/              # Admin pages
│   │
│   ├── components/             # Reusable components
│   │   ├── layout/             # Header, Footer
│   │   ├── sections/           # Hero3D, USPCard, Testimonials
│   │   ├── catalog/            # ProductCard, Filters, Sort
│   │   └── ui/                 # FloatingCartButton, Carousel
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   └── pages/                  # Legacy pages (if any)
│
├── public/                     # Static assets
│   ├── images/                 # Images (add your images here)
│   ├── site.webmanifest        # PWA manifest
│   └── robots.txt              # SEO configuration
│
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

---

## 🎨 Design System

### Colors (Tailwind Classes)

```tsx
// Primary
className="bg-emerald-600 text-white"
className="text-emerald-600"

// Accent
className="bg-yellow-500 text-white"  // Gold
className="text-yellow-500"

// Neutrals
className="bg-neutral-50"  // Lightest
className="bg-neutral-900 text-white"  // Darkest
```

### Buttons

```tsx
// Primary button
<button className="btn-primary">Click me</button>

// Secondary button
<button className="btn-secondary">Click me</button>

// Gold button
<button className="btn-gold">Subscribe</button>

// Ghost button
<button className="btn-ghost">Cancel</button>
```

### Cards

```tsx
// Basic card
<div className="card">Content</div>

// Hoverable card
<div className="card-hover">Content</div>

// Gradient card
<div className="card-gradient">Content</div>
```

### Layout

```tsx
// Section with padding
<section className="section-padding">
  <div className="container-max">
    {/* Content */}
  </div>
</section>
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `src/app/new-page/page.tsx`
2. Export default component
3. Add metadata:

```tsx
export const metadata = {
  title: 'Page Title',
  description: 'Page description'
}

export default function NewPage() {
  return <div>Content</div>
}
```

### Adding a Component

```tsx
// src/components/ui/MyComponent.tsx
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  // ...other props
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
    </div>
  );
}
```

### Using Images

```tsx
import Image from 'next/image';

<Image
  src="/images/product.jpg"
  alt="Product description"
  width={400}
  height={400}
  className="object-cover rounded-lg"
  loading="lazy"
/>
```

### Adding Animations

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>

// Custom delay
<div 
  className="animate-slide-up" 
  style={{ animationDelay: '0.2s' }}
>
  Content
</div>
```

---

## ♿ Accessibility Checklist

### Every Component Should Have:

- [ ] Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, etc.)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] `aria-label` for icon-only buttons
- [ ] `alt` text for all images
- [ ] Focus states for interactive elements
- [ ] Keyboard navigation support

### Example:

```tsx
// ✅ Good
<button 
  aria-label="Add to cart"
  className="focus:ring-2 focus:ring-emerald-500"
>
  <ShoppingCart />
</button>

// ❌ Bad
<button>
  <ShoppingCart />
</button>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 640px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Tailwind Responsive Classes

```tsx
<div className="
  text-sm      // mobile
  md:text-base // tablet
  lg:text-lg   // desktop
">
  Responsive text
</div>

<div className="
  grid 
  grid-cols-1      // mobile: 1 column
  md:grid-cols-2   // tablet: 2 columns
  lg:grid-cols-4   // desktop: 4 columns
  gap-4
">
  {/* Grid items */}
</div>
```

---

## 🔍 SEO Best Practices

### Page Metadata

```tsx
// In page.tsx
export const metadata = {
  title: 'Page Title | Newhill Spices',
  description: 'Clear, concise description (150-160 chars)',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/images/og-image.jpg'],
  }
}
```

### Semantic Structure

```tsx
<article>
  <header>
    <h1>Main Title</h1>
  </header>
  <section>
    <h2>Section Title</h2>
    <p>Content...</p>
  </section>
</article>
```

---

## 🎯 Performance Tips

### Image Optimization

1. Use Next.js `Image` component
2. Specify `width` and `height`
3. Use `loading="lazy"` for below-fold images
4. Optimize images to < 100KB
5. Use WebP format

### Code Splitting

```tsx
// Dynamic import for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // Disable SSR if needed
});
```

### Reduce Re-renders

```tsx
// Use React.memo for expensive components
const ProductCard = React.memo(({ product }) => {
  // Component code
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensive(data);
}, [data]);
```

---

## 🐛 Debugging

### Common Issues

**1. Hydration Errors**
- Ensure server and client render the same HTML
- Don't use `Date.now()` or random values in initial render
- Use `useEffect` for client-only code

**2. Images Not Loading**
- Check `next.config.js` image domains
- Verify image path is correct
- Check CORS settings

**3. Styles Not Applying**
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind class names

### Debug Tools

```tsx
// Environment check
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// TypeScript type checking
npm run type-check

// Lint checking
npm run lint
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional for production
CLOUDFRONT_DOMAIN=your-cloudfront-domain
S3_BUCKET_DOMAIN=your-s3-bucket-domain
```

### Usage

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Only use NEXT_PUBLIC_ prefix for client-side variables
```

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audits
- [WAVE](https://wave.webaim.org/) - Accessibility testing
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance metrics

### Icons
- [Lucide Icons](https://lucide.dev/) - Icon library used in project

---

## 💡 Tips & Tricks

### VS Code Extensions
- ESLint
- Tailwind CSS IntelliSense
- Error Lens
- Auto Rename Tag
- Prettier

### Keyboard Shortcuts
- `Ctrl/Cmd + Click` - Go to definition
- `F2` - Rename symbol
- `Ctrl/Cmd + D` - Select next occurrence
- `Alt + Up/Down` - Move line

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/new-feature
```

---

## 🆘 Getting Help

### Before Asking:
1. Check this guide
2. Search existing issues
3. Check documentation
4. Google the error message

### Where to Ask:
- Team Slack/Discord channel
- GitHub Issues
- Stack Overflow

### Include in Question:
- What you're trying to do
- What you expected
- What actually happened
- Error messages
- Code snippet
- Steps to reproduce

---

## ✅ Pre-Commit Checklist

Before committing code:
- [ ] Code builds without errors
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Removed debug console.logs
- [ ] Tested on mobile view
- [ ] Checked accessibility (tab navigation)
- [ ] Added proper alt text for images
- [ ] Updated documentation if needed

---

## 🎉 You're Ready!

Start building amazing features for Newhill Spices!

**Happy Coding! 🚀**
