import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserIcon,
  CloudIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, activeIcon: BellIconSolid },
    { name: 'Profile', href: `/profile/${user?.username}`, icon: UserIcon, activeIcon: UserIconSolid },
  ];

  if (user?.admin) {
    navigation.push({
      name: 'Admin',
      href: '/admin',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <CloudIcon className="h-8 w-8 text-cloudtype-blue" />
            <span className="text-xl font-bold text-gray-900">Cloudtype</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <div className="flex items-center px-6 py-4">
              <CloudIcon className="h-8 w-8 text-cloudtype-blue" />
              <span className="ml-2 text-xl font-bold text-gray-900">Cloudtype</span>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = isActive(item.href) ? item.activeIcon : item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isActive(item.href)
                        ? 'bg-cloudtype-blue text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-cloudtype-blue flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.display_name?.charAt(0) || user?.username?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    @{user?.username}
                    {user?.verified && (
                      <span className="ml-1 text-cloudtype-blue">✓</span>
                    )}
                  </p>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <nav className="flex justify-around py-2">
            {navigation.slice(0, 4).map((item) => {
              const Icon = isActive(item.href) ? item.activeIcon : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex flex-col items-center py-2 px-1
                    ${isActive(item.href) ? 'text-cloudtype-blue' : 'text-gray-500'}
                  `}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              );
            })}
            {user?.admin && (
              <Link
                to="/admin"
                className={`
                  flex flex-col items-center py-2 px-1
                  ${isActive('/admin') ? 'text-cloudtype-blue' : 'text-gray-500'}
                `}
              >
                <Cog6ToothIcon className="h-6 w-6" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};