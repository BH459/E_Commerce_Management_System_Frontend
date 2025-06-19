"use client";

import Link from "next/link";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    companyCode: "",
    isAdminEmployee: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); 
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage("");
  setIsSuccess(false);

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SIGNIN_ADMIN_EMPLOYEE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user) // <- Corrected from 'admin' to 'user'
    });

    const data = await response.json();

    if (response.ok) {
      setIsSuccess(true);
      setMessage(data.message || "Login successful");

      // ✅ Set token in cookies
      Cookies.set('token', data.token, { expires: 2 }); // expires in 2 days

      // Optional: You can also store role/email/orgId if needed
      Cookies.set('role', data.role);
      Cookies.set('email', user.email);
      Cookies.set('orgCode', user.companyCode);

      if (data.role === 'admin') {
        router.push('/admin_dashboard');
      } else {
        router.push('/sells');
      }
    } else {
      setIsSuccess(false);
      setMessage(data.message || "Something went wrong. Please try again.");
    }
  } catch (error) {
    console.error('Network error:', error);
    setIsSuccess(false);
    setMessage("Network error. Please check your connection and try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            isSuccess 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Code
              </label>
              <input
                type="text"
                name="companyCode"
                value={user.companyCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none font-mono text-center tracking-wider uppercase"
                placeholder="COMP-1234"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="isAdminEmployee"
                checked={user.isAdminEmployee}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={isLoading}
              />
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Sign in as Administrator
                </label>
                <p className="text-xs text-gray-500">
                  Check this if you have admin privileges
                </p>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3 px-6 rounded-lg transform transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        </form>

        <div className="mt-6 text-center space-y-3">
          <a href="#" className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200 block">
            Forgot your password?
          </a>
          
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
            <span>Don&apos;t have an account?</span>
            <Link href="/signup_admin" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200">
              Sign up Admin
            </Link>
            <h1>||</h1>
            <Link href="/signup_employee" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200">
              Sign up Employee
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}