"use client";
import React, { useCallback,useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";

const SalesSummary = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const router = useRouter();

  // Set default date (today)
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchSalesSummary = useCallback(async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('date', selectedDate);
      if (email) queryParams.append("email", email);

      const response = await fetch(`${process.env.NEXT_PUBLIC_EMPLOYEE_SALESSUMMARY}?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSummaryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales summary');
      console.error('Sales summary fetch error:', err);
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, email, router]); // ✅ Dependencies for useCallback

  useEffect(() => {
    if (selectedDate) {
      fetchSalesSummary();
    }
  }, [selectedDate, fetchSalesSummary]);

  const handleRefresh = () => {
    fetchSalesSummary();
  };

  // Calculate totals with safety checks
  const totalAmount = summaryData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const totalSales = summaryData.reduce((sum, item) => sum + (item.count || 0), 0);
  const averagePerSale = totalSales > 0 ? totalAmount / totalSales : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={32} />
                Sales Summary Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your sales performance over time</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString()}</p>
              </div>
              <ShoppingBag className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg per Sale</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{averagePerSale.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Loading sales summary...</p>
          </div>
        )}

        {/* Sales Data Display */}
        {!loading && summaryData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Sales Summary {selectedDate ? `for ${new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}` : ''}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {summaryData.length} day(s) of sales data
              </p>
            </div>
            
            {/* Table for multiple days or single day detailed view */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average per Sale</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.map((item, index) => {
                    const itemAverage = (item.count && item.count > 0) ? (item.totalAmount || 0) / item.count : 0;
                    return (
                      <tr key={`${item.date}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.date ? new Date(item.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-green-600">
                            ₹{(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.count || 0} sales
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium text-purple-600">
                            ₹{itemAverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && summaryData.length === 0 && !error && selectedDate && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data Found</h3>
            <p className="text-gray-600 mb-4">
              No sales data available for {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesSummary;