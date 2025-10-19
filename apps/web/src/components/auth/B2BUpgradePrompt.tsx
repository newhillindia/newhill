import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface B2BUpgradePromptProps {
  orderWeight: number;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function B2BUpgradePrompt({ orderWeight, onClose, onUpgrade }: B2BUpgradePromptProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);

  const handleUpgrade = async () => {
    setIsApplying(true);
    try {
      // Redirect to B2B application form
      router.push('/auth/b2b-application');
    } catch (error) {
      toast.error('Failed to start B2B application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="mt-2 px-7 py-3">
            <h3 className="text-lg font-medium text-gray-900 text-center">
              Order Weight Limit Exceeded
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500 text-center">
                Your order weight ({orderWeight} kg) exceeds the B2C limit of 5 kg. 
                To place larger orders, you need to upgrade to a B2B account.
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">B2B Account Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bulk order discounts</li>
                <li>• No weight limits</li>
                <li>• Priority support</li>
                <li>• Business tax benefits</li>
                <li>• Dedicated account manager</li>
              </ul>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel Order
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isApplying}
                className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isApplying ? 'Processing...' : 'Apply for B2B Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
