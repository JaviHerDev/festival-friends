-- Script para corregir las políticas RLS de la tabla de notificaciones
-- Ejecutar este script en el SQL Editor de Supabase

-- Verificar que la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        RAISE EXCEPTION 'La tabla notifications no existe. Ejecuta primero notifications_table.sql';
    END IF;
END $$;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications for any user" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Crear nuevas políticas más permisivas para desarrollo
-- Política para SELECT - usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT - permitir crear notificaciones (más permisiva para desarrollo)
CREATE POLICY "Users can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE - usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE - usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Verificar que RLS está habilitado
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Verificar las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Mensaje de confirmación
SELECT 'Políticas RLS corregidas exitosamente para la tabla notifications' as status; 