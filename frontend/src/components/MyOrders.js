import React from 'react';
import { FaShoppingCart, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheck, FaTimes, FaTruck, FaDownload } from 'react-icons/fa';
import axios from 'axios';

const MyOrders = () => {
  const farmerEmail = localStorage.getItem('userEmail');
  const farmerName = localStorage.getItem('userName');
  
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('All');

  React.useEffect(() => {
    if (farmerEmail) {
      loadOrders();
    }
  }, [farmerEmail]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/user/farmer/orders', { params: { email: farmerEmail } });
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Accepted':
        return 'bg-yellow-100 text-yellow-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Placed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FaCheck className="text-green-600" />;
      case 'Shipped':
        return <FaTruck className="text-blue-600" />;
      case 'Accepted':
        return <FaCheck className="text-yellow-600" />;
      case 'Rejected':
        return <FaTimes className="text-red-600" />;
      case 'Placed':
        return <FaShoppingCart className="text-gray-600" />;
      default:
        return <FaShoppingCart className="text-gray-600" />;
    }
  };

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (!farmerEmail) {
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
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F855A]">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your orders and their status</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {farmerName}</span>
              <a href="/farmer-dashboard" className="bg-[#2F855A] text-white px-4 py-2 rounded-lg">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Order Status Filter</h2>
            <div className="flex space-x-2">
              {['All', 'Placed', 'Accepted', 'Shipped', 'Completed', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#2F855A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {filter === 'All' ? 'No orders found.' : `No orders with status "${filter}".`}
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {order.productId?.imagePath && (
                        <img 
                          src={order.productId.imagePath} 
                          alt={order.productId.name} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{order.productId?.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{order.productId?.category}</p>
                        <p className="text-sm text-gray-600">Seller: {order.agroId?.agroName}</p>
                        <div className="flex items-center mt-1">
                          <FaMapMarkerAlt className="text-gray-400 mr-1 text-xs" />
                          <span className="text-xs text-gray-600">{order.agroId?.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Quantity</div>
                      <div className="font-semibold">{order.quantity} units</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Unit Price</div>
                      <div className="font-semibold">₹{order.productId?.price}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="font-semibold text-[#2F855A]">₹{order.totalPrice}</div>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Delivery Address:</div>
                      <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {order.deliveryAddress}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Payment Status: 
                        <span className={`ml-1 font-medium ${
                          order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'Completed' && order.invoicePath && (
                        <button className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm flex items-center">
                          <FaDownload className="mr-1" />
                          Download Invoice
                        </button>
                      )}
                      <button className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm">
                        Contact Seller
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'Placed').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'Shipped').length}
                </div>
                <div className="text-sm text-gray-600">Shipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2F855A]">
                  ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
