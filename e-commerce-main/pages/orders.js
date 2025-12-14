import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrders();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchOrders = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      } else {
        console.error('Error fetching orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (typeof window === 'undefined') return;
    
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? data.order : order
        ));
        alert('Order cancelled successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('An error occurred while cancelling the order');
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

  const getStatusProgress = (currentStatus, stepKey) => {
    const statusOrder = [
      'order_placed',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    if (currentStatus === 'cancelled') {
      return stepKey === 'order_placed';
    }
    return stepIndex <= currentIndex;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order History - E-Commerce Store</title>
        <meta name="description" content="View your order history" />
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
                <span className="text-gray-700">Welcome, {user?.username}</span>
                <Link href="/" className="text-gray-700 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                  Cart
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('token');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl text-gray-600 mb-4">No orders found</h2>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            ₹{order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Status Progress */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Order Status:</h4>
                      <div className="flex items-center justify-between">
                        {[
                          { key: 'order_placed', label: 'Order Placed', icon: '📝' },
                          { key: 'shipped', label: 'Shipped', icon: '📦' },
                          { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
                          { key: 'delivered', label: 'Delivered', icon: '🎉' }
                        ].map((step, index) => {
                          const isActive = getStatusProgress(order.status, step.key);
                          const isCompleted = isActive && order.status === step.key;
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isActive 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? '✓' : step.icon}
                              </div>
                              <span className={`text-xs mt-2 text-center ${
                                isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Items:</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <img
                              className="h-16 w-16 object-cover rounded-md"
                              src={item.product?.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center&auto=format&q=60'}
                              alt={item.product?.name || 'Product'}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center&auto=format&q=60';
                              }}
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

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Shipping Information:</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingInfo.firstName} {order.shippingInfo.lastName}<br />
                        Phone: {order.shippingInfo.phone}<br />
                        <span className="font-medium">Google Plus Code:</span> {order.shippingInfo.plusCode}
                      </p>
                      <div className="mt-2">
                        <a 
                          href={`https://maps.google.com/?q=${order.shippingInfo.plusCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          📍 View location on Google Maps
                        </a>
                      </div>
                    </div>

                    {/* Cancel Order Button - Only show for orders that can be cancelled */}
                    {order.status === 'order_placed' && (
                      <div className="px-6 py-4 bg-red-50 border-t border-gray-200">
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          Cancel Order
                        </button>
                        <p className="text-xs text-red-600 mt-2 text-center">
                          You can only cancel orders that haven&apos;t been shipped yet
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
