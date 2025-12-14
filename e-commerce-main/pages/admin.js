import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('adminToken', data.token);
        }
        router.reload();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

    return (
      <>
        <Head>
        <title>Admin Login - E-Commerce</title>
        <meta name="description" content="Admin login page" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access the admin dashboard
            </p>
          </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter username or email"
                  />
                </div>
              </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Back to Store
                </Link>
              </div>
            </div>
            </div>
          </div>
        </div>
      </>
    );
  }

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [updating, setUpdating] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetchUser();
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchUser = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.admin);
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
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
    }
  };

  const fetchProducts = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    setProductsLoading(true);
    try {
      // Use public API to fetch products (no auth required)
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data);
        setProducts(data);
      } else {
        console.error('Error fetching products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (typeof window === 'undefined') return; // Skip on server side
    
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    
    try {
      const token = sessionStorage.getItem('adminToken');
      const url = editingProduct ? '/api/admin/products' : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          ...(editingProduct && { productId: editingProduct._id })
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (editingProduct) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? data.product : p));
        } else {
          setProducts(prev => [...prev, data.product]);
        }
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          name: '',
          description: '',
          price: '',
          image: '',
          category: '',
          stock: ''
        });
        // Show success message
        const successMessage = editingProduct ? 'Product updated successfully!' : 'Product added successfully!';
        alert(successMessage);
        
        // Auto-hide form after successful add (not edit)
        if (!editingProduct) {
          setTimeout(() => {
            setShowProductForm(false);
            setProductForm({
              name: '',
              description: '',
              price: '',
              image: '',
              category: '',
              stock: ''
            });
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving the product');
    } finally {
      setProductLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString()
    });
    setShowProductForm(true);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert('Product deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductForm(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - E-Commerce</title>
        <meta name="description" content="Admin dashboard for order management" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  E-Commerce Admin
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.username}</span>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('adminToken');
                    }
                    router.push('/');
                  }}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage orders and products for your store</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'orders'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Order Management
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'products'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Admin Tools
                  </button>
                </nav>
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
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✅</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {orders.filter(order => order.status === 'delivered').length}
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

            {activeTab === 'orders' && (
              <>
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
                            />
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">
                                {item.product?.name || 'Product Not Found'}
                              </h5>
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
              </>
            )}

            {activeTab === 'products' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your product catalog and inventory</p>
                    <p className="text-xs text-gray-500 mt-1">Products loaded: {products.length}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        console.log('Refreshing products...');
                        fetchProducts();
                      }}
                      disabled={productsLoading}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm disabled:opacity-50"
                    >
                      {productsLoading ? '⏳ Loading...' : '🔄 Refresh Products'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          description: '',
                          price: '',
                          image: '',
                          category: '',
                          stock: ''
                        });
                        setShowProductForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add New Product
                    </button>
                  </div>
                </div>

                {showProductForm && (
                  <div className="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                      </h3>
                      {editingProduct && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Editing Mode
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.name}
                            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter product name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            required
                            value={productForm.category}
                            onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Gaming">Gaming</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter product description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productForm.stock}
                            onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter stock quantity"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {productForm.image && (
                            <img
                              src={productForm.image}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded-md"
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload an image file from your computer
                        </p>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                            setProductForm({
                              name: '',
                              description: '',
                              price: '',
                              image: '',
                              category: '',
                              stock: ''
                            });
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          {editingProduct ? 'Cancel Edit' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={productLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {productLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Products</h3>
                  </div>
                  {productsLoading ? (
                    <div className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading products...</p>
                    </div>
                  ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="text-4xl mb-4">📦</div>
                                <div className="text-lg font-medium mb-2">No products found</div>
                                <div className="text-sm">Click &quot;Add New Product&quot; to get started</div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                          <tr key={product._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  className="h-12 w-12 object-cover rounded-md"
                                  src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center'}
                                  alt={product.name}
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{product.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
