import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    plusCode: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (typeof window === 'undefined') return; // Skip on server side
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          plusCode: data.user.plusCode || ''
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePlusCode = (code) => {
    if (!code) return true; // Allow empty values
    
    // Remove spaces and convert to uppercase
    const cleanedCode = code.replace(/\s/g, '').toUpperCase();
    
    // Google Plus Code pattern: 4-8 characters + "+" + 2-4 characters
    const plusCodePattern = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,4}$/;
    
    return plusCodePattern.test(cleanedCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (typeof window === 'undefined') return; // Skip on server side

    // Validate Plus Code if provided
    if (formData.plusCode && !validatePlusCode(formData.plusCode)) {
      setError('Please enter a valid Google Plus Code (e.g., 57FC+4XH, 8F6C+2XH)');
      setSaving(false);
      return;
    }
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <title>Profile - E-Commerce Store</title>
        <meta name="description" content="Manage your profile and personal details" />
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

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
                {success}
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="plusCode" className="block text-sm font-medium text-gray-700">
                    Google Plus Code
                  </label>
                  <input
                    type="text"
                    id="plusCode"
                    name="plusCode"
                    value={formData.plusCode}
                    onChange={handleChange}
                    placeholder="e.g., 57FC+4XH, 8F6C+2XH"
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      formData.plusCode && !validatePlusCode(formData.plusCode) 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                  {formData.plusCode && !validatePlusCode(formData.plusCode) && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter a valid Google Plus Code (e.g., 57FC+4XH, 8F6C+2XH)
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your Google Plus Code for precise location. Format: 4-8 characters + &quot;+&quot; + 2-4 characters. 
                    You can find it in Google Maps by dropping a pin.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
