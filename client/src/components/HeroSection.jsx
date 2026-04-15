import React from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { Building2, Users, MessageSquare } from 'lucide-react';

const HeroSection = ({ onGetStarted }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const badges = [
    { icon: Building2, text: "Apartment Management" },
    { icon: Users, text: "Community Connect" },
    { icon: MessageSquare, text: "Real-time Communication" }
  ];

  const logos = [
    "React", "Node.js", "MongoDB", "Express", "Tailwind", "Framer"
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <div className="absolute bottom-[35vh] left-0 right-0 h-[80vh] z-0">
        <VideoPlayer 
          src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
          className="w-full h-full opacity-100"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium tracking-tight text-2xl">
              Flat Connect
            </div>
            
            <button 
              onClick={onGetStarted}
              className="btn-gradient px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-8">
            {badges.map((badge, index) => (
              <div key={index} className="glass-effect rounded-full px-4 py-2 flex items-center space-x-2">
                <badge.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">{badge.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-none"
          >
            Where Innovation
            <br />
            <span className="text-gradient">Meets Execution</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Connect your apartment community with seamless communication,
            <br />
            efficient issue tracking, and transparent management.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGetStarted}
              className="bg-black border-2 border-white text-white px-8 py-4 rounded-lg font-medium transition-all hover:bg-white hover:text-black"
            >
              Get Started for Free
            </button>
            <button 
              onClick={onGetStarted}
              className="glass-effect text-white px-8 py-4 rounded-lg font-medium transition-all hover:bg-white hover:bg-opacity-20"
            >
              Let's Get Connected
            </button>
          </motion.div>
        </motion.div>

        {/* Logo Marquee */}
        <motion.div 
          variants={itemVariants}
          className="absolute bottom-8 left-0 right-0"
        >
          <div className="flex items-center justify-center space-x-12 opacity-40">
            {logos.map((logo, index) => (
              <div key={index} className="text-gray-500 font-medium text-lg grayscale">
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;