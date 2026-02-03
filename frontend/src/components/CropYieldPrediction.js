import React, { useState } from 'react';

const CropYieldPrediction = () => {
  const [form, setForm] = useState({
    Crop: '',
    Crop_Year: '',
    Season: '',
    State: '',
    Area: '',
    Production: '',
    Annual_Rainfall: '',
    Fertilizer: '',
    Pesticide: ''
  });
  const [yieldResult, setYieldResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculate yield as Production / Area (metric tons per hectare)
  const predictYield = (e) => {
    e.preventDefault();
    const area = Number(form.Area);
    const production = Number(form.Production);
    let yieldValue = null;
    if (area > 0 && production > 0) {
      yieldValue = (production / area).toFixed(2);
    }
    setYieldResult(yieldValue);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Crop Yield Prediction</h2>
      <p className="mb-2 text-sm text-gray-600">Based on Agricultural Crop Yield in Indian States Dataset</p>
      <form onSubmit={predictYield} className="space-y-4">
        {/* Text fields for categorical data */}
        <div>
          <label className="block font-medium mb-1">Crop</label>
          <input type="text" name="Crop" value={form.Crop} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Crop Year</label>
          <input type="number" name="Crop_Year" value={form.Crop_Year} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Season</label>
          <input type="text" name="Season" value={form.Season} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">State</label>
          <input type="text" name="State" value={form.State} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {/* Numeric fields */}
        <div>
          <label className="block font-medium mb-1">Area (hectares)</label>
          <input type="number" name="Area" value={form.Area} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Production (metric tons)</label>
          <input type="number" name="Production" value={form.Production} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Annual Rainfall (mm)</label>
          <input type="number" name="Annual_Rainfall" value={form.Annual_Rainfall} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Fertilizer (kg)</label>
          <input type="number" name="Fertilizer" value={form.Fertilizer} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Pesticide (kg)</label>
          <input type="number" name="Pesticide" value={form.Pesticide} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Predict Yield</button>
      </form>
      {yieldResult !== null && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="text-lg font-semibold">Predicted Yield: {yieldResult} metric tons/hectare</h3>
        </div>
      )}
    </div>
  );
};

export default CropYieldPrediction;
