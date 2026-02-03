import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaPlus, FaFilter, FaFileCsv, FaFilePdf, FaRupeeSign, FaUser, FaCalendarAlt, FaTags, FaSearch } from 'react-icons/fa';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const categories = ['Seeds', 'Labor', 'Equipment', 'Fertilizer', 'Transport', 'Sales', 'Other'];

const IndividualFinanceTracker = () => {
  const userEmail = localStorage.getItem('userEmail');
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', role: '', photo: '' });
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', date: '', description: '', crop: '', project: '' });
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [personQuery, setPersonQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState([]);

  useEffect(() => {
    if (userEmail) {
      fetchPeople();
    }
  }, [userEmail]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedPerson, month, categoryFilter]);

  useEffect(() => {
    computeComparison();
  }, [people, month, categoryFilter]);

  const filteredPeople = useMemo(() => {
    const q = personQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter(p => `${p.name} ${p.role || ''}`.toLowerCase().includes(q));
  }, [people, personQuery]);

  const fetchPeople = async () => {
    try {
      const res = await axios.get('/api/user/person', { params: { email: userEmail } });
      setPeople(res.data);
      if (res.data.length && !selectedPerson) setSelectedPerson(res.data[0]._id);
    } catch (e) {
      console.error('Failed to load people', e);
    }
  };

  const addPerson = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/user/person', { email: userEmail, ...newPerson });
      setPeople([res.data.person, ...people]);
      setSelectedPerson(res.data.person._id);
      setShowPersonModal(false);
      setNewPerson({ name: '', role: '', photo: '' });
    } catch (e) {
      console.error('Failed to add person', e);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/user/transaction', {
        email: userEmail,
        personId: selectedPerson,
        ...form,
      });
      setForm({ type: 'expense', amount: '', category: '', date: '', description: '', crop: '', project: '' });
      await fetchTransactions();
    } catch (e) {
      console.error('Failed to add transaction', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!userEmail || !selectedPerson) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/user/transactions', {
        params: { email: userEmail, person_id: selectedPerson, month, category: categoryFilter || undefined },
      });
      setTransactions(res.data);
    } catch (e) {
      console.error('Failed to load transactions', e);
    } finally {
      setLoading(false);
    }
  };

  const computeComparison = async () => {
    if (!userEmail || people.length === 0) return;
    try {
      const results = await Promise.all(
        people.map(async (p) => {
          const res = await axios.get('/api/user/transactions', {
            params: { email: userEmail, person_id: p._id, month, category: categoryFilter || undefined },
          });
          const income = res.data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const expense = res.data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          return { name: p.name, income, expense, net: income - expense };
        })
      );
      setComparison(results);
    } catch (e) {
      // non-fatal
    }
  };

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  const byCategory = useMemo(() => {
    const agg = {};
    transactions.forEach(t => {
      agg[t.category] = (agg[t.category] || 0) + t.amount * (t.type === 'expense' ? -1 : 1);
    });
    return agg;
  }, [transactions]);

  const byDate = useMemo(() => {
    const aggIncome = {};
    const aggExpense = {};
    transactions.forEach(t => {
      const key = new Date(t.date).toISOString().slice(0, 10);
      if (t.type === 'income') aggIncome[key] = (aggIncome[key] || 0) + t.amount;
      else aggExpense[key] = (aggExpense[key] || 0) + t.amount;
    });
    return { income: aggIncome, expense: aggExpense };
  }, [transactions]);

  const currency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Amount', 'Category', 'Description', 'Crop', 'Project', 'Person'],
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type,
        t.amount,
        t.category,
        t.description || '',
        t.crop || '',
        t.project || '',
        t.person?.name || '',
      ]),
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'individual-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const months = [...Array(12)].map((_, i) => ({ value: String(i + 1).padStart(2, '0'), label: new Date(0, i).toLocaleString('en', { month: 'long' }) }));
  const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));

  const lineData = {
    labels: Array.from(new Set([...Object.keys(byDate.income), ...Object.keys(byDate.expense)])).sort(),
    datasets: [
      { label: 'Income', data: Object.values(byDate.income), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', tension: 0.4, fill: true },
      { label: 'Expense', data: Object.values(byDate.expense), borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.1)', tension: 0.4, fill: true },
    ],
  };

  const pieData = {
    labels: Object.keys(byCategory),
    datasets: [
      { data: Object.values(byCategory).map(v => Math.abs(v)), backgroundColor: ['#16a34a', '#d97706', '#06b6d4', '#dc2626', '#9333ea', '#f59e0b', '#22c55e', '#3b82f6'] },
    ],
  };

  const barData = {
    labels: ['Income', 'Expense', 'Net'],
    datasets: [
      { label: 'Amount', data: [totals.income, totals.expense, totals.net], backgroundColor: ['#16a34a', '#dc2626', totals.net >= 0 ? '#2563eb' : '#dc2626'] },
    ],
  };

  const compareData = {
    labels: comparison.map(c => c.name),
    datasets: [
      { label: 'Income', data: comparison.map(c => c.income), backgroundColor: '#16a34a' },
      { label: 'Expense', data: comparison.map(c => c.expense), backgroundColor: '#dc2626' },
      { label: 'Net', data: comparison.map(c => c.net), backgroundColor: '#2563eb' },
    ],
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#2F855A]">Individual Finance Tracker</h2>
        <button className="inline-flex items-center bg-[#D69E2E] text-white px-4 py-2 rounded-lg shadow hover:bg-[#B7791F]" onClick={() => setShowPersonModal(true)}>
          <FaUserPlus className="mr-2" /> Add Person
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <FaUser className="text-[#2F855A]" />
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input value={personQuery} onChange={e => setPersonQuery(e.target.value)} placeholder="Search person" className="pl-9 pr-3 py-2 border rounded-lg" />
          </div>
          <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)} className="px-3 py-2 border rounded-lg">
            {filteredPeople.map(p => (
              <option key={p._id} value={p._id}>{p.name} {p.role ? `(${p.role})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-[#2F855A]" />
          <select value={month.split('-')[1]} onChange={e => setMonth(`${month.split('-')[0]}-${e.target.value}`)} className="px-3 py-2 border rounded-lg">
            {months.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
          <select value={month.split('-')[0]} onChange={e => setMonth(`${e.target.value}-${month.split('-')[1]}`)} className="px-3 py-2 border rounded-lg">
            {years.map(y => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FaTags className="text-[#2F855A]" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {categories.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchTransactions} className="px-4 py-2 border rounded-lg hover:bg-gray-50 inline-flex items-center"><FaFilter className="mr-2"/>Apply</button>
          <button onClick={exportCSV} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 inline-flex items-center"><FaFileCsv className="mr-2"/>CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 inline-flex items-center"><FaFilePdf className="mr-2"/>PDF</button>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add Entry</h3>
        <form onSubmit={addTransaction} className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <select className="border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input className="border rounded-lg px-3 py-2" type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
          <select className="border rounded-lg px-3 py-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
            <option value="">Category</option>
            {categories.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input className="border rounded-lg px-3 py-2" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 md:col-span-2" type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" type="text" placeholder="Crop (optional)" value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" type="text" placeholder="Project (optional)" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} />
          <button className="bg-[#2F855A] text-white rounded-lg px-4 py-2 hover:bg-[#246a46] inline-flex items-center justify-center" disabled={loading || !selectedPerson}>
            <FaPlus className="mr-2"/> {loading ? 'Saving...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow">
          <div className="text-sm text-green-700">Total Income</div>
          <div className="text-3xl font-bold text-green-700 mt-1">{currency(totals.income)}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow">
          <div className="text-sm text-red-700">Total Expenses</div>
          <div className="text-3xl font-bold text-red-700 mt-1">{currency(totals.expense)}</div>
        </div>
        <div className={`rounded-2xl p-6 shadow border ${totals.net >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <div className="text-sm text-gray-700">Net Balance</div>
          <div className={`text-3xl font-bold mt-1 ${totals.net >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{currency(totals.net)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h4 className="font-bold text-gray-800 mb-3">Monthly Trend</h4>
          <div className="h-72">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h4 className="font-bold text-gray-800 mb-3">Category Breakdown</h4>
          <div className="h-72">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Comparison across individuals */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800">Comparison Across Individuals</h4>
          <div className="text-sm text-gray-500">Month: {months.find(m => m.value === month.split('-')[1])?.label} {month.split('-')[0]}</div>
        </div>
        <div className="h-80">
          <Bar data={compareData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

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
              {transactions.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span>
                  </td>
                  <td className="py-2 font-semibold">{currency(t.amount)}</td>
                  <td className="py-2">{t.category}</td>
                  <td className="py-2">{t.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Person Modal */}
      {showPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Person</h3>
            <form onSubmit={addPerson} className="space-y-4">
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Name" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} required />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Role (e.g., Worker, Partner)" value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Photo URL (optional)" value={newPerson.photo} onChange={e => setNewPerson({ ...newPerson, photo: e.target.value })} />
              <div className="flex justify-end gap-3">
                <button type="button" className="px-4 py-2 border rounded-lg" onClick={() => setShowPersonModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#2F855A] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default IndividualFinanceTracker;

