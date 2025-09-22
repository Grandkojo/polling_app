'use client';

import { Heart, Twitter, Linkedin, Globe, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Main Footer Content */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-lg">
              <span>Made with</span>
              <Heart className="h-5 w-5 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a
                href="https://x.com/grandkojo"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-purple-300 hover:text-purple-200 transition-colors duration-200 hover:underline"
              >
                Grandkojo
              </a>
            </div>
            
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Building amazing web experiences and helping others create engaging content through innovative tools.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://x.com/grandkojo"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-blue-500 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Follow on X (Twitter)"
            >
              <Twitter className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-200" />
            </a>

            <a
              href="https://www.linkedin.com/in/ernest-essien-kojo/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-200" />
            </a>

            <a
              href="https://github.com/Grandkojo"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="View GitHub profile"
            >
              <Github className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-200" />
            </a>

            <a
              href="https://grandkojomee-main-fonpg1.laravel.cloud/y"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-purple-500 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Visit personal website"
            >
              <Globe className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-200" />
            </a>
          </div>

          {/* Bottom Border */}
          <div className="w-full border-t border-slate-700 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-slate-400 text-sm">
                © 2025 Polling App. All rights reserved.
              </div>
              <div className="flex items-center space-x-4 text-slate-400 text-sm">
                <span>Powered by</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Supabase</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-medium">Next.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
