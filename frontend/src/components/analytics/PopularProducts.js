import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaDownload, 
  FaArrowUp, 
  FaArrowDown,
  FaRupeeSign,
  FaBox,
  FaEye,
  FaEyeSlash,
  FaTrophy,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const PopularProducts = ({ agroId, agroEmail, dateRange, productType, customDateRange }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [bottomProducts, setBottomProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('top'); // 'top', 'bottom', 'compare'
  const [showChart, setShowChart] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar', 'pie'

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  useEffect(() => {
    loadProductsData();
  }, [agroId, agroEmail, dateRange, productType, customDateRange]);

  const loadProductsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        id: agroId,
        email: agroEmail,
        dateRange,
        productType,
        ...customDateRange
      };

      console.log('Loading products data with params:', params);
      const response = await axios.get('/api/user/agro/analytics/popular-products', { params });
      console.log('Products data response:', response.data);
      
      setTopProducts(response.data.topProducts || []);
      setBottomProducts(response.data.bottomProducts || []);
    } catch (error) {
      console.error('Error loading products data:', error);
      setError('Failed to load products data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format = 'csv') => {
    try {
      const params = {
        id: agroId,
        email: agroEmail,
        dateRange,
        productType,
        format,
        ...customDateRange
      };

      const response = await axios.get('/api/user/agro/analytics/popular-products/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `popular-products-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const getTotalRevenue = (products) => {
    return products.reduce((sum, product) => sum + product.revenue, 0);
  };

  const getTotalQuantity = (products) => {
    return products.reduce((sum, product) => sum + product.quantity, 0);
  };

  const getAverageOrderValue = (products) => {
    const totalOrders = products.reduce((sum, product) => sum + product.orders, 0);
    const totalRevenue = getTotalRevenue(products);
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadProductsData}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentProducts = viewMode === 'top' ? topProducts : bottomProducts;
  const chartData = currentProducts.map((product, index) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    fullName: product.name,
    revenue: product.revenue,
    quantity: product.quantity,
    orders: product.orders,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('top')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'top'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaTrophy className="inline mr-1" />
                Top 5
              </button>
              <button
                onClick={() => setViewMode('bottom')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'bottom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaExclamationTriangle className="inline mr-1" />
                Bottom 5
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'compare'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Compare
              </button>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Chart:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'pie'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pie
              </button>
            </div>
          </div>

          {/* Chart Visibility Toggle */}
          <button
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showChart
                ? 'bg-blue-100 text-blue-900'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            {showChart ? <FaEye /> : <FaEyeSlash />}
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('csv')}
            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <FaDownload />
            CSV
          </button>
          <button
            onClick={() => exportData('pdf')}
            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
          >
            <FaDownload />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaRupeeSign className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ₹{getTotalRevenue(currentProducts).toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaBox className="text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Quantity</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {getTotalQuantity(currentProducts).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Avg Order Value</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ₹{getAverageOrderValue(currentProducts).toFixed(0)}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Best Performer</span>
          </div>
          <div className="text-lg font-bold text-yellow-900">
            {currentProducts.length > 0 ? currentProducts[0].name.substring(0, 20) + '...' : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart */}
      {showChart && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {viewMode === 'top' ? 'Top 5 Products' : 'Bottom 5 Products'} Performance
            </h3>
            <p className="text-sm text-gray-600">
              {productType === 'all' ? 'All Products' : productType} • {dateRange}
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
                      name === 'revenue' ? 'Revenue' : name === 'quantity' ? 'Quantity' : 'Orders'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  <Bar dataKey="quantity" fill="#3B82F6" name="Quantity" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b bg-green-50">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Top 5 Products
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                    </div>
                  </div>
                  {product.imagePath && (
                    <div className="flex-shrink-0">
                      <img 
                        src={product.imagePath} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{product.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.quantity} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Products */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Bottom 5 Products
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {bottomProducts.map((product, index) => (
                <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                    </div>
                  </div>
                  {product.imagePath && (
                    <div className="flex-shrink-0">
                      <img 
                        src={product.imagePath} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{product.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.quantity} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison View */}
      {viewMode === 'compare' && (
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Product Performance Comparison</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...topProducts, ...bottomProducts].map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imagePath && (
                            <img 
                              src={product.imagePath} 
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded mr-3"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.orders > 0 ? (product.revenue / product.orders).toFixed(0) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularProducts;
