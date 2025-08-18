'use client';

import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EasyMinutes</h1>
          <p className="text-gray-600">
            Create an account to generate professional meeting minutes
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              card: 'shadow-none border border-gray-200',
              footerActionText: 'text-gray-600',
              footerActionLink: 'text-blue-600 hover:text-blue-500 font-medium',
            },
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  );
}