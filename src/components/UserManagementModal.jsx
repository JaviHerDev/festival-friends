import { useState, useEffect } from 'react';
import { X, Trash2, User, AlertTriangle, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { deleteUser, userExists } from '../lib/supabase.js';

const UserManagementModal = () => {
  const { isUserManagementModalOpen, setUserManagementModalOpen, currentUser } = useStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Solo superadmin puede acceder
  if (!currentUser || currentUser.email !== 'superadmin@festivalfriends.com') {
    return null;
  }

  const handleDeleteUser = async (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    setDeletingUserId(userToDelete.id);

    try {
      const { error } = await deleteUser(userToDelete.id);
      
      if (error) {
        toast.error('Error al eliminar usuario', error.message);
      } else {
        toast.success('Usuario eliminado', 'El usuario y todos sus datos han sido eliminados correctamente.');
        // Remover de la lista local
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      }
    } catch (err) {
      toast.error('Error inesperado', 'Ha ocurrido un error al eliminar el usuario.');
    } finally {
      setIsLoading(false);
      setDeletingUserId(null);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleClose = () => {
    setUserManagementModalOpen(false);
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  if (!isUserManagementModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={handleClose}>
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  Gestión de Usuarios
                </h2>
                <p className="text-slate-400 text-sm">
                  Administra usuarios del sistema (Solo SuperAdmin)
                </p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{user.name || 'Usuario'}</h3>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <p className="text-slate-500 text-xs">ID: {user.id}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={isLoading && deletingUserId === user.id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading && deletingUserId === user.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">No hay usuarios para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Confirmar Eliminación</h3>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-slate-300 mb-2">
                ¿Estás seguro de que quieres eliminar al usuario:
              </p>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-white font-medium">{userToDelete.name || 'Usuario'}</p>
                <p className="text-slate-400 text-sm">{userToDelete.email}</p>
              </div>
              <p className="text-red-400 text-sm mt-2">
                Se eliminarán todos los datos asociados: perfil, asistencias, notificaciones, etc.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementModal; 