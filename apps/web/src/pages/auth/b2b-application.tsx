import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const b2bApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  gstVatNumber: z.string().optional(),
  taxId: z.string().optional(),
  businessAddress: z.string().min(10, 'Business address is required'),
  businessCity: z.string().min(2, 'City is required'),
  businessState: z.string().min(2, 'State is required'),
  businessCountry: z.string().min(2, 'Country is required'),
  businessPostalCode: z.string().min(3, 'Postal code is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  contactPhone: z.string().min(10, 'Phone number is required'),
  website: z.string().url().optional().or(z.literal('')),
  expectedMonthlyVolume: z.string().min(1, 'Expected monthly volume is required'),
});

type B2BApplicationForm = z.infer<typeof b2bApplicationSchema>;

export default function B2BApplication() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<B2BApplicationForm>({
    resolver: zodResolver(b2bApplicationSchema),
  });

  const onSubmit = async (data: B2BApplicationForm) => {
    if (!session?.user) {
      toast.error('Please sign in to apply for B2B account');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/b2b/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('B2B application submitted successfully');
        router.push('/dashboard?tab=b2b-application');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit application');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please sign in to apply for B2B account</h2>
          <button
            onClick={() => router.push('/auth/signin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">B2B Account Application</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <input
                      {...register('businessName')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter business name"
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                      Business Type *
                    </label>
                    <select
                      {...register('businessType')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select business type</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="retailer">Retailer</option>
                      <option value="distributor">Distributor</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="catering">Catering</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gstVatNumber" className="block text-sm font-medium text-gray-700">
                      GST/VAT Number
                    </label>
                    <input
                      {...register('gstVatNumber')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter GST/VAT number"
                    />
                  </div>

                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                      Tax ID
                    </label>
                    <input
                      {...register('taxId')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter tax ID"
                    />
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <textarea
                      {...register('businessAddress')}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter business address"
                    />
                    {errors.businessAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        {...register('businessCity')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter city"
                      />
                      {errors.businessCity && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessCity.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessState" className="block text-sm font-medium text-gray-700">
                        State *
                      </label>
                      <input
                        {...register('businessState')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter state"
                      />
                      {errors.businessState && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessState.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code *
                      </label>
                      <input
                        {...register('businessPostalCode')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter postal code"
                      />
                      {errors.businessPostalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessPostalCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessCountry" className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      {...register('businessCountry')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IN">India</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.businessCountry && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessCountry.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                      Contact Person *
                    </label>
                    <input
                      {...register('contactPerson')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter contact person name"
                    />
                    {errors.contactPerson && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      {...register('contactPhone')}
                      type="tel"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter phone number"
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      {...register('website')}
                      type="url"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Business Volume */}
              <div className="pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expected Business Volume</h3>
                
                <div>
                  <label htmlFor="expectedMonthlyVolume" className="block text-sm font-medium text-gray-700">
                    Expected Monthly Volume (in kg) *
                  </label>
                  <select
                    {...register('expectedMonthlyVolume')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select expected monthly volume</option>
                    <option value="10-50">10-50 kg</option>
                    <option value="50-100">50-100 kg</option>
                    <option value="100-500">100-500 kg</option>
                    <option value="500-1000">500-1000 kg</option>
                    <option value="1000+">1000+ kg</option>
                  </select>
                  {errors.expectedMonthlyVolume && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedMonthlyVolume.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
