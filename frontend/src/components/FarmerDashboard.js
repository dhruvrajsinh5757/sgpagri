import React from 'react';
import { FaMoneyBillWave, FaChartPie, FaSeedling, FaUserCircle, FaPlus, FaFileAlt, FaQuoteLeft, FaSun, FaCloudRain, FaUsers, FaBell, FaSignOutAlt, FaHome, FaCog, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GiFarmTractor, GiWheat } from 'react-icons/gi';
import axios from "axios";
import Reports from './Reports';
import IndividualFinanceTracker from './IndividualFinanceTracker';
import CropTracker from './CropTracker';
import CostAnalysis from './CostAnalysis';
import NotificationCenter from './NotificationCenter';

const FarmerDashboard = () => {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState('en');
  const [offline, setOffline] = React.useState(false);
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [expenseForm, setExpenseForm] = React.useState({
    amount: '',
    category: '',
    crop: '',
    date: '',
    note: '',
  });
  const [expenseList, setExpenseList] = React.useState([]);
  const [expenseMsg, setExpenseMsg] = React.useState("");
  const [expenseError, setExpenseError] = React.useState("");
  const [showIncomeModal, setShowIncomeModal] = React.useState(false);
  const [incomeForm, setIncomeForm] = React.useState({
    amount: '',
    category: '',
    crop: '',
    date: '',
    note: '',
  });
  const [incomeList, setIncomeList] = React.useState([]);
  const [incomeMsg, setIncomeMsg] = React.useState("");
  const [incomeError, setIncomeError] = React.useState("");
  const [showReports, setShowReports] = React.useState(false);
  const [showIndividualTracker, setShowIndividualTracker] = React.useState(false);
  const [showCropTracker, setShowCropTracker] = React.useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = React.useState(false);
  const [showYieldPrediction, setShowYieldPrediction] = React.useState(false);
  const [showCropRecommendation, setShowCropRecommendation] = React.useState(false);
  const [alerts, setAlerts] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [loadingAlerts, setLoadingAlerts] = React.useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = React.useState(false);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [dashboardStats, setDashboardStats] = React.useState({
    income: 0,
    expenses: 0,
    budgetUtilizationPercent: null,
    topCrop: { name: null, percent: null },
  });
  const [showAllExpenses, setShowAllExpenses] = React.useState(false);
  const [showAllIncome, setShowAllIncome] = React.useState(false);

  // Fetch transactions when component mounts
  React.useEffect(() => {
    if (userEmail) {
      fetchTransactions();
      fetchAlerts();
      fetchReportStats();
      
      // Check if this is a new user and show profile prompt
      const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';
      if (isFirstLogin) {
        setShowProfilePrompt(true);
        localStorage.setItem('isFirstLogin', 'false'); // Mark as not first login anymore
      }
    }
  }, [userEmail]);

  // Fallback UI if not logged in
  if (!userName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#f7fafc] to-[#e6fffa]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-[#2F855A] mb-4">404 - User Not Found</h1>
          <p className="text-lg text-gray-700 mb-6">You must be logged in to view the dashboard.</p>
          <a href="/login" className="inline-block bg-[#D69E2E] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#B7791F] transition-all duration-200">Go to Login</a>
        </div>
      </div>
    );
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.post('/api/user/all-transactions', { email: userEmail });
      setIncomeList(response.data.income);
      setExpenseList(response.data.expenses);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await axios.get('/api/user/alerts', { 
        params: { email: userEmail } 
      });
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.post('/api/user/reports', {
        email: userEmail,
        filterType: 'month',
      });
      const { totalIncome = 0, totalExpenses = 0, cropSummaries = [] } = response.data || {};

      const totals = cropSummaries.reduce(
        (acc, c) => {
          acc.planned += Number(c.plannedBudget || 0);
          acc.spent += Number(c.totalSpent || 0);
          return acc;
        },
        { planned: 0, spent: 0 }
      );

      const budgetUtilizationPercent = totals.planned > 0
        ? Math.round((totals.spent / totals.planned) * 100)
        : null;

      const usableCrops = cropSummaries.filter(c => Number(c.plannedBudget) > 0);
      let topCrop = { name: null, percent: null };
      if (usableCrops.length > 0) {
        const ranked = usableCrops
          .map(c => ({ name: c.name, percent: (Number(c.totalSpent || 0) / Number(c.plannedBudget)) * 100 }))
          .sort((a, b) => b.percent - a.percent);
        topCrop = { name: ranked[0].name, percent: Math.round(ranked[0].percent) };
      }

      setDashboardStats({
        income: Number(totalIncome) || 0,
        expenses: Number(totalExpenses) || 0,
        budgetUtilizationPercent,
        topCrop,
      });
    } catch (error) {
      console.error('Error fetching monthly report stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      // Refresh all data in parallel
      await Promise.all([
        fetchTransactions(),
        fetchAlerts(),
        fetchReportStats()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isFirstLogin");
    
    // Redirect to login page
    window.location.href = "/login";
  };

  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
  else if (hour >= 18) greeting = 'Good Evening';

  // Motivational quotes
  const quotes = [
    '"The future belongs to those who prepare for it today."',
    '"A good farmer is nothing more nor less than a handy man with a sense of humus."',
    '"Sow the seeds of hard work, and reap the fruits of success."',
    '"Every blade of grass has its angel that bends over it and whispers, Grow, Grow."',
  ];
  const quote = quotes[new Date().getDate() % quotes.length];

  // Real stats from backend
  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const statsCards = [
    {
      title: "This Month's Income",
      value: formatCurrency(dashboardStats.income),
      icon: <FaMoneyBillWave className="text-4xl text-green-500" />,
      gradient: 'from-green-200 to-emerald-100',
    },
    {
      title: "This Month's Expenses",
      value: formatCurrency(dashboardStats.expenses),
      icon: <FaChartPie className="text-4xl text-yellow-500" />,
      gradient: 'from-yellow-200 to-orange-100',
    },
    {
      title: 'Budget Utilization',
      value: dashboardStats.budgetUtilizationPercent == null ? '—' : `${dashboardStats.budgetUtilizationPercent}%`,
      icon: <FaSeedling className="text-4xl text-emerald-500" />,
      gradient: 'from-emerald-200 to-green-100',
    },
    {
      title: dashboardStats.topCrop.name ? `Top Crop: ${dashboardStats.topCrop.name}` : 'Top Crop',
      value: dashboardStats.topCrop.percent == null ? '—' : `${dashboardStats.topCrop.percent}%`,
      icon: <GiWheat className="text-4xl text-yellow-600" />,
      gradient: 'from-yellow-100 to-amber-100',
    },
  ];

  // Dummy weather
  const weather = {
    temp: '32°C',
    condition: 'Sunny',
    icon: <FaSun className="text-3xl text-yellow-400" />,
  };

  // Add Expense handler
  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseMsg("");
    setExpenseError("");
    try {
      const res = await axios.post('/api/user/expense', {
        email: userEmail,
        ...expenseForm,
      });
      setExpenseMsg("Expense added successfully!");
      setExpenseList([res.data.expense, ...expenseList]);
      setShowExpenseModal(false);
      setExpenseForm({ amount: '', category: '', crop: '', date: '', note: '' });
    } catch (err) {
      setExpenseError(err.response?.data?.message || "Failed to add expense");
    }
  };

  // Add Income handler
  const handleIncomeChange = (e) => {
    setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  };
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setIncomeMsg("");
    setIncomeError("");
    try {
      const res = await axios.post('/api/user/income', {
        email: userEmail,
        ...incomeForm,
      });
      setIncomeMsg("Income added successfully!");
      setIncomeList([res.data.income, ...incomeList]);
      setShowIncomeModal(false);
      setIncomeForm({ amount: '', category: '', crop: '', date: '', note: '' });
    } catch (err) {
      setIncomeError(err.response?.data?.message || "Failed to add income");
    }
  };

  // Notification handlers
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/read`, { email: userEmail });
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/dismiss`, { email: userEmail });
      setAlerts(alerts.filter(alert => alert._id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Helper function to get alert type styling
  const getAlertTypeStyle = (alertType) => {
    switch (alertType) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'over-budget':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'custom-threshold':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Helper function to get alert icon
  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'warning':
        return '🟡';
      case 'over-budget':
        return '🔴';
      case 'custom-threshold':
        return '🟢';
      default:
        return 'ℹ️';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f7fafc] to-[#e6fffa] flex flex-col">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#2F855A]/10 via-white to-[#D69E2E]/10 py-10 md:py-16 px-4 md:px-0 border-b border-green-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Greeting & Avatar */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              <FaUserCircle className="text-6xl text-[#2F855A] mr-3 drop-shadow-lg" />
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2F855A] mb-1 animate-fade-in">
                  {greeting}, {userName}!
                </h1>
                <p className="text-lg text-gray-700 font-medium italic animate-fade-in-slow">
                  Here's your farm's financial health at a glance.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D69E2E]/20 text-[#D69E2E] font-semibold text-sm">
                <GiFarmTractor className="mr-2" /> Farmer Dashboard
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2F855A]/10 text-[#2F855A] font-semibold text-sm">
                {weather.icon} {weather.temp} {weather.condition}
              </span>
            </div>
          </div>
          {/* Right: Motivational Banner */}
          <div className="flex-1 flex flex-col items-center md:items-end mt-8 md:mt-0">
            <div className="bg-gradient-to-br from-[#D69E2E]/80 to-[#2F855A]/80 rounded-2xl shadow-xl p-6 max-w-md w-full animate-fade-in-slow relative">
              <FaQuoteLeft className="text-3xl text-white mb-2" />
              <p className="text-lg text-white font-semibold italic mb-2">{quote}</p>
              <div className="text-right text-white/80 text-sm">AgriBudget</div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Banner for New Users */}
      {localStorage.getItem('isFirstLogin') === 'true' && (
        <div className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 py-4 px-4 animate-slide-in-top">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🎉</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-800">Welcome to AgriBudget!</h3>
                  <p className="text-xs text-green-600">Your account has been created successfully. Start managing your farm finances today!</p>
                </div>
              </div>
              <button
                onClick={() => localStorage.setItem('isFirstLogin', 'false')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Navigation Buttons - Top Right Corner */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-3">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm text-[#2F855A] p-3 rounded-full shadow-lg hover:bg-[#2F855A] hover:text-white transition-all duration-300 border border-[#2F855A]/20 hover:scale-110"
          title="Home"
          aria-label="Go to Home"
        >
          <FaHome className="text-xl" />
        </button>
        
        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings')}
          className="bg-white/90 backdrop-blur-sm text-[#2F855A] p-3 rounded-full shadow-lg hover:bg-[#2F855A] hover:text-white transition-all duration-300 border border-[#2F855A]/20 hover:scale-110"
          title="Settings"
          aria-label="Open Settings"
        >
          <FaCog className="text-xl" />
        </button>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-white/90 backdrop-blur-sm text-red-500 p-3 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 hover:scale-110"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
        
        {/* Single Notification Center (includes alerts) */}
        <NotificationCenter userRole="farmer" userId={userEmail} userEmail={userEmail} />
      </div>

      {/* Stats Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 px-4">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl shadow-lg p-6 flex flex-col items-center bg-gradient-to-br ${stat.gradient} hover:scale-105 hover:shadow-2xl transition-all duration-200`}
          >
            {stat.icon}
            <div className="text-2xl font-bold text-[#2F855A] mt-2">{statsLoading ? '…' : stat.value}</div>
            <div className="text-md text-gray-700 mt-1 text-center">{stat.title}</div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 mb-10 px-4">
        <button className="flex items-center bg-[#2F855A] text-white px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-[#D69E2E] hover:text-[#2F855A] transition-colors" onClick={() => setShowExpenseModal(true)}>
          <FaPlus className="mr-2" /> Add Expense
        </button>
        <button className="flex items-center bg-[#D69E2E] text-white px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-[#2F855A] hover:text-[#D69E2E] transition-colors" onClick={() => setShowIncomeModal(true)}>
          <FaPlus className="mr-2" /> Add Income
        </button>
        <button className="flex items-center bg-white text-[#2F855A] px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-[#D69E2E]/20 hover:text-[#D69E2E] transition-colors border border-[#2F855A]/20" onClick={() => setShowReports(true)}>
          <FaFileAlt className="mr-2" /> View Reports
        </button>
        <a href="/marketplace" className="flex items-center bg-white text-[#2F855A] px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-[#D69E2E]/20 hover:text-[#D69E2E] transition-colors border border-[#2F855A]/20">
          <FaShoppingCart className="mr-2" /> Marketplace
        </a>
        <a href="/my-orders" className="flex items-center bg-white text-[#2F855A] px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-[#D69E2E]/20 hover:text-[#D69E2E] transition-colors border border-[#2F855A]/20">
          <FaShoppingCart className="mr-2" /> My Orders
        </a>
        {/* Feature Icon: Crop-wise Tracking */}
        <button
          className="flex items-center bg-white text-[#2F855A] p-3 rounded-full shadow hover:bg-[#2F855A] hover:text-white transition-colors border border-[#2F855A]/20"
          title="Crop-wise Tracking"
          onClick={() => setShowCropTracker(true)}
        >
          <GiWheat size={20} />
        </button>
        {/* Feature Icon: Crop-wise Cost Analysis */}
        <button
          className="flex items-center bg-white text-[#2F855A] p-3 rounded-full shadow hover:bg-[#2F855A] hover:text-white transition-colors border border-[#2F855A]/20"
          title="Crop-wise Cost Analysis"
          onClick={() => setShowCostAnalysis(true)}
        >
          <div className="relative">
            <GiWheat size={16} className="text-[#D69E2E]" />
            <span className="absolute -top-1 -right-1 text-[#2F855A] font-bold text-xs">₹</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#8B4513] rounded-full opacity-80"></div>
          </div>
        </button>
        {/* Feature Icon: Individual Finance Tracker */}
        <button
          className="flex items-center bg-white text-[#2F855A] p-3 rounded-full shadow hover:bg-[#2F855A] hover:text-white transition-colors border border-[#2F855A]/20"
          title="Individual Finance Tracker"
          onClick={() => setShowIndividualTracker(true)}
        >
          <FaUsers size={20} />
        </button>
        {/* Crop Yield Prediction */}
        <button
          className="flex items-center bg-white text-[#2F855A] px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-green-100 hover:text-green-700 transition-colors border border-green-200"
          onClick={() => setShowYieldPrediction(true)}
        >
          <FaSeedling className="mr-2" /> Crop Yield Prediction
        </button>
        {/* Crop Recommendation */}
        <button
          className="flex items-center bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-lg shadow hover:bg-blue-100 hover:text-blue-900 transition-colors border border-blue-200"
          onClick={() => setShowCropRecommendation(true)}
        >
          <FaSeedling className="mr-2" /> Crop Recommendation
        </button>
        <button className="flex items-center bg-white text-[#2F855A] px-4 py-3 rounded-xl font-semibold text-sm shadow hover:bg-[#2F855A] hover:text-white transition-colors border border-[#2F855A]/20" onClick={refreshAllData}>
          Refresh Data
        </button>
      </section>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowExpenseModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">Add Expense</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <input type="number" name="amount" value={expenseForm.amount} onChange={handleExpenseChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="Enter amount" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <input type="text" name="category" value={expenseForm.category} onChange={handleExpenseChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="e.g. Fertilizer, Labor" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop</label>
                <input type="text" name="crop" value={expenseForm.crop} onChange={handleExpenseChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="e.g. Wheat, Rice" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" name="date" value={expenseForm.date} onChange={handleExpenseChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
                <input type="text" name="note" value={expenseForm.note} onChange={handleExpenseChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="Optional note" />
              </div>
              <button type="submit" className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#D69E2E] transition-all duration-200">Add Expense</button>
              {expenseError && <div className="text-red-600 font-semibold text-center mt-2">{expenseError}</div>}
              {expenseMsg && <div className="text-green-600 font-semibold text-center mt-2">{expenseMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowIncomeModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">Add Income</h2>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <input type="number" name="amount" value={incomeForm.amount} onChange={handleIncomeChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="Enter amount" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <input type="text" name="category" value={incomeForm.category} onChange={handleIncomeChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="e.g. Crop Sale, Subsidy" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop</label>
                <input type="text" name="crop" value={incomeForm.crop} onChange={handleIncomeChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="e.g. Wheat, Rice" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" name="date" value={incomeForm.date} onChange={handleIncomeChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
                <input type="text" name="note" value={incomeForm.note} onChange={handleIncomeChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg" placeholder="Optional note" />
              </div>
              <button type="submit" className="w-full bg-[#D69E2E] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#2F855A] transition-all duration-200">Add Income</button>
              {incomeError && <div className="text-red-600 font-semibold text-center mt-2">{incomeError}</div>}
              {incomeMsg && <div className="text-green-600 font-semibold text-center mt-2">{incomeMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Floating action icon for Individual Finance Tracker */}
      <button
        className="fixed bottom-20 right-6 z-40 bg-[#2F855A] text-white p-4 rounded-full shadow-xl hover:bg-[#246a46] focus:ring-4 focus:ring-green-300"
        title="Open Individual Finance Tracker"
        onClick={() => setShowIndividualTracker(true)}
      >
        <FaUsers size={22} />
      </button>

      {/* Expense List */}
      <section className="max-w-6xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2F855A] flex items-center"><FaChartPie className="mr-2 text-[#D69E2E]" /> Recent Expenses</h2>
          {expenseList.length > 6 && (
            <button
              className="text-sm text-[#2F855A] hover:text-[#D69E2E] font-semibold"
              onClick={() => setShowAllExpenses(!showAllExpenses)}
            >
              {showAllExpenses ? 'Show Top 6' : 'View All'}
            </button>
          )}
        </div>
        {expenseList.length === 0 ? (
          <div className="text-gray-500 text-center">No expenses added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Crop</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Note</th>
                </tr>
              </thead>
              <tbody>
                {(showAllExpenses ? expenseList : expenseList.slice(0, 6)).map((exp, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-4 border-b">₹{exp.amount}</td>
                    <td className="py-2 px-4 border-b">{exp.category}</td>
                    <td className="py-2 px-4 border-b">{exp.crop}</td>
                    <td className="py-2 px-4 border-b">{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-4 border-b">{exp.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Income List */}
      <section className="max-w-6xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2F855A] flex items-center"><FaMoneyBillWave className="mr-2 text-[#D69E2E]" /> Recent Incomes</h2>
          {incomeList.length > 0 && (
            <button
              className="text-sm text-[#2F855A] hover:text-[#D69E2E] font-semibold"
              onClick={() => setShowAllIncome(!showAllIncome)}
            >
              {showAllIncome ? 'Show Top 6' : 'View All'}
            </button>
          )}
        </div>
        {incomeList.length === 0 ? (
          <div className="text-gray-500 text-center">No incomes added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Crop</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Note</th>
                </tr>
              </thead>
              <tbody>
                {(showAllIncome ? incomeList : incomeList.slice(0, 6)).map((inc, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-4 border-b">₹{inc.amount}</td>
                    <td className="py-2 px-4 border-b">{inc.category}</td>
                    <td className="py-2 px-4 border-b">{inc.crop}</td>
                    <td className="py-2 px-4 border-b">{inc.date ? new Date(inc.date).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-4 border-b">{inc.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analytics Placeholders */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[220px]">
          <h2 className="text-xl font-bold text-[#2F855A] mb-4 flex items-center"><FaMoneyBillWave className="mr-2 text-[#D69E2E]" /> Income Trend</h2>
          {incomeList.length > 0 ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{incomeList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-xs text-gray-500 mt-1">{incomeList.length} transactions</div>
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-r from-[#2F855A]/10 to-[#D69E2E]/10 rounded-lg flex items-center justify-center text-gray-400">
              <span>No income data yet</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[220px]">
          <h2 className="text-xl font-bold text-[#2F855A] mb-4 flex items-center"><FaChartPie className="mr-2 text-[#D69E2E]" /> Expense Breakdown</h2>
          {expenseList.length > 0 ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                ₹{expenseList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-gray-500 mt-1">{expenseList.length} transactions</div>
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-r from-[#D69E2E]/10 to-[#2F855A]/10 rounded-lg flex items-center justify-center text-gray-400">
              <span>No expense data yet</span>
            </div>
          )}
        </div>
      </section>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h4 className="font-bold text-gray-800 mb-3">Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.length === 0 && expenseList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-sm font-medium">No transactions yet</p>
                      <p className="text-xs text-gray-400">Start by adding your first income or expense</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Income Transactions */}
                  {incomeList.map((income, index) => (
                    <tr key={`income-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Income</span>
                      </td>
                      <td className="py-2 font-semibold">₹{income.amount.toLocaleString()}</td>
                      <td className="py-2">{income.category}</td>
                      <td className="py-2">{income.note || '-'}</td>
                    </tr>
                  ))}
                  {/* Expense Transactions */}
                  {expenseList.map((expense, index) => (
                    <tr key={`expense-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expense</span>
                      </td>
                      <td className="py-2 font-semibold">₹{expense.amount.toLocaleString()}</td>
                      <td className="py-2">{expense.category}</td>
                      <td className="py-2">{expense.note || '-'}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="w-full bg-[#2F855A] text-white py-4 px-6 flex flex-col md:flex-row items-center justify-between shadow-inner mt-auto sticky bottom-0 z-20">
        <div className="flex space-x-4 mb-2 md:mb-0">
          <a href="#privacy" className="hover:underline">Privacy</a>
          <a href="#help" className="hover:underline">Help</a>
          <a href="#feedback" className="hover:underline">Feedback</a>
        </div>
        <div className="text-sm">&copy; {new Date().getFullYear()} AgriBudget. Empowering Farmers.</div>
      </footer>

      {/* Reports Modal */}
      {showReports && (
        <Reports onClose={() => setShowReports(false)} />
      )}
      {/* Crop Tracker Modal */}
      {showCropTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCropTracker(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CropTracker />
          </div>
        </div>
      )}
      {/* Cost Analysis Modal */}
      {showCostAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-7xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCostAnalysis(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CostAnalysis />
          </div>
        </div>
      )}
      {/* Individual Finance Tracker Modal */}
      {showIndividualTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowIndividualTracker(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <IndividualFinanceTracker />
          </div>
        </div>
      )}

      {/* Crop Yield Prediction Modal */}
      {showYieldPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowYieldPrediction(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* CropYieldPrediction component */}
            {React.createElement(require('./CropYieldPrediction').default)}
          </div>
        </div>
      )}

      {/* Crop Recommendation Modal */}
      {showCropRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCropRecommendation(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* CropRecommendation component */}
            {React.createElement(require('./CropRecommendation').default)}
          </div>
        </div>
      )}

      {/* Profile Update Prompt Modal */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-bounce-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FaUserCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to AgriBudget!</h3>
              <p className="text-gray-600 mb-6">
                To provide you with the best experience, please update your profile information including:
              </p>
              <div className="text-left space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Contact details and location
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Farm size and crop preferences
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Financial goals and budget settings
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProfilePrompt(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowProfilePrompt(false);
                    // You can add navigation to a profile settings page here
                    // navigate('/profile-settings');
                  }}
                  className="flex-1 bg-[#2F855A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1F5F3F] transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard; 