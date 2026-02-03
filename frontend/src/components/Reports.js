import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartPie, FaChartBar, FaFilter, FaDownload, FaCalendarAlt, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Reports = ({ onClose }) => {
  const [filterType, setFilterType] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (userEmail) {
      fetchReportData();
    }
  }, [filterType, startDate, endDate, selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/user/reports', {
        email: userEmail,
        filterType,
        startDate,
        endDate,
        selectedMonth,
        selectedYear,
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'month':
        return 'Current Month';
      case 'year':
        return 'Current Year';
      case 'custom':
        return 'Custom Range';
      default:
        return 'Current Month';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Chart configurations
  const lineChartData = {
    labels: reportData ? Object.keys(reportData.incomeByDate).map(date => formatDate(date)) : [],
    datasets: [
      {
        label: 'Income',
        data: reportData ? Object.values(reportData.incomeByDate) : [],
        borderColor: '#2F855A',
        backgroundColor: 'rgba(47, 133, 90, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: reportData ? Object.values(reportData.expensesByDate) : [],
        borderColor: '#D69E2E',
        backgroundColor: 'rgba(214, 158, 46, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: reportData ? Object.keys(reportData.expensesByCategory) : [],
    datasets: [
      {
        data: reportData ? Object.values(reportData.expensesByCategory) : [],
        backgroundColor: [
          '#2F855A',
          '#D69E2E',
          '#38B2AC',
          '#F56565',
          '#9F7AEA',
          '#ED8936',
          '#48BB78',
          '#4299E1',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barChartData = {
    labels: reportData ? Object.keys(reportData.incomeByCategory) : [],
    datasets: [
      {
        label: 'Income by Category',
        data: reportData ? Object.values(reportData.incomeByCategory) : [],
        backgroundColor: '#2F855A',
        borderColor: '#2F855A',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Financial Report - ${getFilterLabel()}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Expense Breakdown by Category',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (!userEmail) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in to view reports.</p>
          <button
            onClick={onClose}
            className="bg-[#2F855A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1F5F3F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2F855A] to-[#D69E2E] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Financial Reports</h1>
              <p className="text-white/80 mt-1">Comprehensive analysis of your farm finances</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-[#2F855A]" />
              <span className="font-semibold text-gray-700">Filter:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
            >
              <option value="month">Current Month</option>
              <option value="year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {(filterType === 'month' || filterType === 'year') && (
              <>
                {filterType === 'month' && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  >
                    {[...Array(12)].map((_, idx) => (
                      <option key={idx + 1} value={String(idx + 1)}>{new Date(0, idx).toLocaleString('en', { month: 'long' })}</option>
                    ))}
                  </select>
                )}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                    <option key={yr} value={String(yr)}>{yr}</option>
                  ))}
                </select>
              </>
            )}

            {filterType === 'custom' && (
              <>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-[#2F855A]" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-[#2F855A]" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent"
                  />
                </div>
              </>
            )}

            <button
              onClick={fetchReportData}
              disabled={loading}
              className="bg-[#2F855A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1F5F3F] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {['overview', 'charts', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-[#2F855A] border-b-2 border-[#2F855A]'
                  : 'text-gray-600 hover:text-[#2F855A]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F855A]"></div>
            </div>
          ) : reportData ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total Income</p>
                          <p className="text-3xl font-bold">{formatCurrency(reportData.totalIncome)}</p>
                        </div>
                        <FaMoneyBillWave className="text-4xl text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100">Total Expenses</p>
                          <p className="text-3xl font-bold">{formatCurrency(reportData.totalExpenses)}</p>
                        </div>
                        <FaMoneyBillWave className="text-4xl text-yellow-200" />
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-2xl text-white ${
                      reportData.netProfit >= 0 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="opacity-90">Net Profit</p>
                          <p className="text-3xl font-bold">{formatCurrency(reportData.netProfit)}</p>
                        </div>
                        <FaMoneyBillWave className="text-4xl opacity-70" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses Trend</h3>
                      <div className="h-64">
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown</h3>
                      <div className="h-64">
                        <Pie data={pieChartData} options={pieChartOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Tab */}
              {activeTab === 'charts' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Income by Category</h3>
                    <div className="h-80">
                      <Bar data={barChartData} options={chartOptions} />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Trend Analysis</h3>
                    <div className="h-80">
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Income Transactions */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-green-600">Income Transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold">Date</th>
                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                            <th className="text-left py-3 px-4 font-semibold">Crop</th>
                            <th className="text-left py-3 px-4 font-semibold">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.income.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">{formatDate(item.date)}</td>
                              <td className="py-3 px-4">{item.category}</td>
                              <td className="py-3 px-4">{item.crop || '-'}</td>
                              <td className="py-3 px-4 font-semibold text-green-600">{formatCurrency(item.amount)}</td>
                              <td className="py-3 px-4">{item.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Expense Transactions */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-yellow-600">Expense Transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold">Date</th>
                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                            <th className="text-left py-3 px-4 font-semibold">Crop</th>
                            <th className="text-left py-3 px-4 font-semibold">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.expenses.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">{formatDate(item.date)}</td>
                              <td className="py-3 px-4">{item.category}</td>
                              <td className="py-3 px-4">{item.crop || '-'}</td>
                              <td className="py-3 px-4 font-semibold text-yellow-600">{formatCurrency(item.amount)}</td>
                              <td className="py-3 px-4">{item.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No data available. Please select a filter and refresh.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Report generated for: {getFilterLabel()}
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-[#D69E2E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#B7791F] transition-colors"
          >
            <FaDownload />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports; 