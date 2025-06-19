"use client";
import React, { useCallback,useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Save, X, ShoppingCart, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    mrp: '',
    stock: ''
  });

  // API base URL - adjust this to match your backend
  const API_BASE = process.env.NEXT_PUBLIC_ADMIN_ALLPRODUCTS; // Adjust port as needed

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/all_products`, {
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

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Add new product
  const addProduct = async () => {
    if (!formData.name || !formData.mrp || !formData.stock) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          mrp: parseFloat(formData.mrp),
          stock: parseInt(formData.stock)
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ name: '', mrp: '', stock: '' });
        fetchProducts(); // Refresh the list
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Error adding product');
      console.error('Add error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const editProduct = async () => {
    if (!formData.name || !formData.mrp || !formData.stock) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${editingProduct._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          mrp: parseFloat(formData.mrp),
          stock: parseInt(formData.stock)
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingProduct(null);
        setFormData({ name: '', mrp: '', stock: '' });
        fetchProducts(); // Refresh the list
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error('Edit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgCode: 'your-org-code' // You might need to get this from cookies or state
        }),
      });

      if (response.ok) {
        fetchProducts(); // Refresh the list
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open edit modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      mrp: product.mrp.toString(),
      stock: product.stock.toString()
    });
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({ name: '', mrp: '', stock: '' });
    setError('');
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Product Dashboard
              </h1>
            </div>
            
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden md:inline">Add Product</span>
                <span className="md:hidden">Add</span>
              </button>
              <Link
                href="/admin_dashboard/user"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                <span className="hidden md:inline">Pending Approval</span>
                <span className="md:hidden">Pending</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
              <Link
                href="/admin_dashboard/user"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>Pending Approval</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Products Table - Desktop */}
        <div className="hidden md:block bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRP
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product._id || index} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.mrp}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 lg:p-2 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 p-1 lg:p-2 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 text-center text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div key={product._id || index} className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">MRP:</span> ₹{product.mrp}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Stock:</span> {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-white/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add New Product</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm sm:text-base"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Enter MRP"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={addProduct}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-white/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Product</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                    placeholder="Enter MRP"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={editProduct}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Product</span>
                </button>
                <button
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;