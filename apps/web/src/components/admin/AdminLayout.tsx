'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import RoleGuard from '../auth/RoleGuard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminModules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    href: '/admin',
    description: 'Overview and KPIs'
  },
  {
    id: 'products',
    name: 'Products',
    icon: '🛍️',
    href: '/admin/products',
    description: 'Manage products, variants, and inventory'
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: '📦',
    href: '/admin/orders',
    description: 'Track and fulfill orders'
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: '👥',
    href: '/admin/customers',
    description: 'Customer data and insights'
  },
  {
    id: 'b2b',
    name: 'B2B Management',
    icon: '🏢',
    href: '/admin/b2b',
    description: 'Business accounts and quotes'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    href: '/admin/finance',
    description: 'Revenue and reporting'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📢',
    href: '/admin/marketing',
    description: 'Promotions and campaigns'
  },
  {
    id: 'support',
    name: 'Support',
    icon: '🎧',
    href: '/admin/support',
    description: 'Tickets and customer service'
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    href: '/admin/security',
    description: 'Roles and permissions'
  },
  {
    id: 'toggles',
    name: 'Toggles',
    icon: '⚙️',
    href: '/admin/toggles',
    description: 'Feature flags and settings'
  },
  {
    id: 'cms',
    name: 'CMS',
    icon: '📝',
    href: '/admin/cms',
    description: 'Content management'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    href: '/admin/analytics',
    description: 'Insights and monitoring'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NS</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Newhill Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {adminModules.map((module) => {
                const isActive = pathname === module.href || 
                  (module.href !== '/admin' && pathname.startsWith(module.href));
                
                return (
                  <Link
                    key={module.id}
                    href={module.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-lg">{module.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{module.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
                <Link
                  href="/"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View Storefront
                </Link>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}


