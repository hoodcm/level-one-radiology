
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { SearchDropdown } from './search/SearchDropdown';
import { Search, X } from 'lucide-react';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsDropdownOpen(false);
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Show dropdown when user types
    if (newQuery.trim() && !isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    if (query.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow dropdown interactions
    setTimeout(() => {
      if (!query) {
        setIsExpanded(false);
      }
    }, 200);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setIsDropdownOpen(false);
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Close dropdown when query is empty
  useEffect(() => {
    if (!query.trim()) {
      setIsDropdownOpen(false);
    }
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center justify-start transition-all duration-200 ease-in-out border-2 border-border bg-surface-card shadow-[0_4px_0px_theme(colors.shadow-hard)] hover:shadow-[0_6px_0px_theme(colors.shadow-hard)] hover:-translate-y-[2px] rounded-none px-3 py-2 text-xs ${
          isExpanded ? 'w-56' : 'w-28'
        }`}
      >
        <label htmlFor="search-input" className="sr-only">
          Search cases, essays, or articles
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="text-text-primary flex items-center justify-center cursor-pointer hover:text-text-secondary transition-colors flex-shrink-0"
          aria-label="Focus search"
        >
          <Search className="h-4 w-4" />
        </button>
        <Input
          id="search-input"
          ref={inputRef}
          type="search"
          placeholder={isExpanded ? "Search radiology content..." : "Search"}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="px-2 py-0 h-auto min-h-0 leading-tight bg-transparent border-none font-mono text-xs placeholder:italic placeholder:text-text-secondary text-text-primary focus:outline-none focus:ring-0 w-full"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-1 text-text-secondary hover:text-text-primary transition-colors duration-75 flex items-center justify-center h-5 flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <SearchDropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        query={query}
      />
    </div>
  );
}
