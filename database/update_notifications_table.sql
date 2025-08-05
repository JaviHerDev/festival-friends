-- Actualizar tabla de notificaciones existente
-- Agregar columnas faltantes

-- Agregar columna data si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added data column to notifications table';
    ELSE
        RAISE NOTICE 'Data column already exists in notifications table';
    END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to notifications table';
    ELSE
        RAISE NOTICE 'Updated_at column already exists in notifications table';
    END IF;
END $$;

-- Verificar y crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Habilitar RLS si no está habilitado
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Crear políticas si no existen
DO $$ 
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created SELECT policy for notifications';
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can create notifications for any user'
    ) THEN
        CREATE POLICY "Users can create notifications for any user" ON public.notifications
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Created INSERT policy for notifications';
    END IF;
    
    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications" ON public.notifications
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created UPDATE policy for notifications';
    END IF;
    
    -- Política para DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can delete their own notifications'
    ) THEN
        CREATE POLICY "Users can delete their own notifications" ON public.notifications
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created DELETE policy for notifications';
    END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Mostrar la estructura final de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications' 
ORDER BY ordinal_position; 