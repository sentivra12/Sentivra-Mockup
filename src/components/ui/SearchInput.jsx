import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({ 
  placeholder = 'Search...', 
  onSearch, 
  debounceMs = 300,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-frost rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 text-primary-deep placeholder:text-muted"
          aria-label="Search mockups"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;


