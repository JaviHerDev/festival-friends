# Configuración de Autenticación Supabase para Producción

## Problema
Los enlaces de confirmación de email están redirigiendo a `localhost` en lugar de la URL de producción.

## Solución

### 1. Configurar URLs de Redirección en Supabase Dashboard

1. Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **URL Configuration**
4. Configura las siguientes URLs:

#### Site URL
```
https://festival-friends.netlify.app
```

#### Redirect URLs
```
http://localhost:4322/auth/callback
https://festival-friends.netlify.app/auth/callback
```

### 2. Configurar Email Templates (Opcional)

1. Ve a **Authentication** > **Email Templates**
2. Edita el template "Confirm signup"
3. Asegúrate de que el enlace use la variable `{{ .ConfirmationURL }}`

### 3. Variables de Entorno para Producción

Si usas Vercel, configura estas variables de entorno:

```env
PUBLIC_SUPABASE_URL=https://mvlrmnxatfpfjnrwzukz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzU0NjAsImV4cCI6MjA2OTkxMTQ2MH0.MEs9gh4YMEZq-NyEn0Xla5ckyhDzFuS7E1BJdFsDtTI
```

### 4. Verificar Configuración

1. Registra un nuevo usuario en producción
2. Verifica que el email de confirmación contenga la URL correcta
3. Confirma que el enlace redirija a `https://festival-friends.netlify.app/auth/callback`

## Archivos Modificados

- `src/lib/supabase.js` - Configuración de redirección
- `src/pages/auth/callback.astro` - Página de callback
- `astro.config.mjs` - URL del sitio configurada

## Notas Importantes

- Los enlaces de confirmación ahora redirigen a `/auth/callback`
- La página de callback maneja automáticamente la confirmación
- En desarrollo sigue usando `localhost:4322`
- En producción usa `https://festival-friends.netlify.app` 