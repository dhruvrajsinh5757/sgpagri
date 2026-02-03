import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaDownload, 
  FaEye,
  FaEyeSlash,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaShoppingCart,
  FaRupeeSign,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';

const GeoMap = ({ agroId, agroEmail, dateRange, productType, customDateRange }) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapType, setMapType] = useState('heatmap'); // 'heatmap', 'markers'
  const [showOpportunityZones, setShowOpportunityZones] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    loadMapData();
  }, [agroId, agroEmail, dateRange, productType, customDateRange]);

  const loadMapData = async () => {
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

      const response = await axios.get('/api/user/agro/analytics/geo-map', { params });
      setMapData(response.data || []);
    } catch (error) {
      console.error('Error loading map data:', error);
      setError('Failed to load map data');
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

      const response = await axios.get('/api/user/agro/analytics/geo-map/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `geo-map-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getTotalFarmers = () => {
    return mapData.reduce((sum, region) => sum + region.farmerCount, 0);
  };

  const getTotalOrders = () => {
    return mapData.reduce((sum, region) => sum + region.orders, 0);
  };

  const getTotalRevenue = () => {
    return mapData.reduce((sum, region) => sum + (region.revenue || 0), 0);
  };

  const getOpportunityZones = () => {
    return mapData.filter(region => region.browsingCount > 0 && region.orders === 0);
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
          onClick={loadMapData}
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
          {/* Map Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Map Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMapType('heatmap')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  mapType === 'heatmap'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => setMapType('markers')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  mapType === 'markers'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Markers
              </button>
            </div>
          </div>

          {/* Opportunity Zones Toggle */}
          <button
            onClick={() => setShowOpportunityZones(!showOpportunityZones)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showOpportunityZones
                ? 'bg-yellow-100 text-yellow-900'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            {showOpportunityZones ? <FaToggleOn /> : <FaToggleOff />}
            <FaExclamationTriangle className="text-yellow-600" />
            Opportunity Zones
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
            <FaUsers className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Farmers</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {getTotalFarmers().toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaShoppingCart className="text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Orders</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {getTotalOrders().toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaRupeeSign className="text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ₹{getTotalRevenue().toLocaleString()}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Opportunity Zones</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {getOpportunityZones().length}
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Demand Regions Map
          </h3>
          <p className="text-sm text-gray-600">
            {productType === 'all' ? 'All Products' : productType} • {dateRange}
          </p>
        </div>
        
        {/* Simplified Map Representation */}
        <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Interactive Map Visualization</p>
              <p className="text-sm text-gray-500">
                {mapType === 'heatmap' ? 'Heatmap showing demand intensity' : 'Markers showing farmer locations'}
              </p>
            </div>
          </div>
          
          {/* Simulated Map Regions */}
          <div className="absolute inset-4 grid grid-cols-3 gap-2">
            {mapData.slice(0, 9).map((region, index) => {
              const intensity = Math.min(100, (region.orders / Math.max(...mapData.map(r => r.orders))) * 100);
              return (
                <div
                  key={region.region}
                  className={`${getIntensityColor(intensity)} rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => setSelectedRegion(region)}
                  title={`${region.region}: ${region.farmerCount} farmers, ${region.orders} orders`}
                >
                  <div className="text-white text-xs font-medium truncate">
                    {region.region}
                  </div>
                  <div className="text-white text-xs opacity-75">
                    {region.farmerCount} farmers
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Demand Intensity:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600">Very High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">Maximum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Regions */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">All Regions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mapData.map((region, index) => {
                const intensity = Math.min(100, (region.orders / Math.max(...mapData.map(r => r.orders))) * 100);
                return (
                  <div
                    key={region.region}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRegion?.region === region.region
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{region.region}</div>
                        <div className="text-sm text-gray-500">
                          {region.farmerCount} farmers • {region.orders} orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{region.revenue?.toLocaleString() || 0}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          intensity >= 80 ? 'bg-red-100 text-red-800' :
                          intensity >= 60 ? 'bg-orange-100 text-orange-800' :
                          intensity >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          intensity >= 20 ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {intensity.toFixed(0)}% intensity
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Region Details / Opportunity Zones */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {showOpportunityZones ? 'Opportunity Zones' : 'Region Details'}
            </h3>
          </div>
          <div className="p-6">
            {showOpportunityZones ? (
              <div className="space-y-3">
                {getOpportunityZones().length > 0 ? (
                  getOpportunityZones().map((region, index) => (
                    <div key={region.region} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaExclamationTriangle className="text-yellow-600" />
                        <span className="font-medium text-yellow-900">{region.region}</span>
                      </div>
                      <div className="text-sm text-yellow-800">
                        <div>Browsing Activity: {region.browsingCount} views</div>
                        <div>Orders: 0 (Opportunity!)</div>
                        <div>Potential Revenue: ₹{region.potentialRevenue?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaExclamationTriangle className="text-4xl mx-auto mb-2 text-gray-400" />
                    <p>No opportunity zones found</p>
                    <p className="text-sm">All regions with browsing activity have orders</p>
                  </div>
                )}
              </div>
            ) : selectedRegion ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedRegion.region}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600">Farmers</div>
                      <div className="text-xl font-bold text-blue-900">{selectedRegion.farmerCount}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600">Orders</div>
                      <div className="text-xl font-bold text-green-900">{selectedRegion.orders}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600">Revenue</div>
                      <div className="text-xl font-bold text-purple-900">₹{selectedRegion.revenue?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm text-yellow-600">Avg Order</div>
                      <div className="text-xl font-bold text-yellow-900">
                        ₹{selectedRegion.orders > 0 ? (selectedRegion.revenue / selectedRegion.orders).toFixed(0) : 0}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedRegion.topProducts && selectedRegion.topProducts.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Top Products</h5>
                    <div className="space-y-2">
                      {selectedRegion.topProducts.slice(0, 3).map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{product.name}</span>
                          <span className="font-medium">{product.quantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaMapMarkerAlt className="text-4xl mx-auto mb-2 text-gray-400" />
                <p>Select a region to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Regional Data Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Browsing Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opportunity Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mapData.map((region, index) => {
                const intensity = Math.min(100, (region.orders / Math.max(...mapData.map(r => r.orders))) * 100);
                const opportunityScore = region.browsingCount > 0 && region.orders === 0 ? 'High' : 
                                       region.browsingCount > region.orders * 2 ? 'Medium' : 'Low';
                return (
                  <tr key={region.region} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.farmerCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{region.revenue?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{region.orders > 0 ? (region.revenue / region.orders).toFixed(0) : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.browsingCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        opportunityScore === 'High' ? 'bg-red-100 text-red-800' :
                        opportunityScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {opportunityScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
