import React from 'react';
import { FaUserCog, FaPalette, FaBell, FaShieldAlt, FaCogs, FaDatabase, FaSeedling, FaCloudUploadAlt, FaTrashAlt, FaSignOutAlt, FaDownload, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const navigate = useNavigate();
  const { t, changeLanguage } = useLanguage();
  
  const TABS = [
    { key: 'profile', label: t('profile'), icon: <FaUserCog className="mr-2" /> },
    { key: 'theme', label: t('themeDisplay'), icon: <FaPalette className="mr-2" /> },
    { key: 'notifications', label: t('notifications'), icon: <FaBell className="mr-2" /> },
    { key: 'security', label: t('security'), icon: <FaShieldAlt className="mr-2" /> },
    { key: 'preferences', label: t('preferences'), icon: <FaCogs className="mr-2" /> },
    { key: 'account', label: t('account'), icon: <FaDatabase className="mr-2" /> },
    { key: 'agri', label: t('agriculturalProfile'), icon: <FaSeedling className="mr-2" /> },
  ];
  const [activeTab, setActiveTab] = React.useState('profile');
  const [profile, setProfile] = React.useState({
    firstName: '',
    lastName: '',
    username: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pictureUrl: '',
  });
  const [theme, setTheme] = React.useState({
    mode: 'light',
    fontSize: 'medium',
    language: 'en',
    layout: 'detailed',
  });
  const [notifications, setNotifications] = React.useState({
    emailAlerts: true,
    smsAlerts: false,
    whatsappAlerts: false,
    budgetWarnings: true,
    weatherUpdates: true,
    priceUpdates: true,
  });
  const [security, setSecurity] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: 'off',
  });
  const [preferences, setPreferences] = React.useState({
    language: 'en',
    currency: 'INR',
    theme: 'system',
  });
  const [account, setAccount] = React.useState({
    linkedGoogle: false,
    linkedFacebook: false,
  });
  const [agri, setAgri] = React.useState({
    farmerType: 'small',
    crops: '',
    location: '',
    farmSize: '',
    alertPrefs: {
      weather: true,
      cropPrice: true,
      emi: false,
    }
  });
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Load saved theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('agriTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        applyThemeChanges(parsedTheme);
      } catch (e) {
        console.error('Error loading saved theme:', e);
      }
    }
  }, []);

  React.useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/user/settings', { params: { email } });
        const s = res.data || {};
        if (s.profile) setProfile({
          firstName: s.profile.firstName || '',
          lastName: s.profile.lastName || '',
          username: s.profile.username || '',
          dob: s.profile.dob ? s.profile.dob.substring(0, 10) : '',
          gender: s.profile.gender || '',
          email: s.profile.email || localStorage.getItem('userEmail') || '',
          phone: s.profile.phone || '',
          address: s.profile.address || '',
          city: s.profile.city || '',
          state: s.profile.state || '',
          pictureUrl: s.profile.pictureUrl || '',
        });
        if (s.theme) {
          const savedTheme = {
            mode: s.theme.mode || 'light',
            fontSize: s.theme.fontSize || 'medium',
            language: s.theme.language || 'en',
            layout: s.theme.layout || 'detailed',
          };
          setTheme(savedTheme);
          // Apply saved theme on load
          applyThemeChanges(savedTheme);
        }
        if (s.notifications) setNotifications({
          emailAlerts: !!s.notifications.emailAlerts,
          smsAlerts: !!s.notifications.smsAlerts,
          whatsappAlerts: !!s.notifications.whatsappAlerts,
          budgetWarnings: !!s.notifications.budgetWarnings,
          weatherUpdates: !!s.notifications.weatherUpdates,
          priceUpdates: !!s.notifications.priceUpdates,
        });
        if (s.security) setSecurity({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactor: s.security.twoFactor || 'off',
        });
        if (s.preferences) {
          // Use theme.language if it exists, otherwise use preferences.language
          const languageToUse = (s.theme && s.theme.language) ? s.theme.language : (s.preferences.language || 'en');
          setPreferences({
            language: languageToUse,
            currency: s.preferences.currency || 'INR',
            theme: s.preferences.theme || 'system',
          });
          // Also update theme.language if preferences has a different language
          if (s.theme && s.theme.language !== languageToUse) {
            const updatedTheme = {
              mode: s.theme.mode || 'light',
              fontSize: s.theme.fontSize || 'medium',
              language: languageToUse,
              layout: s.theme.layout || 'detailed',
            };
            setTheme(updatedTheme);
            applyThemeChanges(updatedTheme);
          }
        }
        if (s.account) setAccount({
          linkedGoogle: !!s.account.linkedGoogle,
          linkedFacebook: !!s.account.linkedFacebook,
        });
        if (s.agricultural) setAgri({
          farmerType: s.agricultural.farmerType || 'small',
          crops: s.agricultural.crops || '',
          location: s.agricultural.location || '',
          farmSize: s.agricultural.farmSize || '',
          alertPrefs: {
            weather: !!(s.agricultural.alertPrefs && s.agricultural.alertPrefs.weather),
            cropPrice: !!(s.agricultural.alertPrefs && s.agricultural.alertPrefs.cropPrice),
            emi: !!(s.agricultural.alertPrefs && s.agricultural.alertPrefs.emi),
          }
        });
      } catch (e) {
        setMessage('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return setMessage('Missing user email');
    setLoading(true);
    setMessage('');
    try {
      if (activeTab === 'profile') {
        await axios.put('/api/user/settings/profile', { email, ...profile });
      } else if (activeTab === 'theme') {
        await axios.put('/api/user/settings/theme', { email, ...theme });
        // Also update preferences.language if language was changed
        if (theme.language) {
          await axios.put('/api/user/settings/preferences', { email, language: theme.language });
        }
        // Apply theme changes immediately
        applyThemeChanges(theme);
      } else if (activeTab === 'notifications') {
        await axios.put('/api/user/settings/notifications', { email, ...notifications });
      } else if (activeTab === 'security') {
        await axios.put('/api/user/settings/security', { email, twoFactor: security.twoFactor });
        // Note: password change would be a separate secure endpoint
      } else if (activeTab === 'preferences') {
        await axios.put('/api/user/settings/preferences', { email, ...preferences });
        // Also update theme.language if language was changed in preferences
        if (preferences.language) {
          const updatedTheme = { ...theme, language: preferences.language };
          setTheme(updatedTheme);
          await axios.put('/api/user/settings/theme', { email, ...updatedTheme });
          applyThemeChanges(updatedTheme);
        }
      } else if (activeTab === 'account') {
        await axios.put('/api/user/settings/account', { email, ...account });
      } else if (activeTab === 'agri') {
        await axios.put('/api/user/settings/agricultural', { email, ...agri });
      }
      setMessage(t('savedSuccessfully'));
    } catch (e) {
      setMessage(t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Apply theme changes immediately
  const applyThemeChanges = (newTheme) => {
    // Apply theme mode
    const root = document.documentElement;
    if (newTheme.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (newTheme.mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System mode - check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }

    // Apply font size
    root.style.fontSize = newTheme.fontSize === 'small' ? '14px' : 
                         newTheme.fontSize === 'large' ? '18px' : '16px';

    // Apply layout
    root.setAttribute('data-layout', newTheme.layout);

    // Apply language
    root.setAttribute('data-lang', newTheme.language);

    // Store theme in localStorage for persistence
    localStorage.setItem('agriTheme', JSON.stringify(newTheme));
  };

  // Handle theme changes in real-time
  const handleThemeChange = (key, value) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    // If language is changed, also update preferences.language to keep them in sync
    if (key === 'language') {
      setPreferences({ ...preferences, language: value });
      // Trigger global language change
      changeLanguage(value);
    }
    applyThemeChanges(newTheme);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#2F855A]">{t('settings')}</h1>
        <button
          onClick={() => navigate('/farmer-dashboard')}
          className="flex items-center px-4 py-2 bg-[#2F855A] text-white rounded-lg hover:bg-[#1F5F3F] transition-colors"
        >
          <FaHome className="mr-2" />
          {t('goToDashboard')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 rounded-full border transition-colors ${activeTab === tab.key ? 'bg-[#2F855A] text-white border-[#2F855A]' : 'bg-white text-[#2F855A] border-[#2F855A]/30 hover:bg-[#2F855A]/10'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        {message && (
          <div className={`mb-4 text-sm ${message.includes('fail') ? 'text-red-600' : 'text-green-700'}`}>{message}</div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-gray-500">{t('loading')}</div>
        )}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">{t('profile')} {t('settings')}</h2>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                {profile.pictureUrl ? (
                  <img src={profile.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>IMG</span>
                )}
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded bg-[#2F855A] text-white text-sm">
                  <FaCloudUploadAlt className="mr-2" /> {t('upload')}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Compress image before converting to Base64
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      
                      img.onload = () => {
                        // Set canvas size (max 300x300 for profile pics)
                        const maxSize = 300;
                        let { width, height } = img;
                        
                        if (width > height) {
                          if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                          }
                        } else {
                          if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                          }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw and compress
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
                        
                        setProfile({ ...profile, pictureUrl: compressedDataUrl });
                      };
                      
                      img.src = URL.createObjectURL(file);
                    }
                  }} />
                </label>
                <button className="px-3 py-2 rounded bg-gray-200 text-gray-700 text-sm" onClick={() => setProfile({ ...profile, pictureUrl: '' })}><FaTrashAlt className="inline mr-1" /> {t('remove')}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded px-3 py-2" placeholder="First Name" value={profile.firstName} onChange={(e)=>setProfile({...profile, firstName:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Last Name" value={profile.lastName} onChange={(e)=>setProfile({...profile, lastName:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Username (optional)" value={profile.username} onChange={(e)=>setProfile({...profile, username:e.target.value})} />
              <input className="border rounded px-3 py-2" type="date" placeholder="DOB" value={profile.dob} onChange={(e)=>setProfile({...profile, dob:e.target.value})} />
              <select className="border rounded px-3 py-2" value={profile.gender} onChange={(e)=>setProfile({...profile, gender:e.target.value})}>
                <option value="">Gender (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input className="border rounded px-3 py-2" type="email" placeholder="Email" value={profile.email} onChange={(e)=>setProfile({...profile, email:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Phone" value={profile.phone} onChange={(e)=>setProfile({...profile, phone:e.target.value})} />
              <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Address (village, city, state)" value={profile.address} onChange={(e)=>setProfile({...profile, address:e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border rounded px-3 py-2" placeholder="City" value={profile.city} onChange={(e)=>setProfile({...profile, city:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="State" value={profile.state} onChange={(e)=>setProfile({...profile, state:e.target.value})} />
              <select className="border rounded px-3 py-2">
                <option>Default Currency: ₹ (INR)</option>
                <option>$ (USD)</option>
                <option>€ (EUR)</option>
              </select>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border rounded px-3 py-2" type="password" placeholder="Old Password" value={security.oldPassword} onChange={(e)=>setSecurity({...security, oldPassword:e.target.value})} />
                <input className="border rounded px-3 py-2" type="password" placeholder="New Password" value={security.newPassword} onChange={(e)=>setSecurity({...security, newPassword:e.target.value})} />
                <input className="border rounded px-3 py-2" type="password" placeholder="Confirm Password" value={security.confirmPassword} onChange={(e)=>setSecurity({...security, confirmPassword:e.target.value})} />
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Linked Accounts</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={account.linkedGoogle} onChange={(e)=>setAccount({...account, linkedGoogle:e.target.checked})} /> Google
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={account.linkedFacebook} onChange={(e)=>setAccount({...account, linkedFacebook:e.target.checked})} /> Facebook
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">{t('themeDisplay')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                 <label className="block text-sm font-medium mb-1">{t('themeMode')}</label>
                 <select className="border rounded px-3 py-2 w-full" value={theme.mode} onChange={(e)=>handleThemeChange('mode', e.target.value)}>
                   <option value="light">{t('light')}</option>
                   <option value="dark">{t('dark')}</option>
                   <option value="system">{t('system')}</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">{t('fontSize')}</label>
                 <select className="border rounded px-3 py-2 w-full" value={theme.fontSize} onChange={(e)=>handleThemeChange('fontSize', e.target.value)}>
                   <option value="small">{t('small')}</option>
                   <option value="medium">{t('medium')}</option>
                   <option value="large">{t('large')}</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">{t('language')}</label>
                 <select className="border rounded px-3 py-2 w-full" value={theme.language} onChange={(e)=>handleThemeChange('language', e.target.value)}>
                   <option value="en">{t('english')}</option>
                   <option value="hi">{t('hindi')}</option>
                   <option value="gu">{t('gujarati')}</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">{t('dashboardLayout')}</label>
                 <select className="border rounded px-3 py-2 w-full" value={theme.layout} onChange={(e)=>handleThemeChange('layout', e.target.value)}>
                   <option value="compact">{t('compact')}</option>
                   <option value="detailed">{t('detailed')}</option>
                 </select>
               </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">Notification Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.emailAlerts} onChange={(e)=>setNotifications({...notifications, emailAlerts:e.target.checked})} /> Email Alerts</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.smsAlerts} onChange={(e)=>setNotifications({...notifications, smsAlerts:e.target.checked})} /> SMS Alerts</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.whatsappAlerts} onChange={(e)=>setNotifications({...notifications, whatsappAlerts:e.target.checked})} /> WhatsApp Alerts</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.budgetWarnings} onChange={(e)=>setNotifications({...notifications, budgetWarnings:e.target.checked})} /> Budget Limit Warnings</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.weatherUpdates} onChange={(e)=>setNotifications({...notifications, weatherUpdates:e.target.checked})} /> Weather Updates</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.priceUpdates} onChange={(e)=>setNotifications({...notifications, priceUpdates:e.target.checked})} /> Crop Price Updates</label>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">Security</h2>
            <div>
              <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
              <select className="border rounded px-3 py-2" value={security.twoFactor} onChange={(e)=>setSecurity({...security, twoFactor:e.target.value})}>
                <option value="off">Off</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="app">Authenticator App</option>
              </select>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Active Sessions & Devices</h3>
              <div className="text-sm text-gray-600">Device list placeholder. <button className="ml-2 text-red-600 hover:underline"><FaSignOutAlt className="inline mr-1" /> Logout All</button></div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select className="border rounded px-3 py-2 w-full" value={preferences.language} onChange={(e)=>{
                  const newLang = e.target.value;
                  setPreferences({...preferences, language: newLang});
                  // Also update theme.language to keep them in sync
                  const updatedTheme = { ...theme, language: newLang };
                  setTheme(updatedTheme);
                  applyThemeChanges(updatedTheme);
                  // Trigger global language change
                  changeLanguage(newLang);
                }}>
                  <option value="en">{t('english')}</option>
                  <option value="hi">{t('hindi')}</option>
                  <option value="gu">{t('gujarati')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select className="border rounded px-3 py-2 w-full" value={preferences.currency} onChange={(e)=>setPreferences({...preferences, currency:e.target.value})}>
                  <option value="INR">₹ (INR)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme</label>
                <select className="border rounded px-3 py-2 w-full" value={preferences.theme} onChange={(e)=>setPreferences({...preferences, theme:e.target.value})}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">Account Management</h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded bg-white border border-gray-300 shadow text-gray-700"><FaDownload className="inline mr-2" /> Download My Data</button>
              <button className="px-4 py-2 rounded bg-white border border-gray-300 shadow text-gray-700">Export as CSV</button>
              <button className="px-4 py-2 rounded bg-white border border-gray-300 shadow text-gray-700">Export as Excel</button>
              <button className="px-4 py-2 rounded bg-white border border-gray-300 shadow text-gray-700">Export as PDF</button>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Deactivate or Delete Account</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Deactivate Account</button>
                <button className="px-4 py-2 rounded bg-red-100 text-red-800 border border-red-200"><FaTrashAlt className="inline mr-2" /> Delete Account</button>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Linked Accounts</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={account.linkedGoogle} onChange={(e)=>setAccount({...account, linkedGoogle:e.target.checked})} /> Google
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={account.linkedFacebook} onChange={(e)=>setAccount({...account, linkedFacebook:e.target.checked})} /> Facebook
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agri' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2F855A]">Agricultural Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Farmer Type</label>
                <select className="border rounded px-3 py-2 w-full" value={agri.farmerType} onChange={(e)=>setAgri({...agri, farmerType:e.target.value})}>
                  <option value="small">Small-scale</option>
                  <option value="large">Large-scale</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Main Crops</label>
                <input className="border rounded px-3 py-2 w-full" placeholder="e.g., wheat, rice, cotton" value={agri.crops} onChange={(e)=>setAgri({...agri, crops:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Farm Location</label>
                <input className="border rounded px-3 py-2 w-full" placeholder="GPS or address" value={agri.location} onChange={(e)=>setAgri({...agri, location:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Farm Size</label>
                <input className="border rounded px-3 py-2 w-full" placeholder="acres/hectares" value={agri.farmSize} onChange={(e)=>setAgri({...agri, farmSize:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Alerts</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={agri.alertPrefs.weather} onChange={(e)=>setAgri({...agri, alertPrefs:{...agri.alertPrefs, weather:e.target.checked}})} /> Weather</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={agri.alertPrefs.cropPrice} onChange={(e)=>setAgri({...agri, alertPrefs:{...agri.alertPrefs, cropPrice:e.target.checked}})} /> Crop Price</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={agri.alertPrefs.emi} onChange={(e)=>setAgri({...agri, alertPrefs:{...agri.alertPrefs, emi:e.target.checked}})} /> EMI Reminders</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-[#2F855A] text-white" onClick={handleSave}>{t('save')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;


