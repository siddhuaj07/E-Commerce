import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchCart();
    fetchProfileData();
  }, []);
  const fetchUser = async () => {
    if (typeof window === 'undefined') return;
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    }
  };

  const fetchProfileData = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const autoFillShippingInfo = () => {
    if (profileData) {
      setShippingInfo({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        plusCode: profileData.plusCode || ''
      });
    }
  };
  const fetchCart = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const cartData = await response.json();
      setCart(cartData);
      const productIds = cartData.map(item => item.productId);
      for (const productId of productIds) {
        const productResponse = await fetch(`/api/products/${productId}`);
        const productData = await productResponse.json();
        setProducts(prev => ({ ...prev, [productId]: productData }));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = async (productId, newQuantity) => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };
  const removeItem = async (productId) => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    plusCode: ''
  });
  const [profileData, setProfileData] = useState(null);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckoutForm(true);
  };

  const processCheckout = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    
    // Validate shipping information
    const requiredFields = ['firstName', 'lastName', 'phone', 'plusCode'];
    for (const field of requiredFields) {
      if (!shippingInfo[field].trim()) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Validate Plus Code format
    const plusCodeRegex = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,4}$/i;
    const cleanedPlusCode = shippingInfo.plusCode.replace(/\s/g, '');
    if (!plusCodeRegex.test(cleanedPlusCode)) {
      alert('Please enter a valid Google Plus Code (e.g., 57FC+4XH, 8F6C+2XH)');
      return;
    }

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          shippingInfo: shippingInfo
        })
      });

      if (orderResponse.ok) {
        // Clear cart
        await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        alert('Order placed successfully!');
        setShowCheckoutForm(false);
        fetchCart();
        
        // Redirect to orders page after successful order
        router.push('/orders');
      } else {
        const errorData = await orderResponse.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const product = products[item.productId];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
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
        <title>Shopping Cart - E-Commerce Store</title>
        <meta name="description" content="Your shopping cart" />
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
                  Products
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            className="h-16 w-16 object-cover rounded-md"
                            src={product.image}
                            alt={product.name}
                          />
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                            <p className="text-gray-600">₹{product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="mx-3 text-lg font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-lg font-medium text-gray-900">
                            ₹{(product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">
                      Total: ₹{getTotalPrice().toFixed(2)}
                    </span>
                    <button
                      onClick={checkout}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Checkout Form Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                  {profileData && (
                    <button
                      type="button"
                      onClick={autoFillShippingInfo}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Auto-fill from Profile
                    </button>
                  )}
                </div>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Google Plus Code</label>
                    <input
                      type="text"
                      name="plusCode"
                      value={shippingInfo.plusCode}
                      onChange={handleShippingChange}
                      placeholder="e.g., 57FC+4XH"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your Google Plus Code for precise delivery location. You can find it in Google Maps by dropping a pin.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {cart.map((item) => {
                        const product = products[item.productId];
                        return (
                          <div key={item.productId} className="flex justify-between">
                            <span>{product?.name} x {item.quantity}</span>
                            <span>₹{(product?.price * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-1 mt-2 font-medium text-gray-900">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>₹{getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={processCheckout}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Place Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
