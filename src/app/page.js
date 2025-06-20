import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            E-Commerce Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete solution for product management and sales tracking
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/signin">
            <div className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 cursor-pointer border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Sign In</h3>
              <p className="text-gray-600">Access your account (Admin/Employee)</p>
            </div>
          </Link>

          <Link href="/signup_admin">
            <div className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 cursor-pointer border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Admin Signup</h3>
              <p className="text-gray-600">Create organization & manage products</p>
            </div>
          </Link>

          <Link href="/signup_employee">
            <div className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 cursor-pointer border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Employee Signup</h3>
              <p className="text-gray-600">Join organization & sell products</p>
            </div>
          </Link>
        </div>

        {/* Features Section - Always Visible */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Complete Feature Overview
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Features */}
            <div className="bg-amber-100 rounded-lg p-6 border-2 border-amber-200">
              <h3 className="text-2xl font-bold text-amber-800 mb-4">👑 Admin Features</h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Create unique organization codes
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Add, edit, delete products
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Manage product names, MRP, selling prices
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  View complete product inventory
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Track all employee sales activities
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Manage employee accounts
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Real-time dashboard analytics
                </li>
              </ul>
            </div>

            {/* Employee Features */}
            <div className="bg-green-100 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-4">👥 Employee Features</h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Join organization with unique code
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  View all available products
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Process product sales
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  View personal sales history
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Real-time inventory updates
                </li>
              </ul>
            </div>
          </div>

          {/* System Features */}
          <div className="mt-8 bg-blue-100 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">⚙️ System Features</h3>
            <div className="grid md:grid-cols-3 gap-6 text-gray-800">
              <div>
                <h4 className="font-bold text-blue-700 mb-2">Security</h4>
                <ul className="space-y-1">
                  <li>• Secure authentication</li>
                  <li>• Role-based access</li>
                  <li>• Organization isolation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-700 mb-2">Data Management</h4>
                <ul className="space-y-1">
                  <li>• Real-time updates</li>
                  <li>• Complete audit trails</li>
                  <li>• Backup & recovery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-700 mb-2">User Experience</h4>
                <ul className="space-y-1">
                  <li>• Responsive design</li>
                  <li>• Intuitive interface</li>
                  <li>• Fast performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}