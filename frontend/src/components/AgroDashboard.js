import React from 'react';
import { FaBuilding, FaClock, FaMapMarkerAlt, FaCogs, FaBell, FaPlus, FaUserCircle, FaChartLine, FaBoxOpen, FaCog, FaEdit, FaTrash, FaShoppingCart, FaEnvelope, FaCheck, FaTimes, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';
import Analytics from './Analytics';

const AgroDashboard = () => {
  const agroName = localStorage.getItem('agroName');
  const agroEmail = localStorage.getItem('agroEmail');
  const agroId = localStorage.getItem('agroId');
  const [, setLoading] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  // Dashboard data states
  const [metrics, setMetrics] = React.useState({ products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [, setMetricsError] = React.useState('');
  const [profile, setProfile] = React.useState(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [services, setServices] = React.useState([]);
  const [servicesLoading, setServicesLoading] = React.useState(false);
  const [servicesError, setServicesError] = React.useState('');
  const [recentProducts, setRecentProducts] = React.useState([]);
  const [recentOrders, setRecentOrders] = React.useState([]);
  const [recentNotifications, setRecentNotifications] = React.useState([]);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [recentError, setRecentError] = React.useState('');
  // Service modal
  const [, setShowServiceModal] = React.useState(false);
  const [serviceInput, setServiceInput] = React.useState('');
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [productForm, setProductForm] = React.useState({
    name: '',
    category: 'Seed',
    price: '',
    quantity: '',
    discount: '',
    description: '',
    image: null
  });

  React.useEffect(() => {
    if (!(agroId || agroEmail)) return;
    const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
    const loadFallbackDashboard = async () => {
      try {
        console.log('Loading fallback dashboard data...');
        const res = await axios.get('/api/user/agro/dashboard', { params: idOrEmail });
        const d = res.data || {};
        console.log('Fallback dashboard data:', d);
        
        // Map summary to profile-like shape
        setProfile(p => p || {
          agroType: d?.summary?.agroType,
          businessType: d?.summary?.agroType,
          city: d?.summary?.city,
          location: d?.summary?.city,
          workingHours: d?.summary?.workingHours,
          logoPath: d?.summary?.logoPath,
        });
        setServices(s => (s && s.length ? s : (d?.services || [])));
        // Only update if we don't already have data
        setRecentProducts(rp => {
          console.log('Fallback - Recent products:', { existing: rp?.length || 0, fallback: d?.recent?.products?.length || 0 });
          if (rp && rp.length > 0) return rp; // Keep existing data
          return d?.recent?.products || [];
        });
        setRecentOrders(ro => {
          console.log('Fallback - Recent orders:', { existing: ro?.length || 0, fallback: d?.recent?.orders?.length || 0 });
          if (ro && ro.length > 0) return ro; // Keep existing data
          return d?.recent?.orders || [];
        });
        setRecentNotifications(rn => {
          console.log('Fallback - Recent notifications:', { existing: rn?.length || 0, fallback: d?.recent?.notifications?.length || 0 });
          if (rn && rn.length > 0) return rn; // Keep existing data
          return d?.recent?.notifications || [];
        });
        
        // Clear the error if fallback succeeded
        if (d?.recent?.products || d?.recent?.orders) {
          setRecentError('');
        }
      } catch (error) {
        console.error('Fallback dashboard also failed:', error);
        setRecentError('Failed to load recent data from all sources');
      }
    };
    const loadAll = async () => {
      try {
        setLoading(true);
        let anyFailed = false;
        await Promise.all([
          (async () => {
            try {
              setMetricsLoading(true);
              const r = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
              setMetrics(r.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
            } catch (e) {
              setMetricsError('Failed to load metrics');
              anyFailed = true;
            } finally { setMetricsLoading(false); }
          })(),
          (async () => {
            try {
              setProfileLoading(true);
              let prof = null;
              try {
                const r = await axios.get('/api/user/agro/profile', { params: idOrEmail });
                prof = r.data || null;
              } catch (_) { /* try fallbacks below */ }

              // Fallback: fetch by direct id endpoint if available
              if ((!prof || Object.keys(prof || {}).length === 0) && agroId) {
                try {
                  const r2 = await axios.get(`/api/user/agro/${agroId}`);
                  prof = r2.data || prof;
                } catch (_) { /* ignore */ }
              }

              // Last resort: use summary from aggregated dashboard endpoint
              if (!prof || Object.keys(prof || {}).length === 0) {
                try {
                  const agg = await axios.get('/api/user/agro/dashboard', { params: idOrEmail });
                  const d = agg.data || {};
                  prof = {
                    agroType: d?.summary?.agroType,
                    businessType: d?.summary?.agroType,
                    city: d?.summary?.city,
                    location: d?.summary?.city,
                    workingHours: d?.summary?.workingHours,
                    logoPath: d?.summary?.logoPath,
                  };
                } catch (_) { /* ignore */ }
              }

              setProfile(prof || null);
            } catch (e) {
              setProfileError('Failed to load profile');
              anyFailed = true;
            } finally { setProfileLoading(false); }
          })(),
          (async () => {
            try {
              setServicesLoading(true);
              const r = await axios.get('/api/user/agro/services', { params: idOrEmail });
              setServices(r.data?.services || []);
            } catch (e) {
              setServicesError('Failed to load services');
              anyFailed = true;
            } finally { setServicesLoading(false); }
          })(),
          (async () => {
            try {
              setRecentLoading(true);
              setRecentError(''); // Clear previous errors
              
              // Try to load each endpoint individually with better error handling
              const loadRecentProducts = async () => {
                try {
                  const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
                  console.log('Recent products loaded:', response.data?.length || 0);
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent products:', err);
                  // Fallback: try to load all products
                  try {
                    const fallbackRes = await axios.get('/api/user/product', { params: { email: agroEmail } });
                    return (fallbackRes.data || []).slice(0, 10);
                  } catch (fallbackErr) {
                    console.error('Fallback also failed:', fallbackErr);
                    return [];
                  }
                }
              };
              
              const loadRecentOrders = async () => {
                try {
                  const response = await axios.get('/api/user/agro/orders/recent', { params: { ...idOrEmail, limit: 5 } });
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent orders:', err);
                  return [];
                }
              };
              
              const loadRecentNotifications = async () => {
                try {
                  const response = await axios.get('/api/user/agro/notifications', { params: { ...idOrEmail, limit: 5 } });
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent notifications:', err);
                  return [];
                }
              };
              
              const [products, orders, notifications] = await Promise.all([
                loadRecentProducts(),
                loadRecentOrders(),
                loadRecentNotifications()
              ]);
              
              setRecentProducts(products);
              setRecentOrders(orders);
              setRecentNotifications(notifications);
              
              console.log('Loaded data:', { products: products.length, orders: orders.length, notifications: notifications.length });
              
              // Only mark as failed if ALL endpoints failed to load any data
              if (products.length === 0 && orders.length === 0 && notifications.length === 0) {
                console.log('All endpoints returned empty data, will try fallback');
                anyFailed = true;
              } else {
                // If we got some data, don't trigger fallback
                console.log('Got some data, skipping fallback');
                anyFailed = false;
              }
            } catch (e) {
              console.error('Error loading recent data:', e);
              setRecentError('Failed to load recent data');
              anyFailed = true;
            } finally { setRecentLoading(false); }
          })(),
        ]);
        // If any failed, try fallback aggregation endpoint
        if (anyFailed) {
          console.log('Some endpoints failed, trying fallback dashboard endpoint...');
          await loadFallbackDashboard();
        } else {
          console.log('All endpoints succeeded, no fallback needed');
        }
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [agroId, agroEmail]);

  // Load data based on active tab
  React.useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'notifications') {
      // Load latest notifications when viewing All Notifications
      (async () => {
        try {
          setRecentLoading(true);
          let list = [];
          if (agroEmail) {
            try {
              const r = await axios.get('/api/user/notifications', { params: { email: agroEmail, userRole: 'agro' } });
              list = r.data || [];
            } catch (_) { /* try fallback */ }
          }
          if ((!list || list.length === 0) && agroId) {
            try {
              const r2 = await axios.get('/api/user/agro/notifications', { params: { id: agroId, limit: 100 } });
              list = r2.data || list;
            } catch (_) { /* ignore */ }
          }
          setRecentNotifications(list || []);
        } catch (e) {
          setRecentError('Failed to load notifications');
        } finally {
          setRecentLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, agroEmail, agroId]);

  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/user/product', { params: { email: agroEmail } });
      const allProducts = res.data || [];
      setProducts(allProducts);
      console.log('Loaded products:', allProducts.length);
      // Log product dates for debugging
      if (allProducts.length > 0) {
        const oldestProduct = allProducts[allProducts.length - 1];
        const newestProduct = allProducts[0];
        console.log(`Product date range - Oldest: ${oldestProduct.createdAt}, Newest: ${newestProduct.createdAt}`);
        console.log(`Total products loaded: ${allProducts.length}`);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get('/api/user/agro/orders', { params: { email: agroEmail } });
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Service handler - kept for future use
  // eslint-disable-next-line no-unused-vars
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceInput.trim()) return;
    try {
      const payload = agroId ? { id: agroId, service: serviceInput } : { email: agroEmail, service: serviceInput };
      const r = await axios.post('/api/user/agro/services', payload);
      setServices(r.data?.services || []);
      setServiceInput('');
      setShowServiceModal(false);
    } catch (e) {
      // Keep modal open to let user retry
    }
  };

  const loadRequests = async () => {
    try {
      const res = await axios.get('/api/user/agro/requests', { params: { email: agroEmail } });
      setRequests(res.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (key !== 'image' && productForm[key]) {
          formData.append(key, productForm[key]);
        }
      });
      formData.append('email', agroEmail);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      if (editingProduct) {
        await axios.put(`/api/user/product/${editingProduct._id}`, formData);
      } else {
        await axios.post('/api/user/product', formData);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Seed',
        price: '',
        quantity: '',
        discount: '',
        description: '',
        image: null
      });
      // Reload products and recent products
      await loadProducts();
      // Also reload recent products for dashboard display
      try {
        const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
        const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
        setRecentProducts(response.data || []);
        // Also reload metrics
        const metricsRes = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
        setMetrics(metricsRes.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
      } catch (err) {
        console.error('Error reloading recent products:', err);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      discount: product.discount,
      description: product.description,
      image: null
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/user/product/${productId}`, { data: { email: agroEmail } });
        await loadProducts();
        // Also reload recent products for dashboard display
        try {
          const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
          const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
          setRecentProducts(response.data || []);
          // Also reload metrics
          const metricsRes = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
          setMetrics(metricsRes.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
        } catch (err) {
          console.error('Error reloading recent products:', err);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.patch(`/api/user/order/${orderId}/status`, {
        email: agroEmail,
        status
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRequestResponse = async (requestId, response, status) => {
    try {
      await axios.patch(`/api/user/request/${requestId}/respond`, {
        email: agroEmail,
        response,
        status
      });
      loadRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  if (!agroName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <div className="text-2xl font-bold text-[#2F855A] mb-2">Please log in</div>
          <a href="/login" className="text-[#2F855A] font-semibold underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transition-transform duration-200`}>
        <div className="h-16 flex items-center px-4 border-b">
          <FaBuilding className="text-[#2F855A] mr-2" />
          <span className="font-bold text-[#2F855A]">Agro Business Dashboard</span>
        </div>
        <nav className="p-4 space-y-1 text-sm">
          {[
            { icon: <FaChartLine className="mr-2" />, label: 'Dashboard Overview', tab: 'dashboard' },
            { icon: <FaBoxOpen className="mr-2" />, label: 'My Products', tab: 'products' },
            { icon: <FaShoppingCart className="mr-2" />, label: 'Orders', tab: 'orders' },
            { icon: <FaEnvelope className="mr-2" />, label: 'Requests', tab: 'requests' },
            { icon: <FaChartBar className="mr-2" />, label: 'Analytics & Insights', tab: 'analytics' },
            { icon: <FaBell className="mr-2" />, label: 'Notifications', tab: 'notifications' },
            { icon: <FaCog className="mr-2" />, label: 'Settings', tab: 'settings' },
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center px-3 py-2 rounded hover:bg-[#2F855A]/10 text-[#2F855A] ${
                activeTab === item.tab ? 'bg-[#2F855A]/20 font-semibold' : ''
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden mr-3 text-[#2F855A]">☰</button>
              <div className="text-lg font-bold text-[#2F855A]">Welcome, {agroName}</div>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationCenter 
                userRole="agro" 
                userId={agroId} 
                userEmail={agroEmail}
                onViewAll={() => setActiveTab('notifications')}
              />
              <div className="flex items-center bg-white px-3 py-2 rounded-full border text-sm text-gray-700"><FaUserCircle className="mr-2" /> {agroEmail}</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[{
                  title: 'Products', value: (metricsLoading ? '…' : metrics.products), color: 'from-emerald-100 to-green-50'
                },{
                  title: 'Orders', value: (metricsLoading ? '…' : metrics.orders), color: 'from-yellow-100 to-amber-50'
                },{
                  title: 'Pending Orders', value: (metricsLoading ? '…' : metrics.pendingOrders), color: 'from-red-100 to-rose-50'
                },{
                  title: 'Revenue (₹)', value: (metricsLoading ? '…' : metrics.revenue), color: 'from-blue-100 to-sky-50'
                }].map((c, i) => (
                  <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl shadow p-4`}> 
                    <div className="text-xs text-gray-600">{c.title}</div>
                    <div className="text-2xl font-bold text-[#2F855A]">{c.value}</div>
                  </div>
                ))}
              </div>

              {/* Summary + Services */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="text-lg font-bold text-[#2F855A] mb-3">Business Summary</div>
                  {profileLoading ? 'Loading…' : profileError ? (
                    <div className="text-sm text-red-600">{profileError}</div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center"><FaCogs className="mr-2 text-[#D69E2E]" /> Type: {profile?.agroType || profile?.businessType || '—'}</div>
                      <div className="flex items-center"><FaMapMarkerAlt className="mr-2 text-red-500" /> Location: {profile?.city || profile?.location || '—'}</div>
                      <div className="flex items-center"><FaClock className="mr-2 text-blue-500" /> Hours: {profile?.workingHours?.range || profile?.workingHours || '—'}</div>
                      {profile?.logoPath && <img src={profile.logoPath} alt="logo" className="mt-3 h-16 w-16 object-cover rounded" />}
                    </div>
                  )}
                  <button className="mt-4 bg-[#D69E2E] text-white px-4 py-2 rounded-lg text-sm">Edit Profile</button>
                </div>

                <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-[#2F855A]">Services Offered</div>
                    <button className="bg-[#2F855A] text-white px-3 py-2 rounded text-sm"><FaPlus className="inline mr-1" /> Add Service</button>
                  </div>
                  {servicesLoading ? 'Loading…' : servicesError ? (
                    <div className="text-sm text-red-600">{servicesError}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(services || []).length === 0 ? <span className="text-gray-500 text-sm">None</span> : (
                        services.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-[#2F855A]/10 text-[#2F855A] rounded-full text-sm">{s}</span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent products and orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="text-lg font-bold text-[#2F855A] mb-3">Recent Products</div>
                  <div className="space-y-3">
                    {recentLoading ? (
                      <div className="text-sm text-gray-500">Loading…</div>
                    ) : recentError ? (
                      <div className="text-sm text-red-600">{recentError}</div>
                    ) : (recentProducts || []).length > 0 ? (
                      <>
                        {(recentProducts || []).map((p, idx) => (
                          <div key={p._id || idx} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <div className="font-semibold text-gray-800">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.category || '—'} · ₹{p.price}</div>
                            </div>
                            {p.imagePath && <img src={p.imagePath} alt="prod" className="h-10 w-10 object-cover rounded" />}
                          </div>
                        ))}
                        <div className="text-center mt-2">
                          <button 
                            onClick={() => setActiveTab('products')}
                            className="text-sm text-[#2F855A] hover:underline"
                          >
                            View all products →
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No products yet. <button onClick={() => setShowProductModal(true)} className="text-[#2F855A] hover:underline">Add your first product</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="text-lg font-bold text-[#2F855A] mb-3">Recent Orders</div>
                  <div className="space-y-3">
                    {recentLoading ? (
                      <div className="text-sm text-gray-500">Loading…</div>
                    ) : recentError ? (
                      <div className="text-sm text-red-600">{recentError}</div>
                    ) : (recentOrders || []).map((o, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-semibold text-gray-800 col-span-2">{o.productId?.name || o.productName} × {o.quantity}</div>
                        <div className="text-gray-600">{o.farmerId?.name || o.farmerName}</div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${o.status === 'Completed' ? 'bg-green-100 text-green-700' : o.status === 'Shipped' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                    {(!recentOrders || recentOrders.length === 0) && !recentLoading && !recentError && <div className="text-sm text-gray-500">No orders yet.</div>}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="text-lg font-bold text-[#2F855A] mb-3">Notifications</div>
                <div className="space-y-2">
                  {recentLoading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                  ) : recentError ? (
                    <div className="text-sm text-red-600">{recentError}</div>
                  ) : (recentNotifications || []).map((n, idx) => (
                    <div key={idx} className={`p-3 rounded border ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                      <div className="font-semibold text-gray-800 text-sm">{n.title}</div>
                      <div className="text-xs text-gray-600">{n.body}</div>
                    </div>
                  ))}
                  {(!recentNotifications || recentNotifications.length === 0) && !recentLoading && !recentError && <div className="text-sm text-gray-500">No notifications.</div>}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">All Notifications</h2>
              <div className="space-y-3">
                {(recentNotifications || []).map((n, idx) => (
                  <div key={idx} className={`p-3 rounded border ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-800 text-sm">{n.title}</div>
                      <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-gray-600">{n.body}</div>
                  </div>
                ))}
                {(!recentNotifications || recentNotifications.length === 0) && (
                  <div className="text-sm text-gray-500">No notifications.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2F855A]">My Products ({products.length} total)</h2>
                <button 
                  onClick={() => setShowProductModal(true)}
                  className="bg-[#2F855A] text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Product
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      {product.imagePath && (
                        <img src={product.imagePath} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                      )}
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-sm text-gray-700 mb-2">{product.description || 'No description'}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-[#2F855A]">₹{product.price}</span>
                        {product.discount > 0 && (
                          <span className="text-sm text-red-600">-{product.discount}%</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Quantity: {product.quantity}</p>
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p className="mb-4">No products added yet.</p>
                    <button 
                      onClick={() => setShowProductModal(true)}
                      className="bg-[#2F855A] text-white px-4 py-2 rounded-lg"
                    >
                      Add Your First Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Farmer</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {order.productId?.imagePath && (
                              <img src={order.productId.imagePath} alt={order.productId.name} className="w-10 h-10 object-cover rounded mr-3" />
                            )}
                            <div>
                              <div className="font-semibold">{order.productId?.name}</div>
                              <div className="text-sm text-gray-600">{order.productId?.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold">{order.farmerId?.name || order.farmerName}</div>
                            <div className="text-sm text-gray-600">{order.farmerId?.phone || order.farmerPhone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{order.quantity}</td>
                        <td className="py-3 px-4">₹{order.totalPrice}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Accepted' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {order.status === 'Placed' && (
                              <>
                                <button 
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Accepted')}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  <FaCheck className="inline mr-1" /> Accept
                                </button>
                                <button 
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Rejected')}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  <FaTimes className="inline mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {order.status === 'Accepted' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order._id, 'Shipped')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Ship
                              </button>
                            )}
                            {order.status === 'Shipped' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order._id, 'Completed')}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">Farmer Requests</h2>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {request.productId?.imagePath && (
                          <img src={request.productId.imagePath} alt={request.productId.name} className="w-12 h-12 object-cover rounded mr-3" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{request.productId?.name}</h3>
                          <p className="text-sm text-gray-600">Category: {request.productId?.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'Responded' ? 'bg-green-100 text-green-700' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Farmer: {request.farmerId?.name || request.farmerName}</p>
                      <p className="text-sm text-gray-600 mb-1">Contact: {request.farmerId?.phone || request.farmerPhone}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-semibold text-sm mb-1">Message:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
                    </div>
                    
                    {request.response && (
                      <div className="mb-3">
                        <p className="font-semibold text-sm mb-1">Your Response:</p>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{request.response}</p>
                      </div>
                    )}
                    
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            const response = prompt('Enter your response:');
                            if (response) {
                              handleRequestResponse(request._id, response, 'Responded');
                            }
                          }}
                          className="bg-green-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Respond
                        </button>
                        <button 
                          onClick={() => handleRequestResponse(request._id, 'Request rejected', 'Rejected')}
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No requests yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  category: 'Seed',
                  price: '',
                  quantity: '',
                  discount: '',
                  description: '',
                  image: null
                });
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                  placeholder="Enter product name" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  name="category" 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg"
                  required
                >
                  <option value="Seed">Seed</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Unit (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={productForm.price} 
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                  placeholder="Enter price" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Available Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={productForm.quantity} 
                  onChange={(e) => setProductForm({...productForm, quantity: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                  placeholder="Enter quantity" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Discount % (Optional)</label>
                <input 
                  type="number" 
                  name="discount" 
                  value={productForm.discount} 
                  onChange={(e) => setProductForm({...productForm, discount: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                  placeholder="Enter discount percentage" 
                  min="0" 
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                  placeholder="Enter product description" 
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#D69E2E] transition-all duration-200"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroDashboard;


