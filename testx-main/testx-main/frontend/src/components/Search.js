import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // TODO: Implement search functionality
    setTimeout(() => {
      setResults([]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Cloudtype..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-cloudtype-blue focus:border-cloudtype-blue sm:text-sm"
          />
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloudtype-blue"></div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Search Cloudtype</h3>
          <p className="mt-1 text-sm text-gray-500">
            Find people, posts, and topics you're interested in.
          </p>
        </div>
      )}
    </div>
  );
};