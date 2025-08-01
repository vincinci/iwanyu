'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import {
  UserIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store';
import { User } from '@/types';
import { getInitials, cn } from '@/lib/utils';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Redirect will be handled by the auth interceptor
  };

  const menuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      show: true,
    },
    {
      name: 'My Orders',
      href: '/orders',
      icon: ShoppingBagIcon,
      show: true,
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: HeartIcon,
      show: true,
    },
    {
      name: 'Vendor Dashboard',
      href: '/vendor/dashboard',
      icon: BuildingStorefrontIcon,
      show: user.role === 'vendor',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      show: true,
    },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold text-sm">
          {getInitials(user.name)}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.name.split(' ')[0]}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.role === 'vendor' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  Vendor
                </span>
              )}
            </div>

            {/* Menu items */}
            {menuItems
              .filter(item => item.show)
              .map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-2 text-sm transition-colors',
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}

            {/* Logout */}
            <div className="border-t border-gray-100">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm transition-colors',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    )}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
