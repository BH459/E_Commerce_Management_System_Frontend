"use client";
import { useCallback,useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, Mail, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const router = useRouter();

  // Fetch all pending users
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_ADMIN_PENDINGUSER, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push('/signin');
        return;
      }

      if (res.ok) {
        setUsers(data.users || []);
        setMessage('');
      } else {
        setMessage(data.message || 'Error fetching users');
      }
    } catch (error) {
      setMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Approve a specific user
  const handleApprove = async (email) => {
    setActionLoading(prev => ({ ...prev, [email]: 'approve' }));
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_ADMIN_APPROVEUSER, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Successfully approved: ${email}`);
        setUsers(users.filter((user) => user.email !== email));
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(data.message || 'Error approving user');
      }
    } catch (error) {
      setMessage('Request failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [email]: null }));
    }
  };

  // Reject a specific user (placeholder function)
  const handleReject = async (email) => {
    setActionLoading(prev => ({ ...prev, [email]: 'reject' }));
    try {
      // Add your reject endpoint here
      const res = await fetch(process.env.NEXT_PUBLIC_ADMIN_REJECTUSER, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`❌ Rejected: ${email}`);
        setUsers(users.filter((user) => user.email !== email));
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(data.message || 'Error rejecting user');
      }
    } catch (error) {
      setMessage('Request failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [email]: null }));
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pending User Approvals</h1>
                <p className="text-gray-600 mt-1">Review and approve new user registrations</p>
              </div>
            </div>
            <button
              onClick={fetchPendingUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">Total Pending</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Ready to Approve</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">Requires Review</span>
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-1">0</p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : message.includes('❌')
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending users found at the moment.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <div key={user.email} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name || 'Unknown User'}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </div>
                        {user.registrationDate && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Registered: {new Date(user.registrationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleReject(user.email)}
                        disabled={actionLoading[user.email]}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all duration-200"
                      >
                        {actionLoading[user.email] === 'reject' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(user.email)}
                        disabled={actionLoading[user.email]}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {actionLoading[user.email] === 'approve' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {users.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {users.length} pending user{users.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}