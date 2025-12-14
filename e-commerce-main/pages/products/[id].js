import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);
  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };
  const addToCart = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, quantity })
      });
      alert('Product added to cart!');
      
      // Redirect to cart page after adding to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>{product.name} - E-Commerce Store</title>
        <meta name="description" content={product.description} />
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
                <Link href="/login" className="text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/signup" className="text-gray-700 hover:text-gray-900">
                  Sign Up
                </Link>
                <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                  Cart
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Products
            </Link>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    className="h-96 w-full object-cover"
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&crop=center&auto=format&q=60';
                    }}
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="ml-4 text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-20"
                    />
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
