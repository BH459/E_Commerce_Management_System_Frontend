"use client";
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Mail, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_ADMIN_ALLUSER, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        router.push('/signin');
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Users</h1>
          <button
            onClick={fetchAllUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No users found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div 
              key={user.email}  
              className="py-4 flex justify-between items-start hover:bg-gray-50 px-2 rounded-lg"
              >
                <div
                  onClick={() =>
                    router.push(`/sells/salessummary?email=${encodeURIComponent(user.email)}`)
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-900">{user.name || 'Unnamed User'}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {user.email || 'No email'}
                      </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}