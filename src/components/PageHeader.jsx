import { useState, useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const PageHeader = ({ title, subtitle, icon, gradient, breadcrumbs = [] }) => {
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

  const getGradientClasses = (gradient) => {
    switch (gradient) {
      case 'orange':
        return 'from-orange-500 to-red-500';
      case 'purple':
        return 'from-purple-500 to-pink-500';
      case 'blue':
        return 'from-blue-500 to-cyan-500';
      case 'green':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-primary-500 to-purple-500';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient - hidden on mobile to avoid duplication effect */}
      {!isMobile && (
        <div className={`absolute inset-0 bg-gradient-to-r ${getGradientClasses(gradient)} opacity-10`}></div>
      )}
      
      {/* Content */}
      <div className={`relative px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8 sm:py-12'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs - hidden on mobile to reduce clutter */}
          {breadcrumbs.length > 0 && !isMobile && (
            <nav className="flex items-center space-x-2 mb-4 sm:mb-6">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="h-4 w-4 text-slate-400 mx-2" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-sm font-medium text-white">
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Main content */}
          <div className={`flex ${isMobile ? 'flex-col items-center text-center space-y-3' : 'flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6'}`}>
            {/* Icon */}
            <div className={`flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} bg-gradient-to-r ${getGradientClasses(gradient)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className={isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}>{icon}</span>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-4xl lg:text-5xl'} font-bold bg-gradient-to-r ${getGradientClasses(gradient)} bg-clip-text text-transparent mb-2 sm:mb-3`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`${isMobile ? 'text-sm' : 'text-base sm:text-lg'} text-slate-300 leading-relaxed max-w-3xl`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border with gradient - hidden on mobile */}
      {!isMobile && (
        <div className={`h-1 bg-gradient-to-r ${getGradientClasses(gradient)}`}></div>
      )}
    </div>
  );
};

export default PageHeader; 