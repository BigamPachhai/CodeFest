import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  MapPin, 
  TrendingUp,
  Shield,
  Award
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: 'Report Issues',
      description: 'Easily report local problems with photos and precise location details'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Track Resolution',
      description: 'Monitor the progress of your reports and get notified when resolved'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Voice',
      description: 'Upvote important issues and comment on ongoing problems'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Earn Recognition',
      description: 'Gain points and appear on leaderboards for your civic contributions'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Problems Reported' },
    { number: '1,800+', label: 'Issues Resolved' },
    { number: '75%', label: 'Resolution Rate' },
    { number: '15+', label: 'Municipalities Covered' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero-pattern bg-cover bg-center text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transforming Rupandehi
              <br />
              <span className="text-nepali-red">Together</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your voice matters. Report local issues, track resolutions, and help build a better community with Rupandehi Samadhan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/report" 
                className="bg-nepali-red hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Report a Problem
              </Link>
              <Link 
                to="/map" 
                className="border-2 border-white hover:bg-white hover:text-nepali-blue text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-nepali-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to make your community better. Your reports drive real change.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
              >
                <div className="text-nepali-blue mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-nepali-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of citizens working together to improve Rupandehi District.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-nepali-red hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/leaderboard" 
                className="border-2 border-white hover:bg-white hover:text-nepali-blue text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;