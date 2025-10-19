'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: CMSPageTranslation[];
}

interface CMSPageTranslation {
  id: string;
  language: string;
  title: string;
  content: any;
  metaTitle: string;
  metaDescription: string;
}

export default function CMSPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);

  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    content: {
      type: 'page',
      blocks: []
    },
    metaTitle: '',
    metaDescription: '',
    isPublished: false
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageAction = async (pageId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/cms/pages/${pageId}/${action}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error('Error updating page:', error);
    }
  };

  const handleSavePage = async () => {
    try {
      const url = editingPage ? `/api/admin/cms/pages/${editingPage.id}` : '/api/admin/cms/pages';
      const method = editingPage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        setShowPageModal(false);
        setEditingPage(null);
        setPageData({
          title: '',
          slug: '',
          content: { type: 'page', blocks: [] },
          metaTitle: '',
          metaDescription: '',
          isPublished: false
        });
        fetchPages();
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'published' && page.isPublished) ||
      (statusFilter === 'draft' && !page.isPublished);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                Content Management System
              </h1>
              <p className="mt-2 text-gray-600">
                Manage pages, content, and translations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setEditingPage(null);
                  setPageData({
                    title: '',
                    slug: '',
                    content: { type: 'page', blocks: [] },
                    metaTitle: '',
                    metaDescription: '',
                    isPublished: false
                  });
                  setShowPageModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Pages
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or slug..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      /{page.slug}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {page.translations.length > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {page.translations.length} translations
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <div>Created: {new Date(page.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(page.updatedAt).toLocaleDateString()}</div>
                  {page.publishedAt && (
                    <div>Published: {new Date(page.publishedAt).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPage(page);
                        setShowPreviewModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setEditingPage(page);
                        setPageData({
                          title: page.title,
                          slug: page.slug,
                          content: page.content,
                          metaTitle: page.metaTitle || '',
                          metaDescription: page.metaDescription || '',
                          isPublished: page.isPublished
                        });
                        setShowPageModal(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageAction(page.id, page.isPublished ? 'unpublish' : 'publish')}
                      className={`text-sm px-2 py-1 rounded ${
                        page.isPublished 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {page.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handlePageAction(page.id, 'delete')}
                      className="text-red-600 hover:bg-red-50 text-sm px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters to see more pages.'
                : 'Get started by creating your first page.'}
            </p>
          </div>
        )}

        {/* Page Editor Modal */}
        {showPageModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPageModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingPage ? 'Edit Page' : 'Create Page'}
                    </h3>
                    <button
                      onClick={() => setShowPageModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={pageData.title}
                          onChange={(e) => {
                            setPageData({
                              ...pageData,
                              title: e.target.value,
                              slug: generateSlug(e.target.value)
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Page title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={pageData.slug}
                          onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="page-slug"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <div className="border border-gray-300 rounded-lg p-4 min-h-64">
                        <div className="text-sm text-gray-500 mb-4">Page Builder (Simplified)</div>
                        <div className="space-y-4">
                          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <span className="text-gray-500">Drag and drop content blocks here</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Available blocks:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Text blocks</li>
                              <li>Image blocks</li>
                              <li>Hero sections</li>
                              <li>Product showcases</li>
                              <li>Contact forms</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                        <input
                          type="text"
                          value={pageData.metaTitle}
                          onChange={(e) => setPageData({ ...pageData, metaTitle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="SEO title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                        <input
                          type="text"
                          value={pageData.metaDescription}
                          onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="SEO description"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pageData.isPublished}
                        onChange={(e) => setPageData({ ...pageData, isPublished: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleSavePage}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingPage ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowPageModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedPage && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreviewModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Preview: {selectedPage.title}
                    </h3>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="prose max-w-none">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedPage.title}</h1>
                      <div className="text-gray-600">
                        <p>This is a preview of the page content. The actual page builder would render the content blocks here.</p>
                        <p className="mt-4">Slug: /{selectedPage.slug}</p>
                        <p>Status: {selectedPage.isPublished ? 'Published' : 'Draft'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


