-- Script para eliminar todas las encuestas y datos relacionados del usuario "Pepito"
-- Ejecutar con precaución - esto eliminará permanentemente todos los datos de encuestas del usuario

-- 1. Primero, identificar al usuario Pepito
DO $$
DECLARE
    pepito_user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Buscar el usuario Pepito
    SELECT id INTO pepito_user_id 
    FROM public.users 
    WHERE name ILIKE '%Pepito%' OR nickname ILIKE '%Pepito%';
    
    IF pepito_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuario Pepito no encontrado';
        RETURN;
    END IF;
    
    RAISE NOTICE '🔍 Usuario Pepito encontrado con ID: %', pepito_user_id;
    
    -- 2. Eliminar respuestas de encuestas del usuario
    DELETE FROM survey_responses 
    WHERE user_id = pepito_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '🗑️ Eliminadas % respuestas de encuestas', deleted_count;
    
    -- 3. Eliminar votos de insignias donde Pepito votó
    DELETE FROM badge_votes 
    WHERE voted_by = pepito_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '🗑️ Eliminados % votos de insignias emitidos por Pepito', deleted_count;
    
    -- 4. Eliminar votos de insignias donde votaron POR Pepito
    DELETE FROM badge_votes 
    WHERE voted_for_id = pepito_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '🗑️ Eliminados % votos de insignias recibidos por Pepito', deleted_count;
    
    -- 5. Eliminar insignias otorgadas a Pepito
    DELETE FROM user_badges 
    WHERE user_id = pepito_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '🗑️ Eliminadas % insignias otorgadas a Pepito', deleted_count;
    
    -- 6. Eliminar insignias otorgadas POR Pepito (como admin)
    DELETE FROM user_badges 
    WHERE awarded_by = pepito_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '🗑️ Eliminadas % insignias otorgadas por Pepito', deleted_count;
    
    -- 7. Actualizar estadísticas de festivales que puedan verse afectadas
    -- Esto se hará automáticamente cuando se recalculen las estadísticas
    
    RAISE NOTICE '✅ Eliminación completa de datos de encuestas de Pepito finalizada';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error durante la eliminación: %', SQLERRM;
        RAISE;
END $$;

-- 8. Verificar que la eliminación fue exitosa
SELECT 
    'survey_responses' as tabla,
    COUNT(*) as registros_restantes
FROM survey_responses sr
JOIN public.users u ON sr.user_id = u.id
WHERE u.name ILIKE '%Pepito%' OR u.nickname ILIKE '%Pepito%'

UNION ALL

SELECT 
    'badge_votes' as tabla,
    COUNT(*) as registros_restantes
FROM badge_votes bv
JOIN public.users u ON bv.voted_by = u.id OR bv.voted_for_id = u.id
WHERE u.name ILIKE '%Pepito%' OR u.nickname ILIKE '%Pepito%'

UNION ALL

SELECT 
    'user_badges' as tabla,
    COUNT(*) as registros_restantes
FROM user_badges ub
JOIN public.users u ON ub.user_id = u.id OR ub.awarded_by = u.id
WHERE u.name ILIKE '%Pepito%' OR u.nickname ILIKE '%Pepito%';

-- 9. Mostrar resumen de eliminación
SELECT 
    'RESUMEN' as tipo,
    'Datos de encuestas de Pepito eliminados' as descripcion,
    'Verificar que no queden registros relacionados' as accion; 