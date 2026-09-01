import { X, User, Briefcase, Mail } from 'lucide-react';
import { useAuth } from './context/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="relative bg-indigo-600 px-4 py-6 sm:px-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-indigo-500 p-1 text-indigo-100 hover:bg-indigo-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-indigo-600 shadow-md">
              {(user.username || user.email).charAt(0).toUpperCase()}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">{user.username || 'User'}</h3>
            <span className="mt-1 rounded-full bg-indigo-500/50 px-3 py-0.5 text-xs font-medium text-indigo-100 capitalize">
              {user.role || 'Member'}
            </span>
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Mail className="h-5 w-5 text-gray-400" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.company && (
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <span className="text-sm">{user.company}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
