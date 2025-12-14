import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
function AdminDashboard({ admin }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    fetchOrders();
    fetchProducts();
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleFocus = () => {
      fetchOrders(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchOrders = async (isRefresh = false) => {
    if (typeof window === 'undefined') return;
    
    if (isRefresh) {
      setRefreshing(true);
    }
    
    const token = sessionStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        console.error('Error fetching orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (typeof window === 'undefined') return;
    
    const token = sessionStorage.getItem('adminToken');
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? data.order : order
        ));
        alert('Order status updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating order status');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'order_placed': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'order_placed': return 'Order Placed';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = [
      'order_placed',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchProducts = async () => {
    if (typeof window === 'undefined') return;
    
    const token = sessionStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        console.error('Error fetching products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    
    const token = sessionStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(prev => [...prev, data.product]);
        setProductForm({
          name: '',
          description: '',
          price: '',
          image: '',
          category: '',
          stock: ''
        });
        setShowProductForm(false);
        alert('Product created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('An error occurred while creating product');
    } finally {
      setProductLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage orders and products</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Product</span>
            </button>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{orders.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(order => order.status === 'order_placed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🛍️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
      
      {/* Filter and Search Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="order_placed">Order Placed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">No orders found</h2>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customer: {order.user?.firstName} {order.user?.lastName} ({order.user?.username})
                    </p>
                    <p className="text-sm text-gray-500">
                      Email: {order.user?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Items:</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        className="h-16 w-16 object-cover rounded-md"
                        src={item.product?.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center'}
                        alt={item.product?.name || 'Product'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{item.product?.name || 'Product'}</h5>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">Shipping Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {order.shippingInfo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Plus Code:</span> {order.shippingInfo.plusCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Order Status Management</h4>
                  <div className="text-sm text-gray-500">
                    Current: <span className={`font-medium ${getStatusColor(order.status).split(' ')[1]}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</h5>
                  <div className="flex flex-wrap gap-2">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                        disabled={updating[order._id]}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating[order._id] ? 'Updating...' : `Mark as ${getStatusText(getNextStatus(order.status))}`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        disabled={updating[order._id]}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating[order._id] ? 'Updating...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* All Status Options */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">All Status Options:</h5>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'order_placed',
                      'shipped',
                      'out_for_delivery',
                      'delivered',
                      'cancelled'
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        disabled={updating[order._id] || order.status === status}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          order.status === status
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : updating[order._id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {updating[order._id] ? '...' : getStatusText(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Creation Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    required
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductFormChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Toys">Toys</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    required
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {productLoading ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, []);
  const checkAuth = async () => {
    if (typeof window === 'undefined') return;
    try {
      const userToken = sessionStorage.getItem('token');
      const adminToken = sessionStorage.getItem('adminToken');
      if (userToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${userToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setAdmin(null);
            setUserType('user');
            return;
          } else {
            sessionStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error checking user auth:', error);
          sessionStorage.removeItem('token');
        }
      }
      if (adminToken) {
        try {
          const response = await fetch('/api/admin/auth/me', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
            setUser(null);
            setUserType('admin');
            return;
          } else {
            sessionStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Error checking admin auth:', error);
          sessionStorage.removeItem('adminToken');
        }
      }
      setUser(null);
      setAdmin(null);
      setUserType(null);
    } catch (error) {
      console.error('Error in checkAuth:', error);
      setUser(null);
      setAdmin(null);
      setUserType(null);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>E-Commerce Store</title>
        <meta name="description" content="Welcome to our e-commerce store" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  E-Commerce
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {userType === 'user' ? (
                  <>
                    <span className="text-gray-700">Welcome, {user.username}</span>
                    <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                      Profile
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-gray-900">
                      Orders
                    </Link>
                    <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                      Cart
                    </Link>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('token');
                        }
                        setUser(null);
                        setUserType(null);
                        router.reload();
                      }}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </>
                ) : userType === 'admin' ? (
                  <>
                    <span className="text-gray-700">Admin: {admin.username}</span>
                    <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('adminToken');
                        }
                        setAdmin(null);
                        setUserType(null);
                        router.reload();
                      }}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 hover:text-gray-900">
                      Login
                    </Link>
                    <Link href="/signup" className="text-gray-700 hover:text-gray-900">
                      Sign Up
                    </Link>
                    <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                      Cart
                    </Link>
                    <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                      Admin
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {userType === 'admin' ? (
              <AdminDashboard admin={admin} />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
                        <img
                          className="h-48 w-full object-cover"
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&crop=center&auto=format&q=60';
                          }}
                        />
                        <div className="p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-gray-600 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                            <Link
                              href={`/products/${product._id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
