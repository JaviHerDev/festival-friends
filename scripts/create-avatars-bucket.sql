-- Script para crear el bucket de avatares y sus políticas
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear el bucket de avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Crear políticas para el bucket de avatares

-- Política para permitir subir avatares (INSERT)
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Política para permitir ver avatares (SELECT)
DROP POLICY IF EXISTS "Avatar uploads are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar uploads are publicly accessible." ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir actualizar avatares propios (UPDATE)
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar." ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir eliminar avatares propios (DELETE)
DROP POLICY IF EXISTS "Anyone can delete their own avatar." ON storage.objects;
CREATE POLICY "Anyone can delete their own avatar." ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Verificar que el bucket se creó correctamente
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'avatars';

-- 4. Verificar las políticas creadas
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname; 