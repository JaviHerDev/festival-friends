import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/reactflow.css';
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
  EyeSlashIcon,
  FunnelIcon,
  ViewColumnsIcon,
  CpuChipIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';

// Enhanced User Node Component
  const UserNode = ({ data, selected, id }) => {
    const { user } = useStore();
    const isCurrentUser = user?.id === id;
  
  return (
                            <div 
                          className={`
                            relative group cursor-pointer transition-transform duration-200
                            ${selected ? 'scale-105' : ''}
                          `}
    >
      {/* Glow effect for current user - optimizado para móvil */}
      {isCurrentUser && (
        <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-xl" />
      )}
      
      {/* Glassmorphism Card - optimizado para móvil */}
                                <div className={`
                            relative overflow-hidden rounded-2xl p-5 min-w-[240px] max-w-[300px] h-[140px]
                            bg-slate-800/95
                            border shadow-lg
                            transition-colors duration-200
                            ${selected ? 'border-2 border-purple-500/50' : ''}
                            ${isCurrentUser ? 'border-2 border-blue-500/50' : ''}
                            ${data.level === 0 ? 'border-2 border-green-500/50' : ''}
                            ${!selected && !isCurrentUser && data.level !== 0 ? 'border border-slate-700/50' : ''}
                            
                          `}>
        
        
        
        
        {/* User Info */}
        <div className="relative z-10 flex items-start space-x-5">
          {/* Enhanced Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl
              ${data.avatar_url ? 'bg-cover bg-center' : 'bg-blue-500'}
              shadow-md border-2 border-slate-600/50
            `}
            style={data.avatar_url ? { backgroundImage: `url(${data.avatar_url})` } : {}}
            >
              {!data.avatar_url && (data.name?.charAt(0) || 'U').toUpperCase()}
            </div>
            
            {/* Connection Count Badge */}
            {data.connectionCount > 0 && (
              <div className="absolute -top-2 -left-2 w-7 h-7 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">{data.connectionCount}</span>
              </div>
            )}
          </div>
          
          {/* User Details */}
          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-base font-bold text-white truncate">
                                    {data.name}
                                  </h3>
                                  {data.level !== undefined && (
                                    <div className="flex-shrink-0 ml-2 px-2 py-1 bg-slate-700/50 rounded-full">
                                      <span className="text-xs font-medium text-slate-300">
                                        Nivel {data.level}
                                      </span>
                                    </div>
                                  )}
                                </div>
            {data.nickname && (
              <p className="text-sm text-slate-300 truncate mb-2">
                @{data.nickname}
              </p>
            )}
            {data.city && (
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-400 truncate">{data.city}</span>
              </div>
            )}
            

          </div>
        </div>
        
                                  
                        </div>
                        
                        {/* Invisible handles for connections - multiple positions for shortest path */}
                        <Handle
                          type="target"
                          position={Position.Left}
                          className="opacity-0"
                        />
                        <Handle
                          type="target"
                          position={Position.Top}
                          className="opacity-0"
                        />
                        <Handle
                          type="target"
                          position={Position.Bottom}
                          className="opacity-0"
                        />
                        <Handle
                          type="source"
                          position={Position.Right}
                          className="opacity-0"
                        />
                        <Handle
                          type="source"
                          position={Position.Top}
                          className="opacity-0"
                        />
                        <Handle
                          type="source"
                          position={Position.Bottom}
                          className="opacity-0"
                        />
                      </div>
                    );
                  };



// React Flow Wrapper Component
const ReactFlowWrapper = ({ 
  nodes, 
  edges, 
  onNodeClick, 
  onEdgeClick, 
  showBackground, 
  showMiniMap, 
  showControls,
  nodeTypes 
}) => {
  const { fitView } = useReactFlow();

  // Auto-fit view when data changes - optimizado para móvil
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 200);
    }
  }, [nodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={3}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      proOptions={{ hideAttribution: true }}
      className="bg-slate-900"
      connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '8,4' }}
      connectionLineType="straight"
      snapToGrid={false}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
    >
      {showBackground && (
        <Background
          variant="dots"
          gap={40}
          size={1}
          color="#475569"
          className="opacity-10"
        />
      )}
      
      {showControls && (
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="bg-slate-800/80 border border-slate-700/50 rounded-lg"
        />
      )}
      
      {showMiniMap && (
        <MiniMap
          nodeColor="#8b5cf6"
          nodeStrokeColor="#ffffff"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.4)"
          className="bg-slate-800/80 border border-slate-700/50 rounded-lg"
        />
      )}
      
      {/* Enhanced Panel */}
      <Panel position="top-right" className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2">
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span>Nodos: {nodes.length}</span>
          <span>Conexiones: {edges.length}</span>
        </div>
      </Panel>
    </ReactFlow>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-details-title"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl
              ${user.avatar_url ? 'bg-cover bg-center' : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600'}
              shadow-lg border-2 border-slate-600/50
            `}
            style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
            >
              {!user.avatar_url && (user.name?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div>
              <h2 id="user-details-title" className="text-xl font-bold text-white">{user.name}</h2>
              {user.nickname && (
                <p className="text-slate-400">@{user.nickname}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.city && (
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <MapPinIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Ciudad</p>
                  <p className="text-white font-medium">{user.city}</p>
                </div>
              </div>
            )}
            
            {user.nexus_person && (
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <UserIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Persona Nexo</p>
                  <p className="text-white font-medium">{user.nexus_person}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <HeartIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-400">Conexiones</p>
                <p className="text-white font-medium">{user.connectionCount || 0}</p>
                <p className="text-xs text-slate-500">Usuarios introducidos</p>
              </div>
            </div>
            
            {user.level !== undefined && (
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <StarIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Nivel en el Árbol</p>
                  <p className="text-white font-medium">Nivel {user.level}</p>
                </div>
              </div>
            )}
          </div>



          {/* Information Note */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Nota:</strong> Para editar la "Persona Nexo", ve al perfil del usuario y modifica el campo correspondiente. 
              Este esquema es solo visual y muestra las relaciones existentes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectionsTree = () => {
  const { users, loadUsers, user, userProfile, setProfileModalOpen, isLoading: authLoading, forceAuthCheck } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
      // Only grid layout available

  // Detect mobile device and optimize settings
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Optimize settings for mobile
  useEffect(() => {
    if (isMobile) {
      setShowControls(false);
      setShowMiniMap(false);
      setShowBackground(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const initUsers = async () => {
      if (user && !authLoading) {
        await loadUsers();
        setIsLoading(false);
      } else if (!user && !authLoading) {
        await forceAuthCheck();
      }
    };
    
    initUsers();
  }, [user, authLoading, forceAuthCheck]);

    // Grid layout function
  const createLayout = useCallback((users) => {
    if (!users.length) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];

    // Grid layout for better distribution - optimized for mobile
      const nodeWidth = isMobile ? 280 : 300;
      const nodeHeight = isMobile ? 120 : 140;
      const padding = isMobile ? 60 : 80;
      const cols = Math.ceil(Math.sqrt(users.length));
      const rows = Math.ceil(users.length / cols);
      
      users.forEach((user, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * (nodeWidth + padding) + 100;
        const y = row * (nodeHeight + padding) + 100;
        
        nodes.push({
          id: user.id,
          type: 'userNode',
          position: { x, y },
          data: {
          ...user,
            connectionCount: users.filter(u => u.nexus_person === user.name).length
          }
        });
      });
      
      // Create edges for grid layout with advanced distribution
      const connectionPairs = [];
      users.forEach(user => {
        if (user.nexus_person) {
          const sourceUser = users.find(u => u.name === user.nexus_person);
          if (sourceUser) {
            connectionPairs.push({ source: sourceUser, target: user });
          }
        }
      });
      
      // Group connections by source to prevent overlapping
      const connectionGroups = {};
      connectionPairs.forEach(pair => {
        const sourceId = pair.source.id;
        if (!connectionGroups[sourceId]) {
          connectionGroups[sourceId] = [];
        }
        connectionGroups[sourceId].push(pair);
      });
      
      // Create edges with layered positioning for grid
      let connectionIndex = 0;
      Object.entries(connectionGroups).forEach(([sourceId, pairs]) => {
        pairs.forEach((pair, pairIndex) => {
          const sourceNode = nodes.find(n => n.id === pair.source.id);
          const targetNode = nodes.find(n => n.id === pair.target.id);
          
          if (sourceNode && targetNode) {
            // Calculate direction and apply offset
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize direction
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            
            // Perpendicular vector for offset
            const perpX = -normalizedDy;
            const perpY = normalizedDx;
            
            // Apply offset based on connection index
            const baseOffset = 25;
            const layerOffset = pairIndex * 12;
            const totalOffset = baseOffset + layerOffset;
            
            const offsetX = perpX * totalOffset;
            const offsetY = perpY * totalOffset;
            
            // Color variants for different connections
            const colorVariants = [
              '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#f97316', '#06b6d4'
            ];
            
            const colorIndex = connectionIndex % colorVariants.length;
            const color = colorVariants[colorIndex];
            
            edges.push({
              id: `${pair.source.id}-${pair.target.id}`,
              source: pair.source.id,
              target: pair.target.id,
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: color,
                strokeWidth: 3,
                strokeDasharray: '10,5'
              },
              markerEnd: {
                type: 'arrowclosed',
                color: color,
                width: 16,
                height: 16,
                strokeWidth: 2
              }
            });
            
            connectionIndex++;
          }
        });
      });

    return {
      nodes, 
      edges 
    };
  }, []);

  // Build nodes and edges with grid layout
  const layoutResult = useMemo(() => {
    return createLayout(users);
  }, [users, createLayout]);

  const { nodes, edges } = layoutResult;

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    
    const searchLower = searchTerm.toLowerCase();
    return nodes.filter(node => 
      node.data.name?.toLowerCase().includes(searchLower) ||
      node.data.nickname?.toLowerCase().includes(searchLower) ||
      node.data.city?.toLowerCase().includes(searchLower) ||
      node.data.nexus_person?.toLowerCase().includes(searchLower)
    );
  }, [nodes, searchTerm]);

  const filteredEdges = useMemo(() => {
    if (!searchTerm) return edges;
    
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes, searchTerm]);

  // Node types - memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({
    userNode: UserNode
  }), []);

  // Handle node selection
  const handleNodeClick = useCallback((event, node) => {
    if (node.type === 'userNode') {
      setSelectedUser(node.data);
      setIsModalOpen(true);
    }
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((event, edge) => {
    console.log('Edge clicked:', edge);
  }, []);

  // Center on current user
  const centerOnCurrentUser = useCallback(() => {
    if (user?.id) {
      const userNode = filteredNodes.find(n => n.id === user.id);
      if (userNode) {
        console.log('Centering on user:', user.id);
      }
    }
  }, [user, filteredNodes]);

  // Reset view
  const resetView = useCallback(() => {
    console.log('Resetting view');
  }, []);

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
              🌳 <strong>¿Qué es el Árbol de Conexiones?</strong> Es un esquema visual que muestra las relaciones 
              entre miembros basadas en el campo "Persona Nexo". Es solo informativo y no permite editar las conexiones.
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          🌳 Árbol de Conexiones
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Visualización de las relaciones basadas en "Persona Nexo"
          </p>
        </div>
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
            <span>Recargar</span>
          </button>

          {/* Mobile Controls Toggle */}
          {isMobile && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white font-medium rounded-lg transition-colors border border-purple-500/50 hover:border-purple-400/50 flex items-center space-x-2"
            >
              <HandRaisedIcon className="h-4 w-4" />
              <span>Controles</span>
            </button>
          )}
        </div>
      </div>



      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando conexiones...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNodes.length === 0 && (
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

      {/* React Flow Container */}
      {!isLoading && filteredNodes.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                    Esquema Visual de Relaciones
                </h2>
                <p className="text-sm text-slate-400">
                    <span className="hidden md:inline">Arrastra para mover, rueda para hacer zoom, haz clic en los nodos para ver detalles</span>
                    <span className="md:hidden">Toca y arrastra para mover, pellizca para hacer zoom, toca los nodos para ver detalles</span>
                </p>
              </div>
              

                  </div>
                </div>
          
          <div className="w-full h-[700px] md:h-[800px]">
            <ReactFlowProvider>
              <ReactFlowWrapper
                nodes={filteredNodes}
                edges={filteredEdges}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                showBackground={showBackground}
                showMiniMap={showMiniMap}
                showControls={showControls}
                nodeTypes={nodeTypes}
              />
            </ReactFlowProvider>
              </div>
            </div>
          )}
          
      {/* Selected User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Enhanced Stats */}
      {!isLoading && filteredNodes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            📊 Estadísticas del Esquema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl text-primary-400 mb-2">👥</div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-slate-500">Total Miembros</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl text-purple-400 mb-2">🔗</div>
              <div className="text-2xl font-bold">{edges.length}</div>
              <div className="text-sm text-slate-500">Relaciones</div>
            </div>

            <div className="card text-center">
              <div className="text-2xl text-green-400 mb-2">🌱</div>
              <div className="text-2xl font-bold">
                {users.filter(u => !u.nexus_person).length}
              </div>
              <div className="text-sm text-slate-500">Usuarios Raíz</div>
            </div>

            <div className="card text-center">
              <div className="text-2xl text-yellow-400 mb-2">📊</div>
              <div className="text-2xl font-bold">
                {Math.round((edges.length / Math.max(users.length - 1, 1)) * 100)}%
              </div>
              <div className="text-sm text-slate-500">Cobertura</div>
            </div>
          </div>
          

        </div>
      )}
    </div>
  );
};

export default ConnectionsTree; 