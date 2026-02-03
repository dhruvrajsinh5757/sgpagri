import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaDownload, 
  FaFilter,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import axios from 'axios';

// Import chart components
import MonthlySalesGraph from './analytics/MonthlySalesGraph';
import PopularProducts from './analytics/PopularProducts';
import FarmerConnections from './analytics/FarmerConnections';
import GeoMap from './analytics/GeoMap';

const Analytics = () => {
  const agroId = localStorage.getItem('agroId');
  const agroEmail = localStorage.getItem('agroEmail');
  const [activeModule, setActiveModule] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Test analytics API on component mount
  useEffect(() => {
    const testAnalytics = async () => {
      if (!(agroId || agroEmail)) return;
      
      try {
        const params = agroId ? { id: agroId } : { email: agroEmail };
        console.log('Testing analytics API with:', params);
        const response = await axios.get('/api/user/agro/analytics/test', { params });
        console.log('Analytics test response:', response.data);
      } catch (error) {
        console.error('Analytics test failed:', error);
        setError('Analytics API connection failed: ' + (error.response?.data?.message || error.message));
      }
    };
    
    testAnalytics();
  }, [agroId, agroEmail]);
  
  // Global filters
  const [dateRange, setDateRange] = useState('thisMonth');
  const [productType, setProductType] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  // Module visibility toggles
  const [moduleVisibility, setModuleVisibility] = useState({
    sales: true,
    products: true,
    connections: true,
    geoMap: true
  });

  const modules = [
    {
      id: 'sales',
      title: 'Monthly Sales Graph',
      icon: <FaChartBar className="text-blue-500" />,
      description: 'Revenue and quantity trends over time'
    },
    {
      id: 'products',
      title: 'Most Popular Products',
      icon: <FaChartLine className="text-green-500" />,
      description: 'Top and bottom performing products'
    },
    {
      id: 'connections',
      title: 'Farmer Connections',
      icon: <FaUsers className="text-purple-500" />,
      description: 'Farmer engagement and growth metrics'
    },
    {
      id: 'geoMap',
      title: 'Demand Regions Map',
      icon: <FaMapMarkerAlt className="text-red-500" />,
      description: 'Geographic distribution of demand'
    }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const productTypeOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'Seed', label: 'Seeds' },
    { value: 'Fertilizer', label: 'Fertilizers' },
    { value: 'Machinery', label: 'Machinery' },
    { value: 'Other', label: 'Other' }
  ];

  const toggleModuleVisibility = (moduleId) => {
    setModuleVisibility(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const exportAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/agro/analytics/export', {
        params: {
          id: agroId,
          email: agroEmail,
          dateRange,
          productType,
          customDateRange
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agro-analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/user/agro/analytics/generate-demo-data', {
        id: agroId,
        email: agroEmail
      });
      
      console.log('Demo data generated:', response.data);
      setError(''); // Clear any previous errors
      
      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Demo data generation failed:', error);
      setError('Failed to generate demo data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === dateRange);
    return option ? option.label : 'Custom Range';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
              <p className="text-gray-600">Comprehensive business analytics for your agro-business</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateDemoData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <FaChartBar />
                {loading ? 'Generating...' : 'Generate Demo Data'}
              </button>
              <button
                onClick={exportAllData}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
              >
                <FaDownload />
                {loading ? 'Exporting...' : 'Export All Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Global Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-1" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {productTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Active Filters:</strong> {getDateRangeLabel()} • {productTypeOptions.find(opt => opt.value === productType)?.label}
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map(module => (
              <div
                key={module.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeModule === module.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveModule(module.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {module.icon}
                    <span className="font-medium text-gray-900">{module.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModuleVisibility(module.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {moduleVisibility[module.id] ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">{error}</div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Analytics Modules */}
        <div className="space-y-6">
          {/* Monthly Sales Graph */}
          {moduleVisibility.sales && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaChartBar className="text-blue-500" />
                  Monthly Sales Graph
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Module Active</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <MonthlySalesGraph
                agroId={agroId}
                agroEmail={agroEmail}
                dateRange={dateRange}
                productType={productType}
                customDateRange={customDateRange}
              />
            </div>
          )}

          {/* Most Popular Products */}
          {moduleVisibility.products && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaChartLine className="text-green-500" />
                  Most Popular Products
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Module Active</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <PopularProducts
                agroId={agroId}
                agroEmail={agroEmail}
                dateRange={dateRange}
                productType={productType}
                customDateRange={customDateRange}
              />
            </div>
          )}

          {/* Farmer Connections */}
          {moduleVisibility.connections && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  Farmer Connections
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Module Active</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <FarmerConnections
                agroId={agroId}
                agroEmail={agroEmail}
                dateRange={dateRange}
                customDateRange={customDateRange}
              />
            </div>
          )}

          {/* Geo-Map */}
          {moduleVisibility.geoMap && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  Demand Regions Map
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Module Active</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <GeoMap
                agroId={agroId}
                agroEmail={agroEmail}
                dateRange={dateRange}
                productType={productType}
                customDateRange={customDateRange}
              />
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaArrowUp className="text-blue-600" />
                <span className="font-medium text-blue-900">Sales Growth</span>
              </div>
              <p className="text-sm text-blue-700">Your sales have grown 15% this month compared to last month</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="text-green-600" />
                <span className="font-medium text-green-900">New Connections</span>
              </div>
              <p className="text-sm text-green-700">12 new farmers connected with you this week</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-yellow-600" />
                <span className="font-medium text-yellow-900">Top Product</span>
              </div>
              <p className="text-sm text-yellow-700">Wheat Seeds are your best-selling product this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
