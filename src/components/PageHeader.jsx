import { 
  ChevronRightIcon,
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

/**
 * PageHeader component for displaying page-specific headers with breadcrumbs, stats, and actions
 * @param {Object} props
 * @param {string} props.title - The main title of the page
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {string} [props.icon] - Icon name for the header
 * @param {Array} [props.breadcrumbs=[]] - Array of breadcrumb objects with label and href
 * @param {any} [props.actions=null] - Action buttons or elements
 * @param {Array} [props.stats=null] - Array of stat objects with icon, value, and label
 * @param {string} [props.gradient='primary'] - Gradient color theme
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  breadcrumbs = [], 
  actions = null,
  stats = null,
  gradient = 'primary'
}) => {
  const getGradientClasses = (type) => {
    const gradients = {
      primary: 'from-primary-600 to-primary-700',
      purple: 'from-purple-600 to-purple-700',
      green: 'from-green-600 to-green-700',
      orange: 'from-orange-600 to-orange-700',
      pink: 'from-pink-600 to-pink-700',
      blue: 'from-blue-600 to-blue-700'
    };
    return gradients[type] || gradients.primary;
  };

  const getBackgroundImage = (type) => {
    const images = {
      // Primary - General rock/music theme (guitar close-up)
      primary: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      
      // Purple - Friends/community theme (group of friends at concert)
      purple: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      
      // Green - Connections/network theme (stage with dramatic lighting)
      green: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      
      // Orange - Festivals theme (epic festival stage with fireworks)
      orange: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      
      // Pink - Alternative theme (concert atmosphere with lights)
      pink: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      
      // Blue - Music theme (band performing)
      blue: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    };
    return images[type] || images.primary;
  };

  const getIconComponent = (iconName) => {
    const icons = {
      home: HomeIcon,
      calendar: CalendarIcon,
      users: UserGroupIcon,
      map: MapPinIcon,
      music: MusicalNoteIcon
    };
    return icons[iconName] || null;
  };

  const IconComponent = getIconComponent(icon);

  return (
    <div className="relative overflow-hidden page-header">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={getBackgroundImage(gradient)}
          alt="Background"
          className="w-full h-full object-cover object-center opacity-20"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getGradientClasses(gradient)} opacity-30`} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 py-4 text-sm">
            <a 
              href="/" 
              className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Inicio</span>
            </a>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white font-medium">{crumb.label}</span>
                ) : (
                  <a 
                    href={crumb.href} 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Main header content */}
        <div className="py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {IconComponent && (
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getGradientClasses(gradient)} shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-lg sm:text-xl text-slate-200 max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-sm text-slate-200">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 