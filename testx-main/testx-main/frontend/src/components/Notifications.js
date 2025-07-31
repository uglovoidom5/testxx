import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export const Notifications = () => {
  // TODO: Implement notifications functionality
  const notifications = [];

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            When someone likes, reposts, or replies to your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* TODO: Render notification content */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};