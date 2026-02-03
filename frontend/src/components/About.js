import React from 'react';
import { FaLeaf, FaHeart, FaLightbulb, FaUsers } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">About Agri-Sathi</h1>
          <p className="text-xl text-gray-200 mb-8">
            Empowering farmers with technology-driven solutions for sustainable agriculture.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-200 mb-6">
                Agri-Sathi is dedicated to revolutionizing agriculture through innovative technology solutions. 
                We believe that every farmer deserves access to modern tools and knowledge to improve their 
                productivity and sustainability.
              </p>
              <p className="text-lg text-gray-200">
                Our platform combines artificial intelligence, data analytics, and community-driven insights 
                to provide farmers with comprehensive support for their agricultural journey.
              </p>
            </div>
            <div className="text-center">
              <FaLeaf className="text-8xl text-green-400 mx-auto mb-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <FaHeart className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-200">
                We promote sustainable farming practices that protect the environment 
                and ensure long-term agricultural success.
              </p>
            </div>
            <div className="text-center p-6 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <FaLightbulb className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-200">
                We continuously innovate to provide cutting-edge solutions that 
                address the evolving challenges in agriculture.
              </p>
            </div>
            <div className="text-center p-6 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <FaUsers className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-200">
                We foster a strong community of farmers who support and learn from each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">JD</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dhruvrajsinh Jadeja</h3>
              <p className="text-gray-200">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">JS</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">KEVAL</h3>
              <p className="text-gray-200">CTO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">MJ</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dhruvrajsinh</h3>
              <p className="text-gray-200">Lead Developer</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">SW</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dhruvrajsinh</h3>
              <p className="text-gray-200">UX Designer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 