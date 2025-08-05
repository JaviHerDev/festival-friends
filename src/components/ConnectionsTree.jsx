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
  const { users, loadUsers, user, userProfile, isLoading: authLoading, forceAuthCheck } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);
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
    }
  }, [users, user, autoCenter]);

  const centerOnUser = (userId) => {
    // Find user position in tree and center on it
    const findUserPosition = (nodes, targetId, x = 0, y = 0) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === targetId) {
          const centerX = window.innerWidth / 2 - (x + 100);
          const centerY = window.innerHeight / 2 - (y + 40);
          setPan({ x: centerX, y: centerY });
          setZoom(1);
          return true;
        }
        if (node.children && node.children.length > 0) {
          const found = findUserPosition(node.children, targetId, x + 250, y + (i * 120));
          if (found) return true;
        }
      }
      return false;
    };
    
    findUserPosition(buildConnectionsTree());
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

    // Create a map of users by their nexus_person
    const nexusMap = new Map();
    const rootUsers = [];

    users.forEach(user => {
      if (user.nexus_person) {
        if (!nexusMap.has(user.nexus_person)) {
          nexusMap.set(user.nexus_person, []);
        }
        nexusMap.get(user.nexus_person).push(user);
      } else {
        // Users without nexus_person are root nodes
        rootUsers.push(user);
      }
    });

    // Build tree structure
    const buildTree = (user, level = 0) => {
      const children = nexusMap.get(user.name) || [];
      return {
        ...user,
        children: children.map(child => buildTree(child, level + 1)),
        level
      };
    };

    return rootUsers.map(rootUser => buildTree(rootUser));
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
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setAutoCenter(true);
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
          onClick={() => centerOnUser(user.id)}
          className="px-3 py-1 bg-yellow-600/50 hover:bg-yellow-600/70 text-white text-sm font-medium rounded-lg transition-colors border border-yellow-500/50 hover:border-yellow-400/50 flex items-center space-x-2"
        >
          <UserIcon className="h-4 w-4" />
          <span>Mi Posición</span>
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

    // Enhanced responsive sizing
    const nodeWidth = isMobile ? 140 : 200;
    const nodeHeight = isMobile ? 60 : 80;
    const levelSpacing = isMobile ? 160 : 250;
    const nodeSpacing = isMobile ? 80 : 120;

    return (
      <g key={node.id}>
        {/* Connection lines to children */}
        {hasChildren && isExpanded && node.children.map((child, index) => {
          const childX = x + levelSpacing;
          const childY = y + (index * nodeSpacing);
          
          return (
            <g key={`connection-${node.id}-${child.id}`}>
              {/* Vertical line from parent */}
              <line
                x1={x + nodeWidth / 2}
                y1={y + nodeHeight}
                x2={x + nodeWidth / 2}
                y2={y + nodeHeight + 20}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Horizontal line to child */}
              <line
                x1={x + nodeWidth / 2}
                y1={y + nodeHeight + 20}
                x2={childX + nodeWidth / 2}
                y2={childY + nodeHeight / 2}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Vertical line to child */}
              <line
                x1={childX + nodeWidth / 2}
                y1={childY}
                x2={childX + nodeWidth / 2}
                y2={childY + nodeHeight / 2}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="5,5"
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
          {/* Node background */}
          <rect
            x={x}
            y={y}
            width={nodeWidth}
            height={nodeHeight}
            rx="8"
            fill={isCurrentUser ? "#3b82f6" : isSelected ? "#8b5cf6" : "#1e293b"}
            stroke={isCurrentUser ? "#60a5fa" : isSelected ? "#a78bfa" : "#475569"}
            strokeWidth="2"
            className="transition-all duration-200 hover:stroke-primary-400"
          />

          {/* Avatar */}
          {node.avatar_url ? (
            <defs>
              <pattern id={`avatar-${node.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                <image href={node.avatar_url} width="30" height="30" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          ) : null}
          
          <circle
            cx={x + 20}
            cy={y + 20}
            r={isMobile ? "12" : "15"}
            fill={node.avatar_url ? `url(#avatar-${node.id})` : "#3b82f6"}
            stroke="#60a5fa"
            strokeWidth="2"
          />

          {/* User icon for default avatar */}
          {!node.avatar_url && (
            <text
              x={x + 20}
              y={y + (isMobile ? 25 : 30)}
              textAnchor="middle"
              fill="white"
              fontSize={isMobile ? "10" : "12"}
              fontWeight="bold"
            >
              👤
            </text>
          )}

          {/* Current user indicator */}
          {isCurrentUser && (
            <circle
              cx={x + (isMobile ? 30 : 35)}
              cy={y + (isMobile ? 12 : 15)}
              r={isMobile ? "4" : "6"}
              fill="#10b981"
              stroke="white"
              strokeWidth="1"
            />
          )}

          {/* User name */}
          <text
            x={x + (isMobile ? 40 : 50)}
            y={y + (isMobile ? 15 : 20)}
            fill="white"
            fontSize={isMobile ? "8" : "12"}
            fontWeight="bold"
            className="select-none"
          >
            {isMobile && node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name}
          </text>

          {/* Nickname - only show on larger screens */}
          {node.nickname && !isMobile && (
            <text
              x={x + 50}
              y={y + 35}
              fill="#60a5fa"
              fontSize="10"
              className="select-none"
            >
              @{node.nickname.length > 10 ? node.nickname.substring(0, 10) + '...' : node.nickname}
            </text>
          )}

          {/* City - only show on larger screens */}
          {node.city && !isMobile && (
            <text
              x={x + 50}
              y={y + 50}
              fill="#94a3b8"
              fontSize="9"
              className="select-none"
            >
              📍 {node.city.length > 8 ? node.city.substring(0, 8) + '...' : node.city}
            </text>
          )}

          {/* Connection count */}
          {hasChildren && (
            <text
              x={x + nodeWidth - 10}
              y={y + (isMobile ? 15 : 20)}
              fill="#10b981"
              fontSize={isMobile ? "8" : "10"}
              fontWeight="bold"
              textAnchor="end"
              className="select-none"
            >
              {node.children.length}
            </text>
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
                cx={x + nodeWidth - (isMobile ? 15 : 20)}
                cy={y + nodeHeight - (isMobile ? 15 : 20)}
                r={isMobile ? "6" : "8"}
                fill="#475569"
                className="hover:fill-slate-600 transition-colors"
              />
              <text
                x={x + nodeWidth - (isMobile ? 15 : 20)}
                y={y + nodeHeight - (isMobile ? 12 : 15)}
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
        </g>
      </g>
    );
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={isMobile ? "0 0 600 400" : "0 0 1200 800"}
      className="w-full h-full"
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Render tree */}
      {data.map((node, index) => renderNode(node, 50, 50 + (index * (isMobile ? 80 : 120))))}
    </svg>
  );
};

export default ConnectionsTree; 