import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Users, Calendar, MapPin, User, X } from 'lucide-react';
import { searchUsers, searchFestivals } from '../lib/supabase.js';
import UserAvatar from './UserAvatar.jsx';
import { toast } from '../store/toastStore.js';

const SearchBar = ({ 
  isOpen, 
  onClose, 
  isMobile = false,
  onUserClick = null,
  onFestivalClick = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (term) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (term.trim().length >= 2) {
            performSearch(term);
          } else {
            setSuggestions([]);
            setIsLoading(false);
          }
        }, 300);
      };
    })(),
    []
  );

  // Perform search
  const performSearch = async (term) => {
    setIsLoading(true);
    try {
      const [usersResult, festivalsResult] = await Promise.all([
        searchUsers(term, 5),
        searchFestivals(term, 5)
      ]);

      const results = [];
      
      // Add users
      if (usersResult.data && usersResult.data.length > 0) {
        results.push({
          type: 'users',
          label: 'Usuarios',
          items: usersResult.data.map(user => ({
            ...user,
            type: 'user',
            displayName: user.name || user.nickname,
            subtitle: user.city || user.bio || `@${user.nickname}`
          }))
        });
      }

      // Add festivals
      if (festivalsResult.data && festivalsResult.data.length > 0) {
        results.push({
          type: 'festivals',
          label: 'Festivales',
          items: festivalsResult.data.map(festival => ({
            ...festival,
            type: 'festival',
            displayName: festival.name,
            subtitle: festival.location || festival.description?.substring(0, 50) + '...',
            creator: festival.users
          }))
        });
      }

      setSuggestions(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error al buscar');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      debouncedSearch(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, debouncedSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.reduce((acc, group) => acc + group.items.length, 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const flatItems = suggestions.flatMap(group => group.items);
          const selectedItem = flatItems[selectedIndex];
          if (selectedItem) {
            handleItemClick(selectedItem);
          }
        } else if (searchTerm.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Handle item click
  const handleItemClick = (item) => {
    if (item.type === 'user') {
      if (onUserClick) {
        onUserClick(item);
      } else {
        // Fallback to navigation if no modal handler provided
        window.location.href = `/connections?user=${item.id}`;
      }
    } else if (item.type === 'festival') {
      if (onFestivalClick) {
        onFestivalClick(item);
      } else {
        // Fallback to navigation if no modal handler provided
        window.location.href = `/festivals?festival=${item.id}`;
      }
    }
    onClose();
    setSearchTerm('');
  };

  // Handle search submit
  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/festivals?search=${encodeURIComponent(searchTerm.trim())}`;
      onClose();
      setSearchTerm('');
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Get flat items for keyboard navigation
  const flatItems = suggestions.flatMap(group => group.items);

  return (
    <div className={`search-container ${isMobile ? 'w-full' : 'relative'}`} ref={searchRef}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <input
          ref={searchRef}
          type="text"
          placeholder="Buscar festivales, amigos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className={`w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
            isMobile ? 'text-base' : 'text-sm'
          }`}
          autoFocus={isOpen}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSuggestions([]);
              setSelectedIndex(-1);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (searchTerm.trim().length >= 2 || isLoading) && (
        <div 
          ref={suggestionsRef}
          className={`absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto ${
            isMobile ? 'w-full' : 'w-96'
          }`}
        >
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-slate-300 text-sm font-medium">Buscando...</p>
              <p className="text-slate-500 text-xs mt-1">Revisando usuarios y festivales</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((group, groupIndex) => (
                <div key={group.type}>
                  {/* Group Header */}
                  <div className="px-4 py-2 bg-slate-700 border-b border-slate-600">
                    <div className="flex items-center space-x-2">
                      {group.type === 'users' ? (
                        <Users className="h-4 w-4 text-primary-400" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary-400" />
                      )}
                      <span className="text-sm font-medium text-white">{group.label}</span>
                    </div>
                  </div>

                  {/* Group Items */}
                  {group.items.map((item, itemIndex) => {
                    const flatIndex = suggestions
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.items.length, 0) + itemIndex;
                    const isSelected = flatIndex === selectedIndex;

                    return (
                      <button
                        key={`${group.type}-${item.id}`}
                        onClick={() => handleItemClick(item)}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                          isSelected ? 'bg-slate-700' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar/Icon */}
                          <div className="flex-shrink-0">
                            {item.type === 'user' ? (
                              <UserAvatar user={item} size="sm" />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {item.displayName}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                            {item.type === 'festival' && item.creator && (
                              <div className="text-xs text-slate-500 truncate">
                                Por {item.creator.name || item.creator.nickname}
                              </div>
                            )}
                          </div>

                          {/* Type indicator */}
                          <div className="flex-shrink-0">
                            {item.type === 'user' ? (
                              <User className="h-4 w-4 text-slate-500" />
                            ) : (
                              <MapPin className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm font-medium">No se encontraron resultados</p>
              <p className="text-slate-500 text-xs mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : searchTerm.trim().length < 2 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm font-medium">Escribe para buscar</p>
              <p className="text-slate-500 text-xs mt-1">Busca usuarios, festivales, ciudades...</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
