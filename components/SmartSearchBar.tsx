'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { isValidPostcode } from '@/lib/utils/validation';
import { LoadingSpinner } from './LoadingSpinner';
import AIQuoteForm from './AIQuoteForm';

const TRADES = [
  "Plumber",
  "Electrician",
  "Painter & Decorator",
  "Handyman",
  "Builder",
  "Carpenter",
  "Roofer",
  "Gas Engineer",
  "Tiler",
  "Other"
] as const;

type Trade = typeof TRADES[number];

interface SearchFormData {
  trade: string;
  postcode: string;
}

export default function SmartSearchBar() {
  const [formData, setFormData] = useState<SearchFormData>({ trade: '', postcode: '' });
  const [suggestions, setSuggestions] = useState<Trade[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIQuoteForm, setShowAIQuoteForm] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTradeChange = (value: string) => {
    setFormData(prev => ({ ...prev, trade: value }));
    setError(null);
    
    if (value.length > 1) {
      const filtered = TRADES.filter(trade => 
        trade.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Trade) => {
    setFormData(prev => ({ ...prev, trade: suggestion }));
    setShowSuggestions(false);
    // Focus on the postcode input after selecting a suggestion
    document.getElementById('postcode')?.focus();
  };

  const handleInputFocus = () => {
    if (formData.trade.length > 1 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClearTrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, trade: '' }));
    inputRef.current?.focus();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.trade) {
      setError('Please select a trade');
      inputRef.current?.focus();
      return;
    }
    
    if (!formData.postcode) {
      setError('Please enter your postcode');
      document.getElementById('postcode')?.focus();
      return;
    }
    
    const formattedPostcode = formData.postcode.trim().toUpperCase();
    
    if (!isValidPostcode(formattedPostcode)) {
      setError('Please enter a valid UK postcode (e.g., SW1A 1AA)');
      return;
    }
    
    // Open AI Quote Form instead of navigating
    setShowAIQuoteForm(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* AI Quote Form Modal */}
      <AIQuoteForm 
        isOpen={showAIQuoteForm} 
        onClose={() => setShowAIQuoteForm(false)} 
      />
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1" ref={searchRef}>
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="What do you need help with?"
                value={formData.trade}
                onChange={(e) => handleTradeChange(e.target.value)}
                onFocus={handleInputFocus}
                className="w-full p-4 pr-10 rounded-md bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-label="Search for a trade"
                aria-haspopup="listbox"
                aria-expanded={showSuggestions}
                aria-controls="trade-suggestions"
              />
              {formData.trade && (
                <button
                  type="button"
                  onClick={handleClearTrade}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <ul 
                id="trade-suggestions"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion}
                    role="option"
                    aria-selected={formData.trade === suggestion}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 ${
                      formData.trade === suggestion ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Input
              id="postcode"
              type="text"
              placeholder="Enter your postcode"
              value={formData.postcode}
              onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
              className="w-full p-4 rounded-md bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-label="Your postcode"
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-md transition-colors flex items-center justify-center"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size={20} className="mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Search
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        
        <div className="flex items-center justify-center mt-2">
          <Shield className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-sm text-white">All Trades Verified</span>
        </div>
      </form>
    </div>
  );
}
