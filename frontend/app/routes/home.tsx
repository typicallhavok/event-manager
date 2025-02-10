import React from 'react';
import { Link } from 'react-router-dom';

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden p-4 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 to-black pointer-events-none"></div>

      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-20">
        <div className="flex items-center gap-2">
          <div className="text-pink-500 text-2xl sm:text-3xl font-bold">
            <span className="inline-block transform rotate-45">×</span>
          </div>
          <span className="text-white font-bold text-2xl sm:text-3xl">Event Manager</span>
        </div>
      </div>

      <div className="z-10 max-w-3xl mx-auto sm:mx-4 sm:ml-64 mt-48 sm:mt-60 text-center sm:text-left">
        <h1 className="text-5xl sm:text-[9rem] font-bold tracking-wide">
          <span className="text-white/90 inline-block relative glow">
            HERE TO
          </span>
        </h1>
        <h1 className="text-5xl sm:text-[9rem] mb-2 font-bold tracking-wide">
          <span className="text-white/90 inline-block relative glow">
            CONNECT
          </span>
        </h1>
        
        <p className="block sm:hidden text-white/75 text-sm mb-4 px-4 leading-relaxed">
          Join us to create, manage, and participate in events that bring people together. 
          Experience seamless event planning and collaboration.
        </p>
        
        <p className="text-pink-500/90 text-xl sm:text-3xl mb-6 sm:mb-10">UNTANGLE THE WEB WITH US</p>
        
        <Link to="/login">
          <button className="w-full sm:w-auto bg-gradient-to-r from-purple-800 to-purple-600 text-white/90 px-8 sm:px-12 py-4 sm:py-5 rounded-full text-xl sm:text-2xl font-semibold hover:opacity-90 transition-opacity">
            CONNECT HERE
          </button>
        </Link>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden sm:block absolute top-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-full blur-md animate-float"></div>
        
        <div className="hidden sm:block absolute top-1/3 right-1/6 w-24 h-24 bg-pink-500/20 rounded-lg transform rotate-45 animate-spin-slow"></div>
        
        <div className="absolute bottom-1/4 right-1/4 text-purple-400/30 text-4xl sm:text-6xl animate-pulse">
          ✷
        </div>
        
        <div className="hidden sm:block absolute bottom-1/3 right-1/5 w-48 h-48 border-8 border-pink-400/20 rounded-full animate-spin-slow"></div>

        <div className="absolute inset-0">
          <div className="hidden sm:block absolute top-24 right-24 w-40 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 transform -rotate-45"></div>
          <div className="hidden sm:block absolute top-32 right-32 w-40 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 transform -rotate-45"></div>
          <div className="hidden sm:block absolute bottom-24 right-24 w-40 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 transform rotate-45"></div>
          <div className="hidden sm:block absolute bottom-32 right-32 w-40 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;