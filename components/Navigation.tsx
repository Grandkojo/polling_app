"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "./AuthProvider";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isModerator } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/polls", label: "Browse Polls" },
    { href: "/polls/create", label: "Create Poll" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  // Add admin link for admins and moderators
  if (isAdmin || isModerator) {
    navItems.push({ href: "/admin", label: "Admin" });
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-2xl font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
                aria-label="Polling App - Go to homepage"
              >
                Polling App
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    pathname === item.href
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Welcome, <span className="font-medium">{user.name}</span>
                    </span>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'secondary' : 'default'}
                      className="text-xs"
                      aria-label={`User role: ${user.role}`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                    className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Logout from your account"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button 
                    size="sm"
                    className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Login to your account"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
            id="mobile-menu"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    pathname === item.href
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4 pb-3">
                {user ? (
                  <div className="px-3 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      aria-label="Logout from your account"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="px-3">
                    <Link 
                      href="/auth/login"
                      onClick={closeMobileMenu}
                    >
                      <Button 
                        size="sm"
                        className="w-full justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Login to your account"
                      >
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
