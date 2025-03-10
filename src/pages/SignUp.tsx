
import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignUp = () => {
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
          <p className="mt-2 text-gray-600">Create an account to get started</p>
        </div>
        
        <div className="mt-8">
          <ClerkSignUp signInUrl="/sign-in" routing="path" path="/sign-up" />
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
