// 认证错误页面
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'AccessDenied':
        return 'You do not have permission to access this resource';
      default:
        return 'Authentication error occurred';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="mb-6 text-gray-600">{getErrorMessage(error)}</p>
        <div className="flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-block text-gray-600 hover:text-gray-900"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}