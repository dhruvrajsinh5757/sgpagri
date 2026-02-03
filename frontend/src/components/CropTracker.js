import React from 'react';
import axios from 'axios';

const categories = [
  'Seeds', 'Fertilizer', 'Pesticide', 'Labor', 'Irrigation', 'Other'
];

const CropTracker = () => {
  const userEmail = localStorage.getItem('userEmail');

  const [crops, setCrops] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [showAddCrop, setShowAddCrop] = React.useState(false);
  const [cropForm, setCropForm] = React.useState({ name: '', startDate: '', expectedHarvestDate: '', plannedBudget: '' });
  const [cropMsg, setCropMsg] = React.useState('');

  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [expenseForm, setExpenseForm] = React.useState({ crop: '', category: categories[0], amount: '', date: '', note: '' });
  const [expenseMsg, setExpenseMsg] = React.useState('');
  const [expenseError, setExpenseError] = React.useState('');
  const [showThresholdModal, setShowThresholdModal] = React.useState(false);
  const [selectedCrop, setSelectedCrop] = React.useState(null);
  const [thresholdForm, setThresholdForm] = React.useState({ threshold: '' });
  const [thresholdMsg, setThresholdMsg] = React.useState('');

  const [summaries, setSummaries] = React.useState([]);
  const [totals, setTotals] = React.useState({ plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
  const [expandedCrop, setExpandedCrop] = React.useState('');
  const [cropExpenses, setCropExpenses] = React.useState([]);

  React.useEffect(() => {
    fetchCrops();
    fetchSummary();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/user/crop', { params: { email: userEmail } });
      setCrops(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/api/user/crop/summary', { params: { email: userEmail } });
      setSummaries(res.data.summaries || []);
      setTotals(res.data.totals || { plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
    } catch (e) {
      // silent
    }
  };

  const toggleCropExpand = async (name) => {
    if (expandedCrop === name) {
      setExpandedCrop('');
      setCropExpenses([]);
      return;
    }
    setExpandedCrop(name);
    try {
      const res = await axios.get('/api/user/crop/expenses', { params: { email: userEmail, crop: name } });
      setCropExpenses(res.data || []);
    } catch (e) {
      setCropExpenses([]);
    }
  };

  const handleCropChange = (e) => setCropForm({ ...cropForm, [e.target.name]: e.target.value });
  const handleAddCrop = async (e) => {
    e.preventDefault();
    setCropMsg('');
    try {
      await axios.post('/api/user/crop', { email: userEmail, ...cropForm });
      setCropMsg('Crop added');
      setShowAddCrop(false);
      setCropForm({ name: '', startDate: '', expectedHarvestDate: '', plannedBudget: '' });
      fetchCrops();
      fetchSummary();
    } catch (e) {
      setCropMsg(e.response?.data?.message || 'Failed to add crop');
    }
  };

  const handleExpenseChange = (e) => setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setExpenseMsg('');
    setExpenseError('');
    try {
      await axios.post('/api/user/expense', { email: userEmail, ...expenseForm });
      setExpenseMsg('Expense added');
      setShowAddExpense(false);
      setExpenseForm({ crop: '', category: categories[0], amount: '', date: '', note: '' });
      fetchSummary();
    } catch (e) {
      setExpenseError(e.response?.data?.message || 'Failed to add expense');
    }
  };

  const openThresholdModal = (crop) => {
    setSelectedCrop(crop);
    setThresholdForm({ threshold: '' });
    setThresholdMsg('');
    setShowThresholdModal(true);
  };

  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    setThresholdMsg('');
    try {
      const res = await axios.post(`/api/user/crop/${selectedCrop._id}/threshold`, { 
        email: userEmail, 
        threshold: Number(thresholdForm.threshold) 
      });
      setThresholdMsg(`Custom threshold of ${thresholdForm.threshold}% set for ${selectedCrop.name}`);
      setThresholdForm({ threshold: '' });
      setTimeout(() => setShowThresholdModal(false), 2000);
    } catch (e) {
      setThresholdMsg(e.response?.data?.message || 'Failed to set threshold');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-[#2F855A] mb-4">Crop-wise Tracking</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button className="bg-[#2F855A] text-white px-4 py-2 rounded" onClick={() => setShowAddCrop(true)}>Add Crop</button>
        <button className="bg-[#D69E2E] text-white px-4 py-2 rounded" onClick={() => setShowAddExpense(true)}>Add Expense</button>
        <button className="bg-white border border-[#2F855A]/30 text-[#2F855A] px-4 py-2 rounded" onClick={fetchSummary}>Show Summary</button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-[#2F855A] mb-2">Your Crops</h3>
            {crops.length === 0 ? (
              <div className="text-gray-500">No crops added yet.</div>
            ) : (
              <ul className="space-y-2">
                {crops.map((c) => (
                  <li key={c._id} className="border rounded p-2">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-gray-600">Start: {new Date(c.startDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">Harvest: {new Date(c.expectedHarvestDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">Planned Budget: ₹{c.plannedBudget}</div>
                    <button
                      onClick={() => openThresholdModal(c)}
                      className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Set Alert Threshold
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-[#2F855A] mb-2">Budget Summary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Planned</div>
                <div className="text-lg font-bold">₹{totals.plannedBudget?.toLocaleString?.() ?? totals.plannedBudget}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Spent</div>
                <div className="text-lg font-bold">₹{totals.totalSpent?.toLocaleString?.() ?? totals.totalSpent}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Remaining</div>
                <div className="text-lg font-bold">₹{totals.remainingBudget?.toLocaleString?.() ?? totals.remainingBudget}</div>
              </div>
            </div>
            <div className="mt-3">
              {summaries.length === 0 ? (
                <div className="text-gray-500 text-sm">No summary yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Crop</th>
                      <th className="text-right py-1">Planned</th>
                      <th className="text-right py-1">Spent</th>
                      <th className="text-right py-1">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((s, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleCropExpand(s.name)}>
                          <td className="py-1 font-medium">{s.name}</td>
                          <td className="py-1 text-right">₹{s.plannedBudget}</td>
                          <td className="py-1 text-right">₹{s.totalSpent}</td>
                          <td className="py-1 text-right">₹{s.remainingBudget}</td>
                        </tr>
                        {expandedCrop === s.name && (
                          <tr>
                            <td colSpan={4} className="py-2">
                              {cropExpenses.length === 0 ? (
                                <div className="text-gray-500 text-xs">No expenses yet for this crop.</div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-1">Date</th>
                                        <th className="text-left py-1">Category</th>
                                        <th className="text-right py-1">Amount</th>
                                        <th className="text-left py-1">Note</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cropExpenses.map((e) => (
                                        <tr key={e._id} className="border-b">
                                          <td className="py-1">{e.date ? new Date(e.date).toLocaleDateString() : ''}</td>
                                          <td className="py-1">{e.category}</td>
                                          <td className="py-1 text-right">₹{e.amount}</td>
                                          <td className="py-1">{e.note}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-gray-500 text-2xl" onClick={() => setShowAddCrop(false)}>&times;</button>
            <h3 className="text-xl font-bold text-[#2F855A] mb-3">Add Crop</h3>
            <form onSubmit={handleAddCrop} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Crop Name</label>
                <input className="w-full border rounded px-3 py-2" name="name" value={cropForm.name} onChange={handleCropChange} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Start Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" name="startDate" value={cropForm.startDate} onChange={handleCropChange} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Expected Harvest Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" name="expectedHarvestDate" value={cropForm.expectedHarvestDate} onChange={handleCropChange} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Planned Budget</label>
                <input type="number" className="w-full border rounded px-3 py-2" name="plannedBudget" value={cropForm.plannedBudget} onChange={handleCropChange} required />
              </div>
              <button className="w-full bg-[#2F855A] text-white py-2 rounded">Save</button>
              {cropMsg && <div className="text-center text-sm mt-1">{cropMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-gray-500 text-2xl" onClick={() => setShowAddExpense(false)}>&times;</button>
            <h3 className="text-xl font-bold text-[#2F855A] mb-3">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Crop</label>
                <select className="w-full border rounded px-3 py-2" name="crop" value={expenseForm.crop} onChange={handleExpenseChange} required>
                  <option value="">Select crop</option>
                  {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select className="w-full border rounded px-3 py-2" name="category" value={expenseForm.category} onChange={handleExpenseChange}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Amount</label>
                <input type="number" className="w-full border rounded px-3 py-2" name="amount" value={expenseForm.amount} onChange={handleExpenseChange} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" name="date" value={expenseForm.date} onChange={handleExpenseChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Note (optional)</label>
                <input className="w-full border rounded px-3 py-2" name="note" value={expenseForm.note} onChange={handleExpenseChange} />
              </div>
              <button className="w-full bg-[#2F855A] text-white py-2 rounded">Save</button>
              {expenseError && <div className="text-center text-sm text-red-600 mt-1">{expenseError}</div>}
              {expenseMsg && <div className="text-center text-sm mt-1">{expenseMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Custom Threshold Modal */}
      {showThresholdModal && selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-gray-500 text-2xl" onClick={() => setShowThresholdModal(false)}>&times;</button>
            <h3 className="text-xl font-bold text-[#2F855A] mb-3">Set Alert Threshold</h3>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedCrop.name}</strong><br />
                Budget: ₹{selectedCrop.plannedBudget.toLocaleString()}
              </p>
            </div>
            <form onSubmit={handleThresholdSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Alert Threshold (%)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="200" 
                  className="w-full border rounded px-3 py-2" 
                  name="threshold" 
                  value={thresholdForm.threshold} 
                  onChange={(e) => setThresholdForm({ threshold: e.target.value })} 
                  placeholder="e.g., 80 for 80%"
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll get notified when budget usage reaches this percentage
                </p>
              </div>
              <button className="w-full bg-[#2F855A] text-white py-2 rounded">Set Threshold</button>
              {thresholdMsg && (
                <div className={`text-center text-sm mt-1 ${thresholdMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {thresholdMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropTracker;

