import React from 'react';
import { FaChartBar, FaChartPie, FaTable, FaEye, FaEyeSlash, FaRupeeSign, FaSeedling, FaLeaf, FaUsers, FaTint, FaCog, FaPlus } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import axios from 'axios';

const CostAnalysis = () => {
  const userEmail = localStorage.getItem('userEmail');
  
  const [crops, setCrops] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showProfitability, setShowProfitability] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('cost'); // 'cost' or 'percentage'
  const [selectedCrop, setSelectedCrop] = React.useState(null);
  const [expandedCrops, setExpandedCrops] = React.useState(new Set());

  const categories = ['Seeds', 'Fertilizer', 'Pesticide', 'Labor', 'Irrigation', 'Machinery', 'Others'];
  const categoryIcons = {
    'Seeds': <FaSeedling className="text-green-600" />,
    'Fertilizer': <FaLeaf className="text-blue-600" />,
    'Pesticide': <FaLeaf className="text-red-600" />,
    'Labor': <FaUsers className="text-orange-600" />,
    'Irrigation': <FaTint className="text-blue-500" />,
    'Machinery': <FaCog className="text-gray-600" />,
    'Others': <FaPlus className="text-purple-600" />
  };

  // Map database categories to our display categories
  const mapCategory = (dbCategory) => {
    if (!dbCategory) return 'Others';
    
    const category = dbCategory.toLowerCase();
    if (category.includes('seed')) return 'Seeds';
    if (category.includes('fertilizer') || category.includes('fertiliser')) return 'Fertilizer';
    if (category.includes('pesticide') || category.includes('pest')) return 'Pesticide';
    if (category.includes('labor') || category.includes('labour') || category.includes('worker')) return 'Labor';
    if (category.includes('irrigation') || category.includes('water')) return 'Irrigation';
    if (category.includes('machinery') || category.includes('machine') || category.includes('equipment')) return 'Machinery';
    return 'Others';
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for user:', userEmail);
      
      const [cropsRes, expensesRes] = await Promise.all([
        axios.get('/api/user/crop', { params: { email: userEmail } }),
        axios.post('/api/user/all-transactions', { email: userEmail })
      ]);
      
      console.log('Crops response:', cropsRes.data);
      console.log('Expenses response:', expensesRes.data);
      
      setCrops(cropsRes.data || []);
      // Fix: all-transactions returns { income: [], expenses: [] }
      setExpenses(expensesRes.data?.expenses || []);
      
      console.log('Set crops:', cropsRes.data || []);
      console.log('Set expenses:', expensesRes.data?.expenses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCrops([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getCropIcon = (cropName) => {
    const name = cropName.toLowerCase();
    if (name.includes('wheat')) return <GiWheat className="text-yellow-600" />;
    if (name.includes('rice')) return <FaSeedling className="text-green-600" />;
    if (name.includes('cotton')) return <FaLeaf className="text-white bg-gray-800 rounded-full p-1" />;
    return <FaSeedling className="text-green-600" />;
  };

  const calculateCropExpenses = (cropName) => {
    const cropExpenses = expenses.filter(exp => exp.crop === cropName);
    const breakdown = {};
    
    categories.forEach(category => {
      breakdown[category] = cropExpenses
        .filter(exp => mapCategory(exp.category) === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
    
    breakdown.Total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    return breakdown;
  };

  const getCategoryPercentage = (amount, total) => {
    if (total === 0 || total === null || total === undefined) return 0;
    return ((amount / total) * 100).toFixed(1);
  };

  const getHighCostColor = (amount, total) => {
    const percentage = getCategoryPercentage(amount, total);
    if (percentage > 30) return 'bg-red-100 text-red-800';
    if (percentage > 20) return 'bg-yellow-100 text-yellow-800';
    if (percentage > 10) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const toggleCropExpansion = (cropName) => {
    const newExpanded = new Set(expandedCrops);
    if (newExpanded.has(cropName)) {
      newExpanded.delete(cropName);
    } else {
      newExpanded.add(cropName);
    }
    setExpandedCrops(newExpanded);
  };

  const getProfitabilityData = () => {
    return crops.map(crop => {
      const expenses = calculateCropExpenses(crop.name);
      const totalCost = expenses.Total;
      // Mock selling price (in real app, this would come from income data)
      const sellingPrice = totalCost * (0.8 + Math.random() * 0.8); // 80% to 160% of cost
      const profit = sellingPrice - totalCost;
      const profitPercentage = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0.0';
      
      return {
        crop: crop.name,
        totalCost,
        sellingPrice,
        profit,
        profitPercentage,
        isProfitable: profit > 0
      };
    });
  };

  const getSmartSuggestions = () => {
    const suggestions = [];
    
    crops.forEach(crop => {
      const breakdown = calculateCropExpenses(crop.name);
      const total = breakdown.Total;
      
      categories.forEach(category => {
        const percentage = getCategoryPercentage(breakdown[category], total);
        if (percentage > 25) {
          suggestions.push(`${category} cost in ${crop.name} is ${percentage}% of total cost`);
        }
      });
    });
    
    return suggestions.slice(0, 3); // Top 3 suggestions
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F855A] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading cost analysis...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#2F855A] mb-2">Crop-wise Cost Analysis</h2>
        <p className="text-gray-600">Analyze and compare expenses across different crops</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="cost">Cost (₹)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showProfitability"
            checked={showProfitability}
            onChange={(e) => setShowProfitability(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showProfitability" className="text-sm font-medium text-gray-700">
            Show Profitability
          </label>
        </div>
        
        <button 
          onClick={fetchData}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <strong>Debug Info:</strong> 
        Crops: {crops.length}, Expenses: {expenses.length}
        {crops.length > 0 && (
          <div className="mt-1">
            Crop names: {crops.map(c => c.name).join(', ')}
          </div>
        )}
        {expenses.length > 0 && (
          <div className="mt-1">
            Expense categories: {[...new Set(expenses.map(e => e.category))].join(', ')}
          </div>
        )}
      </div>

      {/* No Data Message */}
      {!loading && crops.length === 0 && (
        <div className="mb-8 p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">No Crops Found</h3>
          <p className="text-blue-600 mb-4">You need to add crops first to see cost analysis.</p>
          <button 
            onClick={() => window.location.href = '/farmer'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {!loading && crops.length > 0 && expenses.length === 0 && (
        <div className="mb-8 p-8 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">No Expenses Yet</h3>
          <p className="text-green-600 mb-4">You have crops but no expenses recorded. Add some expenses to see cost analysis.</p>
          <button 
            onClick={() => window.location.href = '/farmer'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Expenses
          </button>
        </div>
      )}

      {/* Expense Breakdown Table */}
      {!loading && crops.length > 0 && expenses.length > 0 && (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#2F855A] mb-4 flex items-center">
              <FaTable className="mr-2" />
              Expense Breakdown by Crop
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-gradient-to-r from-[#2F855A] to-[#D69E2E] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Crop</th>
                    {categories.map(category => (
                      <th key={category} className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {categoryIcons[category]}
                          <span className="text-xs">{category}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop, idx) => {
                    const breakdown = calculateCropExpenses(crop.name);
                    const total = breakdown.Total;
                    
                    return (
                      <React.Fragment key={crop._id}>
                        <tr 
                          className={`hover:bg-gray-50 cursor-pointer ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                          onClick={() => toggleCropExpansion(crop.name)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getCropIcon(crop.name)}
                              <span className="font-medium">{crop.name}</span>
                              <button className="text-gray-400 hover:text-gray-600">
                                {expandedCrops.has(crop.name) ? '▼' : '▶'}
                              </button>
                            </div>
                          </td>
                          {categories.map(category => {
                            const amount = breakdown[category];
                            const displayValue = viewMode === 'cost' 
                              ? `₹${amount.toLocaleString()}`
                              : `${getCategoryPercentage(amount, total)}%`;
                            
                            return (
                              <td key={category} className="px-4 py-3 text-center">
                                <div 
                                  className={`px-2 py-1 rounded text-sm font-medium ${getHighCostColor(amount, total)}`}
                                  title={`${category}: ₹${amount.toLocaleString()} (${getCategoryPercentage(amount, total)}% of total)`}
                                >
                                  {displayValue}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center font-bold text-[#2F855A]">
                            ₹{total.toLocaleString()}
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {expandedCrops.has(crop.name) && (
                          <tr>
                            <td colSpan={categories.length + 2} className="px-4 py-3 bg-blue-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-[#2F855A] mb-2">Category Breakdown</h4>
                                  <div className="space-y-2">
                                    {categories.map(category => {
                                      const amount = breakdown[category];
                                      const percentage = getCategoryPercentage(amount, total);
                                      return (
                                        <div key={category} className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">{category}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                              <div 
                                                className="bg-[#2F855A] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-xs font-medium">{percentage}%</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-[#2F855A] mb-2">Crop Details</h4>
                                  <div className="text-sm space-y-1 text-gray-600">
                                    <p>Start Date: {new Date(crop.startDate).toLocaleDateString()}</p>
                                    <p>Harvest Date: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
                                    <p>Planned Budget: ₹{crop.plannedBudget.toLocaleString()}</p>
                                    <p>Budget Usage: {crop.plannedBudget > 0 ? ((total / crop.plannedBudget) * 100).toFixed(1) : 0}%</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Crop Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#2F855A] mb-4 flex items-center">
                <FaChartBar className="mr-2" />
                Total Cost Comparison
              </h3>
              <div className="space-y-3">
                {crops.map(crop => {
                  const total = calculateCropExpenses(crop.name).Total;
                  const maxTotal = Math.max(...crops.map(c => calculateCropExpenses(c.name).Total));
                  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={crop._id} className="flex items-center gap-3">
                      {getCropIcon(crop.name)}
                      <span className="flex-1 text-sm font-medium">{crop.name}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-[#2F855A] to-[#D69E2E] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-[#2F855A] w-20 text-right">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#2F855A] mb-4 flex items-center">
                <FaChartPie className="mr-2" />
                Category Distribution
              </h3>
              <div className="space-y-3">
                {categories.map(category => {
                  const totalAmount = categories.reduce((sum, cat) => {
                    return sum + crops.reduce((cropSum, crop) => {
                      return cropSum + calculateCropExpenses(crop.name)[cat];
                    }, 0);
                  }, 0);
                  
                  const categoryTotal = crops.reduce((sum, crop) => {
                    return sum + calculateCropExpenses(crop.name)[category];
                  }, 0);
                  
                  const percentage = totalAmount > 0 ? (categoryTotal / totalAmount) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex items-center gap-3">
                      {categoryIcons[category]}
                      <span className="flex-1 text-sm font-medium">{category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-[#D69E2E] to-[#2F855A] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-[#D69E2E] w-20 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Profitability Insights */}
          {showProfitability && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#2F855A] mb-4 flex items-center">
                <FaRupeeSign className="mr-2" />
                Profitability Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Smart Suggestions</h4>
                  <div className="space-y-2">
                    {getSmartSuggestions().map((suggestion, idx) => (
                      <div key={idx} className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
                        💡 {suggestion}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Cost Efficiency</h4>
                  <div className="space-y-2">
                    {crops.map(crop => {
                      const total = calculateCropExpenses(crop.name).Total;
                      const efficiency = crop.plannedBudget > 0 ? ((crop.plannedBudget - total) / crop.plannedBudget * 100).toFixed(1) : 0;
                      return (
                        <div key={crop._id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{crop.name}</span>
                          <span className={`text-sm font-medium ${efficiency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {efficiency >= 0 ? '+' : ''}{efficiency}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                      📊 Export Cost Report
                    </button>
                    <button className="w-full text-left text-sm text-green-600 hover:text-green-800 p-2 bg-green-50 rounded hover:bg-green-100 transition-colors">
                      💰 Set Budget Alerts
                    </button>
                    <button className="w-full text-left text-sm text-purple-600 hover:text-purple-800 p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                      📈 View Trends
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-[#2F855A] to-[#D69E2E] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Crop</th>
                      <th className="px-4 py-3 text-center">Total Cost</th>
                      <th className="px-4 py-3 text-center">Selling Price</th>
                      <th className="px-4 py-3 text-center">Profit/Loss</th>
                      <th className="px-4 py-3 text-center">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProfitabilityData().map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getCropIcon(item.crop)}
                            <span className="font-medium">{item.crop}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">₹{item.totalCost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">₹{item.sellingPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${item.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            {item.isProfitable ? '+' : ''}{item.profit.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${item.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            {item.isProfitable ? '+' : ''}{item.profitPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile Optimization - Collapsible Cards */}
          <div className="lg:hidden">
            <h3 className="text-xl font-semibold text-[#2F855A] mb-4">Mobile View</h3>
            <div className="space-y-4">
              {crops.map(crop => {
                const breakdown = calculateCropExpenses(crop.name);
                const total = breakdown.Total;
                
                return (
                  <div key={crop._id} className="bg-white rounded-lg shadow p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCropExpansion(crop.name)}
                    >
                      <div className="flex items-center gap-2">
                        {getCropIcon(crop.name)}
                        <span className="font-semibold">{crop.name}</span>
                      </div>
                      <span className="text-[#2F855A] font-bold">₹{total.toLocaleString()}</span>
                    </div>
                    
                    {expandedCrops.has(crop.name) && (
                      <div className="mt-4 space-y-2">
                        {categories.map(category => {
                          const amount = breakdown[category];
                          const percentage = getCategoryPercentage(amount, total);
                          return (
                            <div key={category} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{category}</span>
                              <span className="font-medium">₹{amount.toLocaleString()}</span>
                              <span className="text-gray-500">({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CostAnalysis; 