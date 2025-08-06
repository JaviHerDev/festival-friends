import { useState, useEffect, useRef } from 'react';
import { 
  UserIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  HandRaisedIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';

const ConnectionsTree = () => {
  const { users, loadUsers, user, userProfile, setProfileModalOpen, isLoading: authLoading, forceAuthCheck } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Start at origin to show complete grid
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);
  const [isCentering, setIsCentering] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(true);
  const containerRef = useRef(null);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const initUsers = async () => {
      if (user && !authLoading) {
        await loadUsers();
        setIsLoading(false);
      } else if (!user && !authLoading) {
        // Si no hay usuario y la autenticación ya terminó, intentar forzar verificación
        await forceAuthCheck();
      }
    };
    
    initUsers();
  }, [user, authLoading, forceAuthCheck]);

  // Auto-center on current user when data loads
  useEffect(() => {
    if (user && users.length > 0 && autoCenter) {
      centerOnUser(user.id);
    } else if (users.length > 0) {
      // If no auto-center, at least show the complete grid
      resetView();
    }
  }, [users, user, autoCenter]);

  // Ensure grid is visible when component mounts
  useEffect(() => {
    if (!isLoading && users.length > 0 && containerRef.current) {
      // Small delay to ensure container dimensions are available
      setTimeout(() => {
        resetView();
      }, 100);
    }
  }, [isLoading, users.length]);

  const centerOnUser = (userId) => {
    if (!userId) {
      console.log('⚠️ No user ID provided for centering');
      return;
    }

    console.log('🎯 Centering on user:', userId);
    setIsCentering(true);
    
    // Build the tree first
    const tree = buildConnectionsTree();
    
    // Find user position in tree and center on it
    const findUserPosition = (nodes, targetId, x = 0, y = 0, level = 0) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Check if this is the target user
        if (node.id === targetId) {
          console.log('✅ Found user at position:', { x, y, level });
          
          // Calculate center position
          const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
          const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
          
          const centerX = (containerWidth / 2) - (x + 110); // 110 = half of card width
          const centerY = (containerHeight / 2) - (y + 45);  // 45 = half of card height
          
          console.log('🎯 Centering to:', { centerX, centerY });
          
          setPan({ x: centerX, y: centerY });
          setZoom(1);
          return true;
        }
        
        // If this node has children, search in them
        if (node.children && node.children.length > 0) {
          // Expand this node if it's not already expanded
          if (!expandedNodes.has(node.id)) {
            console.log('📂 Expanding node to find user:', node.name);
            const newExpanded = new Set(expandedNodes);
            newExpanded.add(node.id);
            setExpandedNodes(newExpanded);
          }
          
          // Calculate child position
          const childX = x + (isMobile ? 180 : 280); // levelSpacing
          const childY = y + (i * (isMobile ? 90 : 140)); // nodeSpacing
          
          const found = findUserPosition(node.children, targetId, childX, childY, level + 1);
          if (found) return true;
        }
      }
      return false;
    };
    
    const found = findUserPosition(tree, userId);
    
    if (!found) {
      console.log('❌ User not found in tree:', userId);
      // If user not found, try to reset view
      resetView();
    }
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsCentering(false);
    }, 500);
  };

  const handleToggleNode = (userId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildConnectionsTree = () => {
    if (!users.length) return [];

    console.log('🔍 Building connections tree with users:', users.map(u => ({ id: u.id, name: u.name, nexus_person: u.nexus_person })));

    // Create a map of users by their nexus_person
    const nexusMap = new Map();
    const rootUsers = [];
    const allUsersWithNexus = [];
    const allUsers = new Set();

    users.forEach(user => {
      allUsers.add(user.name);
      if (user.nexus_person) {
        allUsersWithNexus.push(user);
        if (!nexusMap.has(user.nexus_person)) {
          nexusMap.set(user.nexus_person, []);
        }
        nexusMap.get(user.nexus_person).push(user);
      } else {
        // Users without nexus_person are root nodes
        rootUsers.push(user);
      }
    });

    console.log('📊 Root users:', rootUsers.map(u => u.name));
    console.log('🔗 Users with nexus:', allUsersWithNexus.map(u => ({ name: u.name, nexus: u.nexus_person })));
    console.log('🗺️ Nexus map:', Object.fromEntries(nexusMap));

    // If no root users but we have users with nexus_person, create a virtual root
    if (rootUsers.length === 0 && allUsersWithNexus.length > 0) {
      console.log('⚠️ No root users found, creating virtual root');
      
      // Find users who are not referenced as nexus_person by anyone else
      const referencedUsers = new Set();
      allUsersWithNexus.forEach(user => {
        if (user.nexus_person) {
          referencedUsers.add(user.nexus_person);
        }
      });

      console.log('📋 Referenced users:', Array.from(referencedUsers));

      // Users who are not referenced by others become root nodes
      allUsersWithNexus.forEach(user => {
        if (!referencedUsers.has(user.name)) {
          console.log('🌱 Adding as root:', user.name, '(not referenced by others)');
          rootUsers.push(user);
        } else {
          console.log('🔗 Not adding as root:', user.name, '(referenced by others)');
        }
      });

      // If still no root users (circular references), use the first user as root
      if (rootUsers.length === 0 && allUsersWithNexus.length > 0) {
        console.log('🔄 Circular references detected, using first user as root');
        rootUsers.push(allUsersWithNexus[0]);
      }

      console.log('🌱 Final root users:', rootUsers.map(u => u.name));
    }

    // Build tree structure with improved logic
    const buildTree = (user, level = 0, visited = new Set()) => {
      // Prevent infinite loops
      if (visited.has(user.id)) {
        console.log('⚠️ Circular reference detected for user:', user.name);
        return {
          ...user,
          children: [],
          level,
          hasCircularReference: true
        };
      }

      visited.add(user.id);
      const children = nexusMap.get(user.name) || [];
      
      const result = {
        ...user,
        children: children.map(child => buildTree(child, level + 1, new Set(visited))),
        level
      };

      visited.delete(user.id);
      return result;
    };

    // Build the main tree
    const tree = rootUsers.map(rootUser => buildTree(rootUser));
    
    // Track all users that are already included in the tree
    const includedUsers = new Set();
    const addIncludedUsers = (node) => {
      includedUsers.add(node.id); // Use ID instead of name to avoid duplicates
      node.children.forEach(addIncludedUsers);
    };
    
    tree.forEach(addIncludedUsers);

    // Only add truly orphaned users (users with nexus_person but not in the tree)
    const orphanedUsers = users.filter(user => 
      user.nexus_person && !includedUsers.has(user.id)
    );

    if (orphanedUsers.length > 0) {
      console.log('🔍 Found orphaned users:', orphanedUsers.map(u => u.name));
      
      // Create a separate tree for orphaned users
      orphanedUsers.forEach(orphanedUser => {
        const orphanedTree = buildTree(orphanedUser);
        tree.push(orphanedTree);
      });
    }

    console.log('🌳 Final tree:', tree);
    return tree;
  };

  const filterTree = (tree, searchTerm) => {
    if (!searchTerm) return tree;

    const matchesSearch = (node) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        node.name.toLowerCase().includes(searchLower) ||
        (node.nickname && node.nickname.toLowerCase().includes(searchLower)) ||
        (node.city && node.city.toLowerCase().includes(searchLower)) ||
        (node.nexus_person && node.nexus_person.toLowerCase().includes(searchLower))
      );
    };

    const filterNode = (node) => {
      const matches = matchesSearch(node);
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(child => child !== null);

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      return null;
    };

    return tree.map(node => filterNode(node)).filter(node => node !== null);
  };

  // Enhanced mouse and touch handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  // Enhanced touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Enhanced pinch to zoom for mobile
  const handleTouchStartMulti = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setDragStart({ distance, x: 0, y: 0 });
    }
  };

  const handleTouchMoveMulti = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (dragStart.distance) {
        const scale = distance / dragStart.distance;
        setZoom(prev => Math.max(0.3, Math.min(3, prev * scale)));
        setDragStart(prev => ({ ...prev, distance }));
      }
    }
  };

  const resetView = () => {
    // Reset to show the complete container with grid
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setAutoCenter(true);
    
    console.log('🎯 Resetting view to show complete grid');
  };

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (nodes) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(filteredTree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.3, prev * 0.8));
  };

  const connectionsTree = buildConnectionsTree();
  const filteredTree = filterTree(connectionsTree, searchTerm);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-300">Verificando autenticación...</p>
      </div>
    );
  }

  // Show message if no user is authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Inicia sesión para ver el árbol de conexiones
        </h3>
        <p className="text-slate-500">
          Necesitas estar autenticado para acceder a esta funcionalidad
        </p>
      </div>
    );
  }

  // Show loading while userProfile is being loaded
  if (user && !userProfile && !authLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-300">Cargando tu perfil...</p>
      </div>
    );
  }

  // Show message if user doesn't have nexus_person configured
  if (user && userProfile && !userProfile.nexus_person) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Necesitas configurar tu Persona Nexo
        </h3>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-slate-300 text-lg">
            Para poder visualizarte en el árbol de conexiones, necesitas especificar quién te introdujo en la comunidad.
          </p>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-left">
            <h4 className="text-lg font-semibold text-white mb-3">📋 ¿Cómo configurar tu Persona Nexo?</h4>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start space-x-3">
                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Ve a tu <strong>perfil de usuario</strong> haciendo clic en tu avatar en la esquina superior derecha</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Busca la sección <strong>"Persona Nexo"</strong> en tu perfil</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Escribe el <strong>nombre o nickname</strong> de la persona que te introdujo en Festival&Friends</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Guarda los cambios y <strong>vuelve aquí</strong> para ver tu posición en el árbol</span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              💡 <strong>Consejo:</strong> Si no recuerdas quién te introdujo o eres uno de los fundadores, 
              puedes escribir tu propio nombre o "Fundador" en el campo de Persona Nexo.
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              🌳 <strong>¿Qué es el Árbol de Conexiones?</strong> Es una visualización de cómo se conectan 
              todos los miembros de la comunidad, mostrando quién introdujo a quién en Festival&Friends.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors border border-primary-500 hover:border-primary-400 flex items-center space-x-2"
            >
              <UserIcon className="h-5 w-5" />
              <span>Ir a Mi Perfil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🌳 <span className="gradient-text">Árbol de Conexiones</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Visualiza cómo se conectan los miembros de la crew
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, nickname, ciudad o nexo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setExpandedNodes(new Set());
              setSearchTerm('');
              resetView();
            }}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Reiniciar</span>
          </button>
          
          <button
            onClick={() => {
              setIsLoading(true);
              loadUsers().then(() => setIsLoading(false));
            }}
            className="px-4 py-2 bg-primary-600/50 hover:bg-primary-600/70 text-white font-medium rounded-lg transition-colors border border-primary-500/50 hover:border-primary-400/50 flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Recargar Datos</span>
          </button>

          {/* Mobile Controls Toggle */}
          {isMobile && (
            <button
              onClick={() => setShowMobileControls(!showMobileControls)}
              className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white font-medium rounded-lg transition-colors border border-purple-500/50 hover:border-purple-400/50 flex items-center space-x-2"
            >
              <HandRaisedIcon className="h-4 w-4" />
              <span>Controles</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Tree Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={expandAll}
          className="px-3 py-1 bg-green-600/50 hover:bg-green-600/70 text-white text-sm font-medium rounded-lg transition-colors border border-green-500/50 hover:border-green-400/50 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Expandir Todo</span>
        </button>
        
        <button
          onClick={collapseAll}
          className="px-3 py-1 bg-red-600/50 hover:bg-red-600/70 text-white text-sm font-medium rounded-lg transition-colors border border-red-500/50 hover:border-red-400/50 flex items-center space-x-2"
        >
          <MinusIcon className="h-4 w-4" />
          <span>Colapsar Todo</span>
        </button>
        
        <button
          onClick={resetView}
          className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600/70 text-white text-sm font-medium rounded-lg transition-colors border border-blue-500/50 hover:border-blue-400/50 flex items-center space-x-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Resetear Vista</span>
        </button>

        <button
          onClick={() => {
            if (user && user.id) {
              centerOnUser(user.id);
            } else {
              console.log('⚠️ No user available for centering');
            }
          }}
          disabled={!user || !user.id || isCentering}
          className={`px-3 py-1 text-white text-sm font-medium rounded-lg transition-colors border flex items-center space-x-2 ${
            user && user.id && !isCentering
              ? 'bg-yellow-600/50 hover:bg-yellow-600/70 border-yellow-500/50 hover:border-yellow-400/50' 
              : 'bg-slate-600/50 border-slate-500/50 cursor-not-allowed opacity-50'
          }`}
        >
          {isCentering ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
          <span>{isCentering ? 'Centrando...' : 'Mi Posición'}</span>
        </button>
        
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <span className="text-sm text-slate-300">Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Mobile Zoom Controls */}
      {isMobile && showMobileControls && (
        <div className="flex items-center justify-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <button
            onClick={zoomOut}
            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50"
          >
            <ArrowsPointingInIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={resetView}
            className="px-4 py-3 bg-primary-600/50 hover:bg-primary-600/70 text-white font-medium rounded-lg transition-colors border border-primary-500/50 hover:border-primary-400/50"
          >
            Centrar
          </button>
          
          <button
            onClick={zoomIn}
            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50"
          >
            <ArrowsPointingOutIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando conexiones...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTree.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No se encontraron conexiones' : 'No hay conexiones aún'}
          </h3>
          <p className="text-slate-500">
            {searchTerm 
              ? 'Prueba con otros términos de búsqueda'
              : 'Los usuarios aparecerán aquí cuando se conecten entre sí'
            }
          </p>
        </div>
      )}

      {/* Enhanced Visual Tree Container */}
      {!isLoading && filteredTree.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Árbol Visual de Conexiones
                </h2>
                <p className="text-sm text-slate-400">
                  <span className="hidden md:inline">Arrastra para mover, rueda para hacer zoom, haz clic en los nodos para expandir</span>
                  <span className="md:hidden">Toca y arrastra para mover, pellizca para hacer zoom, toca los nodos para expandir</span>
                </p>
              </div>
              
              {/* Mobile Help Toggle */}
              {isMobile && (
                <button
                  onClick={() => setShowUserDetails(!showUserDetails)}
                  className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm font-medium rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
                >
                  {showUserDetails ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span>Ayuda</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Help Panel */}
          {isMobile && showUserDetails && (
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Tu posición</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Seleccionado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Conexiones</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400">💡 <strong>Consejos:</strong></p>
                  <p className="text-slate-400 text-xs">• Toca y arrastra para mover el árbol</p>
                  <p className="text-slate-400 text-xs">• Pellizca para hacer zoom</p>
                  <p className="text-slate-400 text-xs">• Toca los nodos para expandir</p>
                  <p className="text-slate-400 text-xs">• Usa "Mi Posición" para centrarte</p>
                </div>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef}
            className={`relative w-full h-[400px] md:h-[600px] overflow-hidden ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            } touch-none select-none`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={(e) => {
              handleTouchStart(e);
              handleTouchStartMulti(e);
            }}
            onTouchMove={(e) => {
              handleTouchMove(e);
              handleTouchMoveMulti(e);
            }}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center'
              }}
            >
              <VisualTree 
                data={filteredTree} 
                expandedNodes={expandedNodes}
                onToggleNode={handleToggleNode}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                currentUserId={user?.id}
                isMobile={isMobile}
              />
            </div>
            
            {/* Floating Controls in Corner */}
            {showFloatingControls && (
              <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} flex flex-col space-y-1 z-10`}>
                {/* Zoom Controls */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={zoomIn}
                    className={`${isMobile ? 'p-1.5' : 'p-2'} bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm shadow-lg`}
                    title="Zoom In"
                  >
                    <PlusIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </button>
                  <button
                    onClick={zoomOut}
                    className={`${isMobile ? 'p-1.5' : 'p-2'} bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm shadow-lg`}
                    title="Zoom Out"
                  >
                    <MinusIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </button>
                </div>
                
                {/* View Controls */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={resetView}
                    className={`${isMobile ? 'p-1.5' : 'p-2'} bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-lg transition-all duration-200 border border-blue-500/50 hover:border-blue-400/50 backdrop-blur-sm shadow-lg`}
                    title="Reset View"
                  >
                    <ArrowPathIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </button>
                  <button
                    onClick={() => {
                      if (user && user.id) {
                        centerOnUser(user.id);
                      }
                    }}
                    disabled={!user || !user.id || isCentering}
                    className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg transition-all duration-200 border backdrop-blur-sm shadow-lg ${
                      user && user.id && !isCentering
                        ? 'bg-yellow-600/80 hover:bg-yellow-500/80 text-white border-yellow-500/50 hover:border-yellow-400/50'
                        : 'bg-slate-600/80 text-slate-400 border-slate-500/50 cursor-not-allowed'
                    }`}
                    title="My Position"
                  >
                    {isCentering ? (
                      <div className={`animate-spin ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} border-2 border-white border-t-transparent rounded-full`} />
                    ) : (
                      <UserIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    )}
                  </button>
                </div>
                
                {/* Tree Controls - Only show on desktop */}
                {!isMobile && (
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={expandAll}
                      className="p-2 bg-green-600/80 hover:bg-green-500/80 text-white rounded-lg transition-all duration-200 border border-green-500/50 hover:border-green-400/50 backdrop-blur-sm shadow-lg"
                      title="Expand All"
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={collapseAll}
                      className="p-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg transition-all duration-200 border border-red-500/50 hover:border-red-400/50 backdrop-blur-sm shadow-lg"
                      title="Collapse All"
                    >
                      <ArrowsPointingInIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Toggle Controls Button */}
            <button
              onClick={() => setShowFloatingControls(!showFloatingControls)}
              className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} p-2 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm shadow-lg z-10`}
              title={showFloatingControls ? "Hide Controls" : "Show Controls"}
            >
              <HandRaisedIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </button>
            
            {/* Zoom Level Indicator */}
            <div className={`absolute ${isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'} bg-slate-800/80 text-white ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} rounded-lg border border-slate-600/50 backdrop-blur-sm shadow-lg z-10`}>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats - Moved below the tree */}
      {!isLoading && filteredTree.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            📊 Estadísticas del Árbol
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl text-primary-400 mb-2">👥</div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-slate-500">Total Miembros</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl text-purple-400 mb-2">🔗</div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.nexus_person).length}
              </div>
              <div className="text-sm text-slate-500">Conexiones</div>
            </div>

            <div className="card text-center">
              <div className="text-2xl text-green-400 mb-2">🌱</div>
              <div className="text-2xl font-bold">
                {connectionsTree.length}
              </div>
              <div className="text-sm text-slate-500">Raíces</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Visual Tree Component
const VisualTree = ({ data, expandedNodes, onToggleNode, selectedUser, onSelectUser, currentUserId, isMobile }) => {
  const renderNode = (node, x = 0, y = 0, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isCurrentUser = currentUserId && node.id === currentUserId;
    const isSelected = selectedUser && selectedUser.id === node.id;

    // Enhanced responsive sizing with better proportions
    const nodeWidth = isMobile ? 160 : 220;
    const nodeHeight = isMobile ? 70 : 90;
    const levelSpacing = isMobile ? 180 : 280;
    const nodeSpacing = isMobile ? 90 : 140;

    return (
      <g key={node.id}>
        {/* Direct connection lines from border to border */}
        {hasChildren && isExpanded && node.children.map((child, index) => {
          const childX = x + levelSpacing;
          const childY = y + (index * nodeSpacing);
          
          // Calculate the shortest path between cards (borde a borde)
          const parentCenterX = x + nodeWidth / 2;
          const parentCenterY = y + nodeHeight / 2;
          const childCenterX = childX + nodeWidth / 2;
          const childCenterY = childY + nodeHeight / 2;
          
          // Determine optimal connection points based on relative positions
          let startX, startY, endX, endY;
          
          if (childCenterY > parentCenterY + 20) {
            // Child is significantly below parent - connect from bottom of parent to top of child
            startX = parentCenterX;
            startY = y + nodeHeight;
            endX = childCenterX;
            endY = childY;
          } else if (childCenterY < parentCenterY - 20) {
            // Child is significantly above parent - connect from top of parent to bottom of child
            startX = parentCenterX;
            startY = y;
            endX = childCenterX;
            endY = childY + nodeHeight;
          } else {
            // Child is at similar level - connect horizontally from right of parent to left of child
            startX = x + nodeWidth;
            startY = parentCenterY;
            endX = childX;
            endY = childCenterY;
          }
          
          return (
            <g key={`connection-${node.id}-${child.id}`}>
              {/* Glassmorphism connection lines */}
              <defs>
                <linearGradient id={`connection-glow-${node.id}-${child.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 0.8)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.8)" />
                </linearGradient>
                <filter id={`connection-blur-${node.id}-${child.id}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
                <marker
                  id={`arrow-${node.id}-${child.id}`}
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="6"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0,0 0,12 10,6"
                    fill="rgba(16, 185, 129, 0.9)"
                  />
                </marker>
              </defs>
              
              {/* Glow effect for direct connection line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="8"
                strokeDasharray="8,4"
                filter={`url(#connection-blur-${node.id}-${child.id})`}
              />
              
              {/* Main direct connection line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={`url(#connection-glow-${node.id}-${child.id})`}
                strokeWidth="4"
                strokeDasharray="8,4"
                opacity="0.9"
              />
              
              {/* Arrow indicator at the end */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(16, 185, 129, 0.9)"
                strokeWidth="2"
                markerEnd={`url(#arrow-${node.id}-${child.id})`}
                opacity="0.8"
              />
              
              {/* Render child */}
              {renderNode(child, childX, childY, level + 1)}
            </g>
          );
        })}

        {/* Node */}
        <g
          onClick={() => onSelectUser(node)}
          className="cursor-pointer"
        >
          {/* Glassmorphism Node background */}
          <defs>
            <linearGradient id={`glass-gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isCurrentUser ? "rgba(59, 130, 246, 0.15)" : isSelected ? "rgba(139, 92, 246, 0.15)" : node.hasCircularReference ? "rgba(220, 38, 38, 0.15)" : "rgba(30, 41, 59, 0.15)"} />
              <stop offset="100%" stopColor={isCurrentUser ? "rgba(29, 78, 216, 0.25)" : isSelected ? "rgba(124, 58, 237, 0.25)" : node.hasCircularReference ? "rgba(185, 28, 28, 0.25)" : "rgba(15, 23, 42, 0.25)"} />
            </linearGradient>
            <filter id={`glass-blur-${node.id}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
          </defs>
          
          {/* Glassmorphism effect layers */}
          {/* Backdrop blur layer */}
          <rect
            x={x - 2}
            y={y - 2}
            width={nodeWidth + 4}
            height={nodeHeight + 4}
            rx="14"
            fill="rgba(255, 255, 255, 0.1)"
            filter={`url(#glass-blur-${node.id})`}
            opacity="0.3"
          />
          
          {/* Main glass card */}
          <rect
            x={x}
            y={y}
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            fill={`url(#glass-gradient-${node.id})`}
            stroke={isCurrentUser ? "rgba(96, 165, 250, 0.6)" : isSelected ? "rgba(167, 139, 250, 0.6)" : node.hasCircularReference ? "rgba(239, 68, 68, 0.6)" : "rgba(71, 85, 105, 0.6)"}
            strokeWidth="1.5"
            className="transition-all duration-200 hover:stroke-primary-400"
            style={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)"
            }}
          />
          
          {/* Glass highlight */}
          <rect
            x={x + 1}
            y={y + 1}
            width={nodeWidth - 2}
            height={nodeHeight / 2 - 1}
            rx="11"
            fill="rgba(255, 255, 255, 0.1)"
            opacity="0.3"
          />

          {/* Enhanced Avatar with better styling */}
          {node.avatar_url ? (
            <defs>
              <pattern id={`avatar-${node.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                <image href={node.avatar_url} width="40" height="40" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          ) : null}
          
          <circle
            cx={x + 25}
            cy={y + 25}
            r={isMobile ? "15" : "18"}
            fill={node.avatar_url ? `url(#avatar-${node.id})` : "#3b82f6"}
            stroke={isCurrentUser ? "#60a5fa" : "#475569"}
            strokeWidth="3"
          />

          {/* Enhanced default avatar icon */}
          {!node.avatar_url && (
            <text
              x={x + 25}
              y={y + (isMobile ? 32 : 35)}
              textAnchor="middle"
              fill="white"
              fontSize={isMobile ? "12" : "14"}
              fontWeight="bold"
            >
              {(node.name || node.nickname || 'U').charAt(0).toUpperCase()}
            </text>
          )}

          {/* Enhanced Current user indicator */}
          {isCurrentUser && (
            <g>
              <circle
                cx={x + (isMobile ? 38 : 42)}
                cy={y + (isMobile ? 15 : 18)}
                r={isMobile ? "5" : "7"}
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x + (isMobile ? 38 : 42)}
                y={y + (isMobile ? 18 : 22)}
                textAnchor="middle"
                fill="white"
                fontSize={isMobile ? "8" : "10"}
                fontWeight="bold"
              >
                ✓
              </text>
            </g>
          )}

          {/* Enhanced User name with glassmorphism text effect */}
          <text
            x={x + (isMobile ? 50 : 55)}
            y={y + (isMobile ? 18 : 22)}
            fill="rgba(255, 255, 255, 0.95)"
            fontSize={isMobile ? "10" : "13"}
            fontWeight="bold"
            className="select-none"
            style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
          >
            {isMobile && node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name}
          </text>

          {/* Enhanced Nickname with larger white text and better spacing */}
          {node.nickname && (
            <text
              x={x + (isMobile ? 50 : 55)}
              y={y + (isMobile ? 35 : 42)}
              fill="rgba(255, 255, 255, 0.95)"
              fontSize={isMobile ? "10" : "13"}
              fontWeight="600"
              className="select-none"
              style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
            >
              @{(isMobile ? node.nickname.length > 8 : node.nickname.length > 12) 
                ? node.nickname.substring(0, isMobile ? 8 : 12) + '...' 
                : node.nickname}
            </text>
          )}

          {/* Enhanced City with larger white text and better spacing */}
          {node.city && (
            <text
              x={x + (isMobile ? 50 : 55)}
              y={y + (isMobile ? 52 : 62)}
              fill="rgba(255, 255, 255, 0.9)"
              fontSize={isMobile ? "9" : "11"}
              fontWeight="500"
              className="select-none"
              style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
            >
              📍 {(isMobile ? node.city.length > 6 : node.city.length > 10) 
                ? node.city.substring(0, isMobile ? 6 : 10) + '...' 
                : node.city}
            </text>
          )}

          {/* Enhanced Connection count badge */}
          {hasChildren && (
            <g>
              <circle
                cx={x + nodeWidth - (isMobile ? 12 : 15)}
                cy={y + (isMobile ? 18 : 22)}
                r={isMobile ? "8" : "10"}
                fill="#10b981"
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={x + nodeWidth - (isMobile ? 12 : 15)}
                y={y + (isMobile ? 22 : 27)}
                textAnchor="middle"
                fill="white"
                fontSize={isMobile ? "8" : "10"}
                fontWeight="bold"
                className="select-none"
              >
                {node.children.length}
              </text>
            </g>
          )}

          {/* Enhanced expand/collapse button */}
          {hasChildren && (
            <g
              onClick={(e) => {
                e.stopPropagation();
                onToggleNode(node.id);
              }}
              className="cursor-pointer"
            >
              <circle
                cx={x + nodeWidth - (isMobile ? 12 : 15)}
                cy={y + nodeHeight - (isMobile ? 12 : 15)}
                r={isMobile ? "7" : "9"}
                fill="#475569"
                stroke="#64748b"
                strokeWidth="1"
                className="hover:fill-slate-600 transition-colors"
              />
              <text
                x={x + nodeWidth - (isMobile ? 12 : 15)}
                y={y + nodeHeight - (isMobile ? 8 : 10)}
                textAnchor="middle"
                fill="white"
                fontSize={isMobile ? "10" : "12"}
                fontWeight="bold"
                className="select-none"
              >
                {isExpanded ? "−" : "+"}
              </text>
            </g>
          )}

          {/* Status indicator for circular references */}
          {node.hasCircularReference && (
            <g>
              <circle
                cx={x + (isMobile ? 38 : 42)}
                cy={y + (isMobile ? 15 : 18)}
                r={isMobile ? "5" : "7"}
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x + (isMobile ? 38 : 42)}
                y={y + (isMobile ? 18 : 22)}
                textAnchor="middle"
                fill="white"
                fontSize={isMobile ? "8" : "10"}
                fontWeight="bold"
              >
                ⚠️
              </text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100% 100%"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Glassmorphism background */}
      <defs>
        <linearGradient id="background-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0f1a" />
          <stop offset="25%" stopColor="#1a1f2a" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="75%" stopColor="#1a1f2a" />
          <stop offset="100%" stopColor="#0a0f1a" />
        </linearGradient>
        <radialGradient id="radial-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </radialGradient>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(71, 85, 105, 0.25)" strokeWidth="1"/>
        </pattern>
        <pattern id="dots" width="25" height="25" patternUnits="userSpaceOnUse">
          <circle cx="12.5" cy="12.5" r="1.5" fill="rgba(96, 165, 250, 0.4)"/>
        </pattern>
        <filter id="background-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      
      {/* Background layers with glassmorphism */}
      <rect width="100%" height="100%" fill="url(#background-gradient)" />
      <rect width="100%" height="100%" fill="url(#radial-glow)" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />
      
      {/* Subtle glassmorphism overlay */}
      <rect width="100%" height="100%" fill="rgba(255, 255, 255, 0.02)" />
      
      {/* Render tree */}
      {data.map((node, index) => renderNode(node, 50, 50 + (index * (isMobile ? 80 : 120))))}
    </svg>
  );
};

export default ConnectionsTree; 