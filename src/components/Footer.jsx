import { 
  Heart, 
  Music,
  Users,
  Calendar,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import WachoModal from './WachoModal.jsx';
import useStore from '../store/useStore.js';
import { supabase } from '../lib/supabase.js';

const Footer = ({ showDemo = false }) => {
  const { user } = useStore();
  const currentYear = new Date().getFullYear();
  const [showWachoModal, setShowWachoModal] = useState(false);
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

  // Debug: Check available images and user badges
  useEffect(() => {
    const checkImages = async () => {
      try {
        const { data: fileList, error } = await supabase.storage
          .from('frontimages')
          .list('', { limit: 100 });
        
        if (error) {
          console.error('❌ Error listing files:', error);
        } else {
          console.log('📁 Available files in frontimages:', fileList?.map(f => f.name));
        }
      } catch (err) {
        console.error('❌ Exception checking files:', err);
      }
    };

    const checkUserBadges = async () => {
      if (user) {
        try {
          const { data: userBadges, error } = await supabase
            .from('user_badges')
            .select(`
              *,
              badge_definitions (
                id,
                badge_key,
                name,
                description,
                icon,
                color_gradient,
                rarity
              )
            `)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('❌ Error checking user badges:', error);
          } else {
            console.log('🏆 Current user badges:', userBadges);
          }
        } catch (err) {
          console.error('❌ Exception checking user badges:', err);
        }
      }
    };
    
    checkImages();
    checkUserBadges();
  }, [user]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApadrinarWacho = async () => {
    try {
      console.log('🔍 Starting Wacho Patron badge assignment process...');
      
      // Assign the badge first
      const { assignWachoPatronBadge } = useStore.getState();
      console.log('🔍 Calling assignWachoPatronBadge...');
      
      const { data: badge, error } = await assignWachoPatronBadge();
      
      if (error) {
        console.error('❌ Error assigning Wacho Patron badge:', error);
        // Still show modal even if badge assignment fails
      } else {
        console.log('✅ Wacho Patron badge assigned successfully:', badge);
      }
      
      // Show the modal
      console.log('🔍 Showing Wacho modal...');
      setShowWachoModal(true);
    } catch (err) {
      console.error('❌ Exception in handleApadrinarWacho:', err);
      // Still show modal even if there's an error
      setShowWachoModal(true);
    }
  };

  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      {/* Save The Wacho Banner - Only visible for logged in users */}
      {user && (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/70 to-slate-800/60 backdrop-blur-sm border-b border-slate-600/30">
          {/* Static background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-slate-500/5 to-primary-500/5"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-500/10 to-slate-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-500/10 to-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/5 to-slate-500/5 rounded-full blur-2xl"></div>
          
          {/* Content container with relative positioning */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left side - Profile and info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="relative group">
                  <div className={`${isMobile ? 'w-32 h-32' : 'w-40 h-40'} rounded-2xl overflow-hidden border-2 border-primary-400/50 shadow-2xl group-hover:border-primary-300/80 transition-all duration-500`}>
                    <img 
                      src={(() => {
                        const url = supabase.storage.from('frontimages').getPublicUrl('wacho4.png').data.publicUrl;
                        console.log('🔗 Generated URL for wacho4.png:', url);
                        return url;
                      })()}
                      alt="Wacho"
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('✅ Wacho4.png loaded successfully')}
                      onError={(e) => {
                        console.error('❌ Error loading wacho4.png:', e);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 via-slate-600 to-primary-600 flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-3xl">🎸</span>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-ping">
                    <span className="text-xs">🔥</span>
                  </div>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Save The Wacho
                    </h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">
                      URGENTE
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
                  Apadrina al Wacho en tu tienda campaña y encárgate de sus necesidades básicas para que sobreviva.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-slate-400">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Verificado</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>Comunidad Festivalera</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Sponsorship options and button */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2">🎯 Misión: Supervivencia</div>
                  <div className="text-sm text-white mb-3">Apadrina al Wacho en tu tienda campaña</div>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-sm text-white font-medium">
                    <div className="flex items-center justify-center space-x-1">
                      <span>🥃</span>
                      <span>Dale Whisky</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span>💊</span>
                      <span>Dale M</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleApadrinarWacho}
                  className="group relative bg-gradient-to-r from-primary-600 via-slate-600 to-primary-700 hover:from-primary-700 hover:via-slate-700 hover:to-primary-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-primary-500/50 flex items-center space-x-3 border-2 border-primary-400/30 hover:border-primary-300/50 w-full sm:w-auto justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400/30 via-slate-400/30 to-primary-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                  <span className="relative z-10 text-xl sm:text-2xl animate-bounce">🤝</span>
                  <span className="relative z-10 text-base sm:text-lg">{isMobile ? '¡Apadrinar!' : '¡Quiero apadrinar al Wacho!'}</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full animate-ping"></div>
                </button>
              </div>
            </div>
           
          </div>
        </div>
      )}
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center mb-4">
              <a href="/" className="flex items-center space-x-2 select-none">
                <span className="text-2xl sm:text-3xl">🎸</span>
                {!isMobile && (
                  <span className="flex items-center">
                    <span className="gradient-text text-xl sm:text-2xl lg:text-3xl font-bold leading-none">Festival</span>
                    <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-none mx-1">&</span>
                    <span className="gradient-text text-xl sm:text-2xl lg:text-3xl font-bold leading-none">Friends</span>
                  </span>
                )}
                {isMobile && (
                  <span className="gradient-text text-lg font-bold">F&F</span>
                )}
              </a>
            </div>
            <p className="text-slate-400 mb-4 max-w-md text-sm sm:text-base">
              La red social definitiva para amantes de la música. Conecta con tus amigos, descubre festivales épicos 
              y vive la experiencia musical como nunca antes.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-slate-500 hover:text-primary-400 transition-colors">
                <Users className="h-4 w-4" />
                <span className="text-sm">Comunidad</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 hover:text-primary-400 transition-colors">
                <Music className="h-4 w-4" />
                <span className="text-sm">Música</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 hover:text-primary-400 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Pasión</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="mr-2">🔗</span>
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/friends" 
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm flex items-center"
                >
                  <Users className="h-3 w-3 mr-2" />
                  Amigos
                </a>
              </li>
              <li>
                <a 
                  href="/festivals" 
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm flex items-center"
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  Festivales
                </a>
              </li>
              <li>
                <a 
                  href="/connections" 
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm flex items-center"
                >
                  <MapPin className="h-3 w-3 mr-2" />
                  Conexiones
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Soporte
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm flex items-center"
                  onClick={() => {
                    // TODO: Implement contact modal
                    console.log('Contact support');
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Contacto
                </button>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm"
                >
                  Ayuda
                </a>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const faqSection = document.querySelector('#faq-section');
                    if (faqSection) {
                      faqSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="text-slate-400 hover:text-primary-400 transition-colors text-sm cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
              &copy; {currentYear} Festival&Friends. By JaviMurcia con 
              <Heart className="inline-block h-3 w-3 sm:h-4 sm:w-4 mx-2 mb-1 text-red-500" /> 
              para la crew festivalera.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleScrollToTop}
              className="text-slate-400 hover:text-primary-400 transition-colors p-2 rounded-lg hover:bg-slate-800/50"
              aria-label="Volver arriba"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Wacho Modal */}
      <WachoModal 
        isOpen={showWachoModal} 
        onClose={() => setShowWachoModal(false)}
        onBadgeEarned={(badge) => {
          // Aquí se guardaría la insignia en la base de datos
          console.log('Insignia ganada:', badge);
          // También se podría mostrar una notificación
        }}
      />

    </footer>
  );
};

export default Footer; 