-- Script para verificar el estado de la tabla de notificaciones
-- Ejecutar este script en el SQL Editor de Supabase

-- Verificar que la tabla existe
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'notifications';

-- Verificar la estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notifications';

-- Verificar las políticas RLS existentes
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

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_notifications FROM public.notifications;

-- Verificar permisos del usuario anónimo
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' AND table_name = 'notifications'; 