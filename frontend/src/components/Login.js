import React, { useState } from 'react';
import { FaLeaf, FaUser, FaBuilding, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { GiPitchfork } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const [userType, setUserType] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = React.useState(false);
  const [registerData, setRegisterData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agroRegisterData, setAgroRegisterData] = React.useState({
    agroName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    address: '',
    location: '',
    agroType: 'Supplier',
    services: [],
    gstNumber: '',
    socialLinks: '',
    workingHours: '',
  });
  const [agroLogo, setAgroLogo] = React.useState(null);
  const [agroIdProof, setAgroIdProof] = React.useState(null);
  const [agroLogoPreview, setAgroLogoPreview] = React.useState(null);
  const [agroIdPreview, setAgroIdPreview] = React.useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!formData.email || !formData.password) return;
    try {
      // Use shared auth for both
      const res = await axios.post('/api/user/auth/login', { email: formData.email, password: formData.password });
      if (res.data?.role === 'farmer') {
        const data = res.data;
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('role', 'farmer');
            const isFirstLogin = localStorage.getItem('isFirstLogin') === null;
            if (isFirstLogin) {
              localStorage.setItem('isFirstLogin', 'true');
              setSuccessMessage("Welcome! Please update your profile information for a better experience.");
          setTimeout(() => navigate('/farmer-dashboard'), 1200);
            } else {
              navigate('/farmer-dashboard');
            }
      } else if (res.data?.role === 'agro') {
        const data = res.data;
        localStorage.setItem('role', 'agro');
        localStorage.setItem('agroId', data._id);
        localStorage.setItem('agroName', data.agroName);
        localStorage.setItem('agroEmail', data.email);
        setSuccessMessage('Logged in successfully. Redirecting...');
        setTimeout(() => navigate('/agro-dashboard'), 800);
          } else {
        setError('Unexpected response');
      }
    } catch (err) {
      if (err.response?.status === 404) setError('User not found');
      else if (err.response?.status === 401) setError('Incorrect password');
      else setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (userType === 'farmer') {
    if (
      registerData.name &&
      registerData.email &&
      registerData.password &&
      registerData.password === registerData.confirmPassword
    ) {
      try {
        await axios.post("/api/user/register", {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          userType: "farmer",
        });
        localStorage.setItem("userName", registerData.name);
        localStorage.setItem("userEmail", registerData.email);
          localStorage.setItem("isFirstLogin", "true");
        setShowRegister(false);
        setFormData({ email: registerData.email, password: registerData.password });
        setUserType("farmer");
          setSuccessMessage("Account created successfully! You can now log in.");
        } catch (err) {
          setError(err.response?.data?.message || "Registration failed");
        }
      }
    } else if (userType === 'agro-business') {
      // Agro registration
      if (!agroRegisterData.password || agroRegisterData.password !== agroRegisterData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        const fd = new FormData();
        Object.entries({
          agroName: agroRegisterData.agroName,
          ownerName: agroRegisterData.ownerName,
          email: agroRegisterData.email,
          phone: agroRegisterData.phone,
          password: agroRegisterData.password,
          city: agroRegisterData.city,
          address: agroRegisterData.address,
          location: agroRegisterData.location,
          agroType: agroRegisterData.agroType,
          services: agroRegisterData.services.join(',') ,
          gstNumber: agroRegisterData.gstNumber,
          socialLinks: agroRegisterData.socialLinks,
          workingHours: agroRegisterData.workingHours ? JSON.stringify({ range: agroRegisterData.workingHours }) : ''
        }).forEach(([k, v]) => fd.append(k, v));
        if (agroLogo) fd.append('logo', agroLogo);
        if (agroIdProof) fd.append('idProof', agroIdProof);
        await axios.post('/api/user/agro/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setShowRegister(false);
        setSuccessMessage('Account created successfully! You can now log in.');
      } catch (err) {
        setError(err.response?.data?.message || 'Agro registration failed');
      }
    }
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f7fafc] to-[#e6fffa] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Login Form */}
          <div className="space-y-8 relative">
            {/* Decorative Gold Glow */}
            <div className="absolute -inset-2 z-0 rounded-3xl bg-gradient-to-br from-[#D69E2E]/20 to-transparent blur-2xl pointer-events-none" />
            {/* Logo Section */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <FaLeaf className="h-12 w-12 text-[#2F855A] mr-3 animate-spin-slow" />
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">AgriBudget</h1>
              </div>
              <p className="text-lg text-gray-600 font-medium italic">
                "Empowering your harvest, empowering your future."
              </p>
            </div>

            {/* User Type Toggle */}
            <div className="space-y-4 z-10 relative">
              <label className="block text-sm font-semibold text-gray-700">
                I am a:
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setUserType('farmer')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:z-10 ${
                    userType === 'farmer'
                      ? 'bg-white text-[#2F855A] shadow-lg scale-105 border-2 border-[#D69E2E]'
                      : 'text-gray-600 hover:text-[#2F855A] hover:bg-white/80'
                  }`}
                >
                  <span className="mr-2 flex items-center">
                    <FaUser className="mr-1" />
                    <GiPitchfork className="text-[#D69E2E] group-hover:animate-bounce" />
                  </span>
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('agro-business')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:z-10 ${
                    userType === 'agro-business'
                      ? 'bg-white text-[#2F855A] shadow-lg scale-105 border-2 border-[#D69E2E]'
                      : 'text-gray-600 hover:text-[#2F855A] hover:bg-white/80'
                  }`}
                >
                  <FaBuilding className="mr-2" />
                  Agro-Business
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 z-10 relative">
              {error && (
                <div className="text-red-600 font-semibold text-center mb-2">{error}</div>
              )}
              {successMessage && (
                <div className="text-green-600 font-semibold text-center mb-2 bg-green-50 p-3 rounded-lg border border-green-200 animate-fade-in-scale">
                  {successMessage}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] transition-colors duration-200 text-lg bg-white/80"
                    placeholder="Enter your email or phone number"
                    aria-label="Email or phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] transition-colors duration-200 text-lg bg-white/80"
                    placeholder="Enter your password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="submit"
                className="w-full bg-[#D69E2E] text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#B7791F] hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D69E2E] focus:ring-offset-2"
              >
                Log In
              </button>
            </form>

            {/* Secondary Links */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 z-10 relative">
              <button
                className="text-[#2F855A] hover:text-[#1F5F3F] font-medium transition-colors duration-200 hover:underline"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </button>
              <a
                href="#register"
                className="text-[#2F855A] hover:text-[#1F5F3F] font-medium transition-colors duration-200 hover:underline"
                onClick={e => { e.preventDefault(); setShowRegister(true); }}
              >
                Register
              </a>
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-8">
              {/* Farmer Illustration */}
              <div className="relative group cursor-pointer">
                <div className="bg-gradient-to-br from-[#2F855A] to-[#1F5F3F] rounded-full p-8 mb-6 shadow-2xl group-hover:scale-110 group-hover:shadow-gold transition-all duration-300">
                  <FaUser className="h-16 w-16 text-white inline-block group-hover:animate-bounce" />
                  <GiPitchfork className="h-10 w-10 text-[#D69E2E] absolute -bottom-4 -right-4 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 bg-[#D69E2E] rounded-full p-2 shadow-md">
                  <FaLeaf className="h-6 w-6 text-white" />
                </div>
              </div>
              {/* Agro-Business Illustration */}
              <div className="relative group cursor-pointer">
                <div className="bg-gradient-to-br from-[#D69E2E] to-[#B7791F] rounded-full p-8 shadow-2xl group-hover:scale-110 group-hover:shadow-green-700 transition-all duration-300">
                  <FaBuilding className="h-16 w-16 text-white inline-block group-hover:animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 bg-[#2F855A] rounded-full p-2 shadow-md">
                  <FaLeaf className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Welcome to AgriBudget
              </h3>
              <p className="text-gray-600 max-w-md">
                Manage your agricultural finances with precision and ease. <br />
                <span className="font-semibold text-[#2F855A]">From field to finance, we support your growth!</span>
              </p>
            </div>
          </div>

          {/* Mobile Illustration */}
          <div className="lg:hidden flex justify-center mt-8">
            <div className="flex space-x-4">
              <div className="bg-gradient-to-br from-[#2F855A] to-[#1F5F3F] rounded-full p-6 relative group cursor-pointer">
                <FaUser className="h-12 w-12 text-white group-hover:animate-bounce" />
                <GiPitchfork className="h-7 w-7 text-[#D69E2E] absolute -bottom-2 -right-2 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="bg-gradient-to-br from-[#D69E2E] to-[#B7791F] rounded-full p-6 group cursor-pointer">
                <FaBuilding className="h-12 w-12 text-white group-hover:animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 w-full max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowRegister(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">{userType === 'agro-business' ? 'Create Agro-Business Account' : 'Create Farmer Account'}</h2>
            {userType === 'agro-business' ? (
              <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                  <input type="text" value={agroRegisterData.agroName} onChange={e => setAgroRegisterData({ ...agroRegisterData, agroName: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                  <input type="text" value={agroRegisterData.ownerName} onChange={e => setAgroRegisterData({ ...agroRegisterData, ownerName: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={agroRegisterData.email} onChange={e => setAgroRegisterData({ ...agroRegisterData, email: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input type="tel" value={agroRegisterData.phone} onChange={e => setAgroRegisterData({ ...agroRegisterData, phone: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input type="password" value={agroRegisterData.password} onChange={e => setAgroRegisterData({ ...agroRegisterData, password: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                  <div className="mt-1 h-2 bg-gray-200 rounded">
                    <div className={`h-2 rounded ${passwordStrength(agroRegisterData.password) >= 3 ? 'bg-green-500' : passwordStrength(agroRegisterData.password) === 2 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(passwordStrength(agroRegisterData.password)/4)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input type="password" value={agroRegisterData.confirmPassword} onChange={e => setAgroRegisterData({ ...agroRegisterData, confirmPassword: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input type="text" value={agroRegisterData.address} onChange={e => setAgroRegisterData({ ...agroRegisterData, address: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input type="text" value={agroRegisterData.city} onChange={e => setAgroRegisterData({ ...agroRegisterData, city: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Exact Location (link/coords)</label>
                  <input type="text" value={agroRegisterData.location} onChange={e => setAgroRegisterData({ ...agroRegisterData, location: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Agro Type</label>
                  <select value={agroRegisterData.agroType} onChange={e => setAgroRegisterData({ ...agroRegisterData, agroType: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg">
                    {['Supplier','Buyer','Machinery Provider','NGO','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Services Offered</label>
                  <input type="text" placeholder="Comma separated" value={agroRegisterData.services.join(',')} onChange={e => setAgroRegisterData({ ...agroRegisterData, services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">GST / License Number</label>
                  <input type="text" value={agroRegisterData.gstNumber} onChange={e => setAgroRegisterData({ ...agroRegisterData, gstNumber: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Website / Social Links</label>
                  <input type="text" placeholder="Comma separated URLs" value={agroRegisterData.socialLinks} onChange={e => setAgroRegisterData({ ...agroRegisterData, socialLinks: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
                  <input type="text" placeholder="e.g. 09:00-18:00" value={agroRegisterData.workingHours} onChange={e => setAgroRegisterData({ ...agroRegisterData, workingHours: e.target.value })} className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-base md:text-lg" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Logo</label>
                  <input type="file" accept="image/*" className="block w-full text-sm" onChange={e => { const f = e.target.files?.[0]; setAgroLogo(f); setAgroLogoPreview(f ? URL.createObjectURL(f) : null); }} />
                  {agroLogoPreview && <img src={agroLogoPreview} alt="logo preview" className="mt-2 h-16 w-16 object-cover rounded" />}
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ID Proof (optional)</label>
                  <input type="file" accept="image/*,.pdf" className="block w-full text-sm" onChange={e => { const f = e.target.files?.[0]; setAgroIdProof(f); setAgroIdPreview(f ? URL.createObjectURL(f) : null); }} />
                  {agroIdPreview && <div className="mt-2 text-sm text-gray-600">File selected</div>}
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-base md:text-lg shadow-xl hover:bg-[#D69E2E] transition-all duration-200">Create Account</button>
                </div>
              </form>
            ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" value={registerData.name} onChange={handleRegisterInputChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] text-lg" placeholder="Enter your name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={registerData.email} onChange={handleRegisterInputChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] text-lg" placeholder="Enter your email" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" value={registerData.password} onChange={handleRegisterInputChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] text-lg" placeholder="Create a password" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterInputChange} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] focus:border-[#2F855A] text-lg" placeholder="Confirm your password" required />
                </div>
                <button type="submit" className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#D69E2E] transition-all duration-200">Create Account</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal (agro-focused, but works for both by email existence) */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowForgot(false)} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold text-[#2F855A] mb-3 text-center">Reset Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Email</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A]" placeholder="you@example.com" />
              </div>
              <button
                onClick={async () => {
                  try {
                    setError('');
                    setSuccessMessage('');
                    const res = await axios.post('/api/user/agro/forgot', { email: forgotEmail });
                    setSuccessMessage('Reset token sent. For demo, token shown below.');
                    setResetToken(res.data.token);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to generate reset token');
                  }
                }}
                className="w-full bg-[#2F855A] text-white py-3 rounded-lg font-semibold"
              >
                Get Reset Token
              </button>
              {resetToken && (
                <div className="bg-gray-50 p-3 rounded border text-xs break-all">Token: {resetToken}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <button
                onClick={async () => {
                  if (!resetToken) { setError('Reset token required'); return; }
                  if (!newPassword || newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
                  try {
                    setError('');
                    await axios.post('/api/user/agro/reset', { token: resetToken, password: newPassword });
                    setSuccessMessage('Password updated. You can now log in.');
                    setShowForgot(false);
                    setResetToken('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to reset password');
                  }
                }}
                className="w-full bg-[#D69E2E] text-white py-3 rounded-lg font-semibold"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 