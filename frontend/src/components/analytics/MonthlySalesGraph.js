import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaChartLine, 
  FaDownload, 
  FaToggleOn, 
  FaToggleOff,
  FaRupeeSign,
  FaBox,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const MonthlySalesGraph = ({ agroId, agroEmail, dateRange, productType, customDateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [yAxisType, setYAxisType] = useState('revenue'); // 'revenue' or 'quantity'
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    loadSalesData();
  }, [agroId, agroEmail, dateRange, productType, customDateRange]);

  const loadSalesData = async () => {
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

      console.log('Loading sales data with params:', params);
      const response = await axios.get('/api/user/agro/analytics/monthly-sales', { params });
      console.log('Sales data response:', response.data);
      
      // Transform data for chart
      const chartData = months.map((month, index) => {
        const monthData = response.data.find(item => item.month === index + 1);
        return {
          month,
          revenue: monthData?.revenue || 0,
          quantity: monthData?.quantity || 0,
          orders: monthData?.orders || 0
        };
      });

      setData(chartData);

      // Load comparison data if enabled
      if (showComparison) {
        loadComparisonData();
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    try {
      // Load previous year data for comparison
      const params = {
        id: agroId,
        email: agroEmail,
        dateRange: 'previousYear',
        productType,
        ...customDateRange
      };

      const response = await axios.get('/api/user/agro/analytics/monthly-sales', { params });
      
      const comparisonChartData = months.map((month, index) => {
        const monthData = response.data.find(item => item.month === index + 1);
        return {
          month,
          revenue: monthData?.revenue || 0,
          quantity: monthData?.quantity || 0,
          orders: monthData?.orders || 0
        };
      });

      setComparisonData(comparisonChartData);
    } catch (error) {
      console.error('Error loading comparison data:', error);
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

      const response = await axios.get('/api/user/agro/analytics/monthly-sales/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly-sales-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const getYAxisLabel = () => {
    return yAxisType === 'revenue' ? 'Revenue (₹)' : 'Quantity Sold';
  };

  const getDataKey = () => {
    return yAxisType === 'revenue' ? 'revenue' : 'quantity';
  };

  const formatTooltipValue = (value) => {
    if (yAxisType === 'revenue') {
      return `₹${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const getTotalRevenue = () => {
    return data.reduce((sum, item) => sum + item.revenue, 0);
  };

  const getTotalQuantity = () => {
    return data.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getGrowthRate = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1][getDataKey()];
    const previous = data[data.length - 2][getDataKey()];
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
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
          onClick={loadSalesData}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Chart Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaChartBar className="inline mr-1" />
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaChartLine className="inline mr-1" />
                Line
              </button>
            </div>
          </div>

          {/* Y-Axis Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Y-Axis:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setYAxisType('revenue')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  yAxisType === 'revenue'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaRupeeSign className="inline mr-1" />
                Revenue
              </button>
              <button
                onClick={() => setYAxisType('quantity')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  yAxisType === 'quantity'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaBox className="inline mr-1" />
                Quantity
              </button>
            </div>
          </div>

          {/* Comparison Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Compare:</span>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showComparison
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {showComparison ? <FaToggleOn /> : <FaToggleOff />}
              Previous Year
            </button>
          </div>
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
            ₹{getTotalRevenue().toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaBox className="text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Quantity</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {getTotalQuantity().toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Growth Rate</span>
          </div>
          <div className={`text-2xl font-bold ${getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {getGrowthRate()}%
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarAlt className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Best Month</span>
          </div>
          <div className="text-lg font-bold text-yellow-900">
            {data.length > 0 ? data.reduce((max, item) => 
              item[getDataKey()] > max[getDataKey()] ? item : max
            ).month : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getYAxisLabel()} by Month
          </h3>
          <p className="text-sm text-gray-600">
            {productType === 'all' ? 'All Products' : productType} • {dateRange}
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltipValue(value), getYAxisLabel()]}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar 
                  dataKey={getDataKey()} 
                  fill="#10B981" 
                  name={getYAxisLabel()}
                />
                {showComparison && (
                  <Bar 
                    dataKey={`${getDataKey()}_prev`} 
                    fill="#6B7280" 
                    name={`${getYAxisLabel()} (Previous Year)`}
                  />
                )}
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltipValue(value), getYAxisLabel()]}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={getDataKey()} 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name={getYAxisLabel()}
                />
                {showComparison && (
                  <Line 
                    type="monotone" 
                    dataKey={`${getDataKey()}_prev`} 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name={`${getYAxisLabel()} (Previous Year)`}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
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
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.orders > 0 ? (item.revenue / item.orders).toFixed(0) : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesGraph;
