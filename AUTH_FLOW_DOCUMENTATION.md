# Flujo de Autenticación y Perfiles de Usuario

## Problema Resuelto
Los usuarios se creaban en `auth.users` pero no en `public.users`, causando errores en la aplicación.

## Solución Implementada

### 1. Trigger Automático
Se creó un trigger que automáticamente crea el perfil en `public.users` cuando se crea un usuario en `auth.users`:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Función de Sincronización
Se creó una función para sincronizar usuarios existentes que no tenían perfil:

```sql
SELECT public.sync_missing_user_profiles();
```

### 3. Verificación Automática
La función `getUserProfile()` ahora verifica automáticamente si existe el perfil y lo crea si es necesario.

## Flujo Completo de Registro

### 1. Usuario se Registra
```javascript
const { data, error } = await signUp(email, password, userData);
```

### 2. Se Crean Metadatos
```javascript
const userMetadata = {
  name: userData.name || 'Usuario Rock',
  nickname: userData.nickname || email.split('@')[0],
  city: userData.city || 'Tu Ciudad',
  // ... otros campos
};
```

### 3. Se Crea Usuario en Auth
```javascript
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${getRedirectUrl()}/auth/callback`,
    data: userMetadata // Se pasan al trigger
  }
});
```

### 4. Trigger Crea Perfil Automáticamente
El trigger `on_auth_user_created` se ejecuta y crea el perfil en `public.users` usando los metadatos.

### 5. Verificación de Creación
```javascript
// Esperar a que el trigger se ejecute
await new Promise(resolve => setTimeout(resolve, 1000));

// Verificar que el perfil se creó
const { data: profile } = await getUserProfile(data.user.id);
```

### 6. Fallback Manual (si es necesario)
Si el trigger falla, se intenta crear el perfil manualmente.

## Flujo de Inicio de Sesión

### 1. Usuario Inicia Sesión
```javascript
const { data, error } = await signIn(email, password);
```

### 2. Obtener Perfil
```javascript
const { data: profile } = await getUserProfile(data.user.id);
```

### 3. Verificación Automática
Si el perfil no existe, `getUserProfile()` automáticamente:
- Llama a `ensure_user_profile()` en la base de datos
- Crea el perfil usando los metadatos del usuario
- Retorna el perfil creado

## Funciones Principales

### `signUp(email, password, userData)`
- Crea usuario en Auth con metadatos
- El trigger crea automáticamente el perfil
- Verifica que el perfil se creó correctamente
- Fallback manual si es necesario

### `getUserProfile(userId)`
- Busca el perfil del usuario
- Si no existe, lo crea automáticamente
- Retorna el perfil

### `syncUserProfile(user, defaultData)`
- Sincroniza usuarios existentes
- Usa metadatos del usuario si están disponibles
- Crea perfil con datos por defecto

## Base de Datos

### Tabla `public.users`
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  city TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  instagram TEXT,
  twitter TEXT,
  nexus_person TEXT,
  key_phrase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger `on_auth_user_created`
- Se ejecuta después de INSERT en `auth.users`
- Crea automáticamente el perfil en `public.users`
- Usa los metadatos del usuario
- Maneja errores sin fallar la creación del usuario

### Función `ensure_user_profile(user_uuid)`
- Verifica si existe el perfil
- Lo crea si no existe
- Usa metadatos del usuario de Auth
- Retorna TRUE si se creó o ya existía

## Manejo de Errores

### Errores de Trigger
- Se loguean pero no fallan la creación del usuario
- Se intenta creación manual como fallback

### Errores de Sincronización
- Se loguean individualmente
- No afectan otros usuarios

### Errores de Verificación
- Se manejan en `getUserProfile()`
- Se intenta crear el perfil automáticamente

## Estadísticas Actuales
- **Usuarios en Auth**: 17
- **Usuarios en public.users**: 17
- **Usuarios sincronizados**: 16 (se sincronizaron automáticamente)

## Pruebas Recomendadas

1. **Registro de nuevo usuario**
   - Verificar que se crea en Auth
   - Verificar que se crea en public.users
   - Verificar que los datos son correctos

2. **Inicio de sesión de usuario existente**
   - Verificar que se obtiene el perfil
   - Verificar que no hay errores

3. **Usuario sin perfil**
   - Verificar que se crea automáticamente
   - Verificar que se usan los metadatos

## Mantenimiento

### Sincronización Periódica
```sql
-- Ejecutar periódicamente para usuarios nuevos
SELECT public.sync_missing_user_profiles();
```

### Verificación de Integridad
```sql
-- Verificar usuarios sin perfil
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

## Flujo de Eliminación de Usuarios

### Trigger de Eliminación
Cuando se elimina un usuario de `auth.users`, automáticamente se eliminan:

1. **Perfil del usuario** en `public.users`
2. **Asistencias a festivales** en `festival_attendances`
3. **Notificaciones** en `notifications`
4. **Respuestas de encuestas** en `survey_responses`
5. **Badges del usuario** en `user_badges`
6. **Votos de badges** en `badge_votes`

### Función de Eliminación Segura
```javascript
const { error } = await deleteUser(userId);
```

Esta función:
- Elimina archivos del usuario (avatars)
- Elimina el usuario de `auth.users`
- El trigger se encarga del resto automáticamente

### Componente de Administración
`UserManagementModal.jsx` proporciona una interfaz para:
- Ver todos los usuarios
- Eliminar usuarios de forma segura
- Confirmación antes de eliminar
- Solo accesible para superadmin

## Notas Importantes

- El trigger es **SECURITY DEFINER** para poder insertar en `public.users`
- Los metadatos se pasan en `signUp()` para que el trigger los use
- La verificación automática evita errores en la aplicación
- El fallback manual asegura que siempre se cree el perfil
- **La eliminación es irreversible** - se eliminan todos los datos asociados 