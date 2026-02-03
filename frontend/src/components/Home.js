import React from 'react';
import { FaLeaf, FaChartLine, FaWallet, FaBell, FaCloudSun, FaUser, FaQuoteLeft, FaMobileAlt, FaGlobe, FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';
import { SiFirebase, SiMongodb, SiJsonwebtokens } from 'react-icons/si';

const features = [
  {
    icon: <FaWallet className="text-5xl text-gradient-to-r from-green-500 to-emerald-600 mb-4" />, 
    title: 'Income & Expense Tracking', 
    desc: 'Monitor all your farm finances in one place with real-time updates.'
  },
  {
    icon: <GiWheat className="text-5xl text-gradient-to-r from-yellow-500 to-orange-500 mb-4" />, 
    title: 'Crop-wise Budgeting', 
    desc: 'Plan and compare budgets for each crop with detailed analytics.'
  },
  {
    icon: <FaBell className="text-5xl text-gradient-to-r from-blue-500 to-cyan-500 mb-4" />, 
    title: 'Budget Alerts', 
    desc: 'Get instant alerts when you exceed your budget with smart notifications.'
  },
  {
    icon: <FaCloudSun className="text-5xl text-gradient-to-r from-purple-500 to-pink-500 mb-4" />, 
    title: 'Weather & Market API', 
    desc: 'Stay updated with weather forecasts and real-time market prices.'
  },
];

const analytics = [
  { title: 'Monthly Income', value: '₹48,000', icon: <FaChartLine className="text-3xl text-green-500" />, color: 'from-green-400 to-emerald-500' },
  { title: 'Expense Breakdown', value: '₹32,000', icon: <FaWallet className="text-3xl text-yellow-500" />, color: 'from-yellow-400 to-orange-500' },
  { title: 'Budget Utilization', value: '80%', icon: <FaChartLine className="text-3xl text-blue-500" />, color: 'from-blue-400 to-cyan-500' },
  { title: 'Crop Performance', value: '95%', icon: <GiWheat className="text-3xl text-purple-500" />, color: 'from-purple-400 to-pink-500' },
];

const testimonials = [
  {
    quote: 'AgriBudget made it so easy to track my farm expenses and plan ahead. Highly recommended!',
    name: 'Ravi Patel',
    location: 'Gujarat, India',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'The budget alerts and analytics help me make smarter decisions every season.',
    name: 'Sunita Sharma',
    location: 'Punjab, India',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'Love the mobile-friendly design and easy-to-use dashboard!',
    name: 'John M.',
    location: 'Nairobi, Kenya',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

const techs = [
  { icon: <SiFirebase className="text-4xl text-orange-500" />, name: 'Firebase' },
  { icon: <FaCloudSun className="text-4xl text-blue-500" />, name: 'OpenWeather' },
  { icon: <SiMongodb className="text-4xl text-green-500" />, name: 'MongoDB' },
  { icon: <SiJsonwebtokens className="text-4xl text-yellow-500" />, name: 'JWT' },
];

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-green-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <FaLeaf className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent tracking-tight">AgriBudget</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-lg font-semibold">
            <a href="#" className="text-green-600 hover:text-emerald-500 transition-all duration-300 hover:scale-105">Home</a>
            <a href="#about" className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:scale-105">About</a>
            <a href="#features" className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:scale-105">Features</a>
            <a href="/login" className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:scale-105">Login</a>
            <a href="/login" className="ml-2 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-xl" aria-label="Get Started">Get Started</a>
            <button className="ml-4 text-green-600 hover:text-emerald-500 transition-all duration-300 hover:scale-110" aria-label="Language Selector"><FaGlobe className="text-2xl" /></button>
          </nav>
          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <button className="text-green-600 hover:text-emerald-500 text-3xl transition-all duration-300 hover:scale-110" aria-label="Open Menu"><FaMobileAlt /></button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-white via-green-50 to-emerald-50 py-20 md:py-32 border-b border-green-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-16">
          {/* Left */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight animate-pulse">
              Empower Your Agricultural Finances
            </h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">Track expenses, plan budgets, and harvest insights with AgriBudget's intelligent farming management platform.</p>
            <div className="flex justify-center md:justify-start">
              <a href="/login" className="px-10 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-1" aria-label="Start">Start</a>
            </div>
          </div>
          {/* Right Illustration */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              <div className="absolute w-72 h-72 bg-gradient-to-br from-green-400/30 via-emerald-400/20 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 flex flex-col items-center space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
                  <GiFarmTractor className="text-8xl text-white drop-shadow-lg" />
                </div>
                <div className="flex space-x-4">
                  <div className="w-28 h-28 rounded-full border-4 border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300">
                    <FaUser className="text-5xl text-white" />
                  </div>
                  <div className="w-28 h-28 rounded-full border-4 border-green-400 bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300">
                    <FaUser className="text-5xl text-white" />
                  </div>
                </div>
                <span className="text-green-700 font-bold text-lg bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">Farmers & Agro-Business</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-16">Core Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-3 mt-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="py-24 bg-gradient-to-br from-white to-green-50 border-t border-green-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-16">Analytics at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {analytics.map((item, idx) => (
              <div key={idx} className="group bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <div className={`p-4 bg-gradient-to-r ${item.color} rounded-2xl group-hover:scale-110 transition-all duration-300 mb-4`}>
                  {item.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-2">{item.value}</div>
                <div className="text-gray-700 font-semibold mt-2">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-16">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4 group-hover:from-yellow-200 group-hover:to-orange-200 transition-all duration-300">
                  <FaQuoteLeft className="text-2xl text-orange-500" />
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.quote}"</p>
                <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full border-4 border-green-400 mb-3 object-cover shadow-lg group-hover:scale-110 transition-all duration-300" />
                <div className="font-bold text-green-700 text-lg">{t.name}</div>
                <div className="text-gray-500 text-sm">{t.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Integration Highlights */}
      <section className="py-16 bg-gradient-to-br from-white to-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Powered by Proven Technologies</h3>
          <div className="flex space-x-12 mb-6">
            {techs.map((tech, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  {tech.icon}
                </div>
                <span className="text-sm text-gray-600 mt-3 font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
          <div className="text-gray-500 text-center max-w-2xl">Built with cutting-edge technologies for reliable performance and seamless user experience.</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-6 flex items-center">
              <FaLeaf className="text-2xl mr-2" />
              AgriBudget
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-yellow-300 transition-colors duration-300">Home</a></li>
              <li><a href="#about" className="hover:text-yellow-300 transition-colors duration-300">About</a></li>
              <li><a href="#features" className="hover:text-yellow-300 transition-colors duration-300">Features</a></li>
              <li><a href="/login" className="hover:text-yellow-300 transition-colors duration-300">Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-yellow-300 transition-colors duration-300">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors duration-300">FAQs</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors duration-300">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" aria-label="Facebook" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110"><FaFacebook className="text-xl" /></a>
              <a href="#" aria-label="Twitter" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110"><FaTwitter className="text-xl" /></a>
              <a href="#" aria-label="Instagram" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110"><FaInstagram className="text-xl" /></a>
            </div>
            <div className="flex items-center space-x-3 text-sm mb-2">
              <FaEnvelope className="text-yellow-300" /> <span>info@agribudget.com</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FaPhone className="text-yellow-300" /> <span>+91 12345 67890</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Newsletter</h3>
            <form className="space-y-4">
              <input type="email" className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-yellow-300 focus:outline-none transition-all duration-300" placeholder="Your email" aria-label="Your email" />
              <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="text-center text-sm text-yellow-200 mt-12 pt-8 border-t border-white/20">&copy; {new Date().getFullYear()} AgriBudget. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home; 