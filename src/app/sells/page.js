"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Search, Plus, Minus, X, ShoppingCart, Loader, User, Package, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
const [results, setResults] = useState([]);
const [cart, setCart] = useState([]);
const [search, setSearch] = useState("");
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [billEmail,setBillEmail] = useState("");
const [selling, setSelling] = useState(false);
const [searching, setSearching] = useState(false);
const [notification, setNotification] = useState(null);
const router = useRouter();

const timeoutRef = useRef(null);

// ✅ Optimized debounceSearch (no IIFE, no ESLint warning)
const debounceSearch = useCallback((query) => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);

  setSearching(true);
  timeoutRef.current = setTimeout(() => {
    if (query.trim()) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
    setSearching(false);
  }, 300); // Use 300ms instead of 180 for better UX
}, [products]);

// ✅ Moved loadProducts to useCallback and added to useEffect
const loadProducts = useCallback(async () => {
  setLoading(true);
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_EMPLOYEE_ALLPRODUCTS, {
      credentials: 'include'
    });

    if (res.status === 401 || res.status === 403) {
      router.push('/signin');
      return;
    }

    const data = await res.json();
    setProducts(data);
    showNotification('Products loaded successfully');
  } catch (err) {
    showNotification("Failed to load products", 'error');
  }
  setLoading(false);
}, [router]);

useEffect(() => {
  loadProducts();
  getEmail();
}, [loadProducts]); // ✅ Fixed missing dep

useEffect(() => {
  debounceSearch(search);
}, [search, debounceSearch]); // ✅ Safe now

const getEmail = () => {
  const emailCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('email='))
    ?.split('=')[1];
  setEmail(emailCookie || "");
};

const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};

const addToCart = (p) => {
  if (p.stock <= 0) {
    showNotification("Product is out of stock", 'error');
    return;
  }

  const item = cart.find(i => i._id === p._id);
  if (item) {
    if (item.qty >= p.stock) {
      showNotification("Cannot add more than available stock", 'error');
      return;
    }
    setCart(cart.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i));
  } else {
    setCart([...cart, { ...p, qty: 1 }]);
  }
  showNotification(`${p.name} added to cart`);
};

const updateQty = (id, qty) => {
  const product = products.find(p => p._id === id);
  const maxQty = product?.stock || 1;
  const newQty = Math.max(1, Math.min(qty, maxQty));

  if (qty > maxQty) {
    showNotification("Cannot exceed available stock", 'error');
    return;
  }

  setCart(cart.map(i => i._id === id ? { ...i, qty: newQty } : i));
};

const remove = (id) => {
  const item = cart.find(i => i._id === id);
  setCart(cart.filter(i => i._id !== id));
  showNotification(`${item?.name} removed from cart`);
};

const total = cart.reduce((sum, i) => sum + (i.mrp * i.qty), 0);

const completeSale = async () => {
  if (cart.length === 0) {
    showNotification("Cart is empty", 'error');
    return;
  }

  setSelling(true);
  const items = cart.map(i => ({
    productId: i._id,
    quantity: i.qty
  }));

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_EMPLOYEE_SELL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        items,
        billToEmail: billEmail || null
       })
    });

    const data = await res.json();
    if (res.ok) {
      showNotification(`Sale Complete! Total: ₹${data.total.toLocaleString()}`);
      setCart([]);
      setBillEmail("");
      loadProducts(); // Refresh products
    } else {
      showNotification(data.message || "Sale failed", 'error');
    }
  } catch (err) {
    showNotification("Error processing sale", 'error');
  }
  setSelling(false);
};

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-[85rem] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
    {/* Title Section */}
    <div className="flex-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Product Search</h1>
      <p className="text-gray-600 text-sm sm:text-base">Search and manage your inventory</p>
    </div>
    
    {/* User Info & Button Section */}
    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
      {email && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 justify-center sm:justify-start">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base truncate max-w-[200px]">{email}</span>
        </div>
      )}
      
      <button className="w-full sm:w-auto sm:min-w-[160px] lg:w-52 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-4 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-base sm:text-lg font-semibold">
        <Link href="/sells/allproduct">All Product</Link>
      </button>
      <button className="w-full sm:w-auto sm:min-w-[160px] lg:w-52 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-4 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-base sm:text-lg font-semibold">
        <Link href="/sells/salessummary">Sales Summary</Link>
      </button>
      <input
        type="email"
        placeholder="Email ID"
        value={billEmail}
        onChange={(e) => setBillEmail(e.target.value)}
        className="`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base lg:text-lg font-medium placeholder-gray-400 focus:outline-none"
      />
    </div>
  </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-lg"
            />
            {searching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          
          {search && (
            <p className="mt-2 text-sm text-gray-500">
              {searching ? 'Searching...' : `Found ${results.length} products`}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Results */}
          <div className="space-y-6">
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Search Results ({results.length})
                  </h2>
                </div>
                
                <div className="grid gap-4">
                  {results.map(p => (
                    <div key={p._id} className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">{p.name}</h3>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{p.mrp.toLocaleString()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              p.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : p.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          {p.category && (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                              {p.category}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => addToCart(p)} 
                          disabled={p.stock <= 0}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {search && !searching && results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Shopping Cart ({cart.length})
              </h2>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add products to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map(i => (
                    <div key={i._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{i.name}</h4>
                          <p className="text-lg font-bold text-blue-600">
                            ₹{(i.mrp * i.qty).toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => remove(i._id)} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQty(i._id, i.qty - 1)} 
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                          disabled={i.qty <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-lg min-w-[2rem] text-center">{i.qty}</span>
                        <button 
                          onClick={() => updateQty(i._id, i.qty + 1)} 
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                          disabled={i.qty >= (products.find(p => p._id === i._id)?.stock || i.qty)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-500 ml-2">
                          Max: {products.find(p => p._id === i._id)?.stock || i.qty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                  
                  <button 
                    onClick={completeSale}
                    disabled={selling}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-lg font-semibold"
                  >
                    {selling ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Processing Sale...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Complete Sale
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}