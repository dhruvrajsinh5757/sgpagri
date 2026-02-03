import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaDownload, 
  FaArrowUp, 
  FaArrowDown,
  FaUserPlus,
  FaMapMarkerAlt,
  FaChartLine,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const FarmerConnections = ({ agroId, agroEmail, dateRange, customDateRange }) => {
  const [connectionsData, setConnectionsData] = useState({});
  const [growthData, setGrowthData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('line'); // 'line', 'bar'
  const [showGrowthChart, setShowGrowthChart] = useState(true);
  const [showRegionChart, setShowRegionChart] = useState(true);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  useEffect(() => {
    loadConnectionsData();
  }, [agroId, agroEmail, dateRange, customDateRange]);

  const loadConnectionsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        id: agroId,
        email: agroEmail,
        dateRange,
        ...customDateRange
      };

      const response = await axios.get('/api/user/agro/analytics/farmer-connections', { params });
      
      setConnectionsData(response.data.summary || {});
      setGrowthData(response.data.growthData || []);
      setRegionData(response.data.regionData || []);
    } catch (error) {
      console.error('Error loading connections data:', error);
      setError('Failed to load connections data');
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
        format,
        ...customDateRange
      };

      const response = await axios.get('/api/user/agro/analytics/farmer-connections/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `farmer-connections-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const getConversionRate = () => {
    const totalContacts = connectionsData.totalContacts || 0;
    const totalOrders = connectionsData.totalOrders || 0;
    return totalContacts > 0 ? ((totalOrders / totalContacts) * 100).toFixed(1) : 0;
  };

  const getGrowthRate = () => {
    if (growthData.length < 2) return 0;
    const current = growthData[growthData.length - 1]?.totalConnections || 0;
    const previous = growthData[growthData.length - 2]?.totalConnections || 0;
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
          onClick={loadConnectionsData}
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
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Line
              </button>
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
            </div>
          </div>

          {/* Chart Visibility Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrowthChart(!showGrowthChart)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showGrowthChart
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {showGrowthChart ? <FaEye /> : <FaEyeSlash />}
              Growth Chart
            </button>
            <button
              onClick={() => setShowRegionChart(!showRegionChart)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showRegionChart
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {showRegionChart ? <FaEye /> : <FaEyeSlash />}
              Region Chart
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
            <FaUsers className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Farmers</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {connectionsData.totalFarmers || 0}
          </div>
          <div className="text-xs text-blue-700">
            {getGrowthRate() > 0 ? '+' : ''}{getGrowthRate()}% this month
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaUserPlus className="text-green-600" />
            <span className="text-sm font-medium text-green-900">New This Month</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {connectionsData.newThisMonth || 0}
          </div>
          <div className="text-xs text-green-700">
            New connections
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {getConversionRate()}%
          </div>
          <div className="text-xs text-purple-700">
            Contacts to orders
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Active Regions</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {regionData.length}
          </div>
          <div className="text-xs text-yellow-700">
            Geographic areas
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      {showGrowthChart && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Farmer Connections Growth Over Time
            </h3>
            <p className="text-sm text-gray-600">
              Cumulative growth of farmer connections • {dateRange}
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      value.toLocaleString(),
                      name === 'totalConnections' ? 'Total Connections' : 
                      name === 'newConnections' ? 'New Connections' : 'Orders'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalConnections" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Total Connections"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newConnections" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="New Connections"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              ) : (
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      value.toLocaleString(),
                      name === 'totalConnections' ? 'Total Connections' : 
                      name === 'newConnections' ? 'New Connections' : 'Orders'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="totalConnections" fill="#10B981" name="Total Connections" />
                  <Bar dataKey="newConnections" fill="#3B82F6" name="New Connections" />
                  <Bar dataKey="orders" fill="#8B5CF6" name="Orders" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Region Distribution */}
      {showRegionChart && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Region Chart */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Farmers by Region
              </h3>
              <p className="text-sm text-gray-600">
                Geographic distribution of farmer connections
              </p>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="farmerCount"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Farmers']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region List */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Region Breakdown
              </h3>
              <p className="text-sm text-gray-600">
                Detailed view of farmer distribution
              </p>
            </div>
            
            <div className="space-y-3">
              {regionData.map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">{region.region}</div>
                      <div className="text-sm text-gray-500">
                        {region.orders} orders • ₹{region.revenue?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{region.farmerCount}</div>
                    <div className="text-xs text-gray-500">farmers</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Farmer Connections Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Farmers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New This Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regionData.map((region, index) => (
                <tr key={region.region} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">{region.region}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.farmerCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.newThisMonth || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{region.revenue?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.farmerCount > 0 ? ((region.orders / region.farmerCount) * 100).toFixed(1) : 0}%
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

export default FarmerConnections;
