import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon, UserGroupIcon, FunnelIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import FestivalCard from './FestivalCard.jsx';

const FestivalsList = ({ onEdit, onViewDetails }) => {
  const { festivals, loadFestivals, user, getTotalSurveyResponses } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalSurveyResponses, setTotalSurveyResponses] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: 'all', // all, upcoming, past, this_month
    attendanceStatus: '', // '', have_ticket, thinking_about_it, not_going
    location: ''
  });
  const [sortBy, setSortBy] = useState('created_at_desc'); // Orden por defecto
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 festivales por página
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initFestivals = async () => {
      setIsLoading(true);
      
      try {
        await loadFestivals();
        
        // Load survey responses count
        if (user) {
          const { data: surveyCount } = await getTotalSurveyResponses();
          setTotalSurveyResponses(surveyCount || 0);
        }
      } catch (error) {
        console.error('❌ Error loading festivals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load if user is available
    if (user) {
      initFestivals();
    } else {
      setIsLoading(false);
    }
  }, [user, loadFestivals, getTotalSurveyResponses]);

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'rock', label: '🎸 Rock' },
    { value: 'pop', label: '🎤 Pop' },
    { value: 'electronic', label: '🎧 Electrónica' },
    { value: 'indie', label: '🎵 Indie' },
    { value: 'metal', label: '🤘 Metal' },
    { value: 'folk', label: '🪕 Folk' },
    { value: 'jazz', label: '🎺 Jazz' },
    { value: 'reggae', label: '🌴 Reggae' },
    { value: 'hip_hop', label: '🎤 Hip Hop' },
    { value: 'other', label: '🎪 Otro' }
  ];

  const dateRanges = [
    { value: 'all', label: 'Todas las fechas' },
    { value: 'upcoming', label: '📅 Próximos' },
    { value: 'past', label: '📜 Pasados' },
    { value: 'this_month', label: '📆 Este mes' }
  ];

  const attendanceOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'have_ticket', label: '🎫 Tengo entrada' },
    { value: 'thinking_about_it', label: '🤔 Pensándolo' },
    { value: 'not_going', label: '❌ No voy' }
  ];

  const sortOptions = [
    { value: 'created_at_desc', label: '🆕 Más recientes' },
    { value: 'created_at_asc', label: '📜 Más antiguos' },
    { value: 'start_date_asc', label: '📅 Fecha de inicio (próximos)' },
    { value: 'start_date_desc', label: '📅 Fecha de inicio (lejanos)' },
    { value: 'name_asc', label: '🔤 Nombre A-Z' },
    { value: 'name_desc', label: '🔤 Nombre Z-A' },
    { value: 'location_asc', label: '📍 Ubicación A-Z' },
    { value: 'location_desc', label: '📍 Ubicación Z-A' }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      dateRange: 'all',
      attendanceStatus: '',
      location: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '' && filter !== 'all') || searchTerm !== '';
  const activeFiltersCount = Object.values(filters).filter(filter => filter !== '' && filter !== 'all').length + (searchTerm ? 1 : 0);

  // Reset page when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy]);

  const filteredFestivals = festivals.filter(festival => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      festival.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (festival.description && festival.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = filters.category === '' || festival.category === filters.category;

    // Date range filter
    const now = new Date();
    const startDate = new Date(festival.start_date);
    const endDate = new Date(festival.end_date);
    let matchesDateRange = true;

    switch (filters.dateRange) {
      case 'upcoming':
        matchesDateRange = startDate >= now;
        break;
      case 'past':
        matchesDateRange = endDate < now;
        break;
      case 'this_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        matchesDateRange = startDate >= startOfMonth && startDate <= endOfMonth;
        break;
      default: // 'all'
        matchesDateRange = true;
    }

    // Attendance status filter
    const userAttendance = festival.attendances?.find(a => a.user_id === user?.id);
    const userStatus = userAttendance?.status || '';
    const matchesAttendance = filters.attendanceStatus === '' || userStatus === filters.attendanceStatus;

    // Location filter
    const matchesLocation = filters.location === '' || 
      festival.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesCategory && matchesDateRange && matchesAttendance && matchesLocation;
  });

  // Sort festivals
  const sortedFestivals = [...filteredFestivals].sort((a, b) => {
    switch (sortBy) {
      case 'created_at_desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'created_at_asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'start_date_asc':
        return new Date(a.start_date) - new Date(b.start_date);
      case 'start_date_desc':
        return new Date(b.start_date) - new Date(a.start_date);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'location_asc':
        return a.location.localeCompare(b.location);
      case 'location_desc':
        return b.location.localeCompare(a.location);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedFestivals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFestivals = sortedFestivals.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-300">Inicia sesión para ver los festivales</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar festivales por nombre, ubicación o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sort dropdown */}
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input pr-10 appearance-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowsUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                showFilters 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="glass rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fecha
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="input text-sm"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance status filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mi Estado
                </label>
                <select
                  value={filters.attendanceStatus}
                  onChange={(e) => handleFilterChange('attendanceStatus', e.target.value)}
                  className="input text-sm"
                >
                  {attendanceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad, país..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando festivales...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedFestivals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {hasActiveFilters ? 'No se encontraron festivales' : 'No hay festivales aún'}
          </h3>
          <p className="text-slate-500 mb-4">
            {hasActiveFilters 
              ? 'Prueba ajustando los filtros o términos de búsqueda'
              : 'Sé el primero en crear un festival épico'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Festivals grid */}
      {!isLoading && sortedFestivals.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedFestivals.map(festival => (
              <FestivalCard 
                key={festival.id} 
                festival={festival} 
                onEdit={onEdit}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Mostrando {startIndex + 1}-{Math.min(endIndex, sortedFestivals.length)} de {sortedFestivals.length} festivales
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="text-slate-500">...</span>
                      )}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => Math.abs(page - currentPage) <= 2)
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="text-slate-500">...</span>
                      )}
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Stats Dashboard */}
      {!isLoading && sortedFestivals.length > 0 && (
        <div className="pt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">📊 Resumen de Actividad</h3>
            <p className="text-sm text-slate-400">Estadísticas generales de festivales y participación</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Festivals */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {hasActiveFilters ? sortedFestivals.length : festivals.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {hasActiveFilters ? 'Festivales filtrados' : 'Festivales totales'}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎪</span>
                </div>
              </div>
            </div>

            {/* Festival Attendance */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {festivals.filter(festival => {
                      const endDate = new Date(festival.end_date);
                      const now = new Date();
                      return endDate < now && festival.attendances?.some(a => a.user_id === user?.id && a.status === 'have_ticket');
                    }).length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Asistencia a festivales</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎪</span>
                </div>
              </div>
            </div>

            {/* Completed Festivals */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {festivals.filter(festival => {
                      const endDate = new Date(festival.end_date);
                      const now = new Date();
                      return endDate < now;
                    }).length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Festivales finalizados</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
              </div>
            </div>

            {/* Survey Responses */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {totalSurveyResponses}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Encuestas completadas</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {festivals.reduce((acc, festival) => 
                    acc + (festival.attendances?.filter(a => a.user_id === user?.id && a.status === 'have_ticket').length || 0), 0
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-3">Con entrada confirmada</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">Asistencia confirmada</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {festivals.reduce((acc, festival) => 
                    acc + (festival.attendances?.filter(a => a.user_id === user?.id && a.status === 'thinking_about_it').length || 0), 0
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-3">Considerando asistir</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">En evaluación</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {festivals.reduce((acc, festival) => 
                    acc + (festival.attendances?.filter(a => a.user_id === user?.id && a.status === 'not_going').length || 0), 0
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-3">No voy</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">Declinados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalsList; 