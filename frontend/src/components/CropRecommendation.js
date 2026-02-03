import React, { useState } from 'react';

const CropRecommendation = () => {
  const [form, setForm] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [recommendedCrop, setRecommendedCrop] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Placeholder recommendation logic
  const recommendCrop = (e) => {
    e.preventDefault();
    // Simple logic: recommend crop based on NPK and rainfall
    const { N, P, K, temperature, humidity, ph, rainfall } = form;
    let crop = 'Rice';
    if (ph < 6) crop = 'Potato';
    else if (rainfall > 200) crop = 'Sugarcane';
    else if (N > 100 && P > 100 && K > 100) crop = 'Maize';
    else if (temperature > 30) crop = 'Cotton';
    setRecommendedCrop(crop);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Crop Recommendation</h2>
      <p className="mb-2 text-sm text-gray-600">Based on Crop Recommendation Dataset (India)</p>
      <form onSubmit={recommendCrop} className="space-y-4">
        {['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'].map((field) => (
          <div key={field}>
            <label className="block font-medium mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}{field === 'ph' ? ' (soil pH)' : ''}</label>
            <input
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Recommend Crop</button>
      </form>
      {recommendedCrop && (
        <div className="mt-6 p-4 bg-blue-100 rounded">
          <h3 className="text-lg font-semibold">Recommended Crop: {recommendedCrop}</h3>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
