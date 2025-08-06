import { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';

const ConnectionsDebug = () => {
  const { users, loadUsers, user } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUsers = async () => {
      if (user) {
        await loadUsers();
        setIsLoading(false);
      }
    };
    
    initUsers();
  }, [user, loadUsers]);

  const buildConnectionsTree = () => {
    if (!users.length) return [];

    console.log('🔍 Building connections tree with users:', users.map(u => ({ id: u.id, name: u.name, nexus_person: u.nexus_person })));

    // Create a map of users by their nexus_person
    const nexusMap = new Map();
    const rootUsers = [];
    const allUsersWithNexus = [];

    users.forEach(user => {
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

      // Users who are not referenced by others become root nodes
      allUsersWithNexus.forEach(user => {
        if (!referencedUsers.has(user.name)) {
          rootUsers.push(user);
        }
      });

      // If still no root users (circular references), use the first user as root
      if (rootUsers.length === 0 && allUsersWithNexus.length > 0) {
        console.log('🔄 Circular references detected, using first user as root');
        rootUsers.push(allUsersWithNexus[0]);
      }

      console.log('🌱 New root users:', rootUsers.map(u => u.name));
    }

    // Build tree structure
    const buildTree = (user, level = 0) => {
      const children = nexusMap.get(user.name) || [];
      return {
        ...user,
        children: children.map(child => buildTree(child, level + 1)),
        level
      };
    };

    const tree = rootUsers.map(rootUser => buildTree(rootUser));
    console.log('🌳 Final tree:', tree);
    return tree;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-300">Cargando datos de debug...</p>
      </div>
    );
  }

  const connectionsTree = buildConnectionsTree();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🐛 <span className="gradient-text">Debug de Conexiones</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Información detallada de usuarios y conexiones
        </p>
      </div>

      {/* Users Data */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">👥 Datos de Usuarios ({users.length})</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong className="text-primary-400">ID:</strong> {user.id}
                </div>
                <div>
                  <strong className="text-primary-400">Nombre:</strong> {user.name}
                </div>
                <div>
                  <strong className="text-primary-400">Nickname:</strong> {user.nickname || 'N/A'}
                </div>
                <div>
                  <strong className="text-primary-400">Email:</strong> {user.email}
                </div>
                <div>
                  <strong className="text-primary-400">Ciudad:</strong> {user.city || 'N/A'}
                </div>
                <div>
                  <strong className="text-primary-400">Nexus Person:</strong> 
                  <span className={user.nexus_person ? 'text-green-400' : 'text-red-400'}>
                    {user.nexus_person || 'No configurado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Analysis */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🔗 Análisis de Conexiones</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-400 mb-3">Estadísticas</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Total usuarios:</span>
                <span className="text-white font-semibold">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Con nexus_person:</span>
                <span className="text-green-400 font-semibold">
                  {users.filter(u => u.nexus_person).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Sin nexus_person:</span>
                <span className="text-red-400 font-semibold">
                  {users.filter(u => !u.nexus_person).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Raíces del árbol:</span>
                <span className="text-blue-400 font-semibold">
                  {connectionsTree.length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary-400 mb-3">Mapeo de Conexiones</h3>
            <div className="space-y-2">
              {users.filter(u => u.nexus_person).map(user => (
                <div key={user.id} className="text-sm">
                  <span className="text-slate-300">{user.name}</span>
                  <span className="text-slate-500 mx-2">→</span>
                  <span className="text-green-400">{user.nexus_person}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tree Structure */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🌳 Estructura del Árbol</h2>
        
        {connectionsTree.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌳</div>
            <h3 className="text-lg font-semibold text-white mb-2">No hay estructura de árbol</h3>
            <p className="text-slate-400">
              Esto puede deberse a que todos los usuarios tienen nexus_person configurado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connectionsTree.map((root, index) => (
              <div key={root.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <h4 className="text-lg font-semibold text-primary-400 mb-3">
                  Raíz {index + 1}: {root.name}
                </h4>
                <div className="ml-6">
                  {root.children.length === 0 ? (
                    <p className="text-slate-400">Sin conexiones</p>
                  ) : (
                    <div className="space-y-2">
                      {root.children.map(child => (
                        <div key={child.id} className="bg-slate-700/50 rounded p-2">
                          <span className="text-white">{child.name}</span>
                          {child.children.length > 0 && (
                            <span className="text-slate-400 ml-2">
                              ({child.children.length} conexiones)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Recomendaciones</h2>
        
        <div className="space-y-4">
          {users.filter(u => !u.nexus_person).length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Problema Detectado</h3>
              <p className="text-yellow-200">
                Todos los usuarios tienen nexus_person configurado. Para que el árbol funcione correctamente, 
                al menos un usuario debe estar sin nexus_person (ser una raíz) o debe haber una cadena de conexiones 
                que termine en un usuario sin referencias.
              </p>
            </div>
          )}

          {connectionsTree.length === 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">🚨 Árbol Vacío</h3>
              <p className="text-red-200">
                No se pudo construir el árbol de conexiones. Esto puede deberse a:
              </p>
              <ul className="text-red-200 mt-2 ml-4 list-disc">
                <li>Todos los usuarios tienen nexus_person configurado</li>
                <li>Referencias circulares en las conexiones</li>
                <li>Nombres de nexus_person que no coinciden con nombres de usuarios</li>
              </ul>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">🔧 Soluciones</h3>
            <ul className="text-blue-200 space-y-2">
              <li>• Asegúrate de que al menos un usuario no tenga nexus_person configurado</li>
              <li>• Verifica que los nombres en nexus_person coincidan exactamente con los nombres de usuarios</li>
              <li>• Evita referencias circulares (A → B → A)</li>
              <li>• Usa el perfil de usuario para configurar las conexiones correctamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsDebug; 