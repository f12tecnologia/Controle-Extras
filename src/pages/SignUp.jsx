import React from 'react';
import { Navigate } from 'react-router-dom';

// This page is no longer used for direct sign-ups.
// It redirects to the login page.
// User creation is now handled by admins in the Users page.
const SignUp = () => {
  return <Navigate to="/login" replace />;
};

export default SignUp;