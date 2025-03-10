
import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">VC Round Manager</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your investment rounds</p>
        </div>
        
        <div className="mt-8">
          <ClerkSignIn signUpUrl="/sign-up" routing="path" path="/sign-in" />
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
