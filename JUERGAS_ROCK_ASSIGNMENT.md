# Gestión de Asignación Automática a Juergas Rock

## Descripción
La aplicación asigna automáticamente a todos los nuevos usuarios registrados al festival "Juergas Rock" con el estado "Con entrada" (`have_ticket`).

## ⚠️ IMPORTANTE: Ya existe un trigger en la base de datos

**La asignación automática se maneja principalmente a través de un trigger en la base de datos**, no solo por el código JavaScript. El trigger se ejecuta automáticamente cuando se crea un nuevo usuario.

## Configuración de Fecha Límite

### 1. Trigger de Base de Datos (PRINCIPAL)
El trigger `trigger_auto_add_to_juergas_rock` se ejecuta automáticamente cuando se crea un nuevo usuario:

```sql
-- Trigger: trigger_auto_add_to_juergas_rock
-- Función: auto_add_user_to_juergas_rock()
-- Fecha límite: 2025-08-20
-- Estado: 'have_ticket' (Con entrada)
```

**Para cambiar la fecha límite del trigger:**
```sql
-- Ejecutar en Supabase SQL Editor
CREATE OR REPLACE FUNCTION auto_add_user_to_juergas_rock()
RETURNS TRIGGER AS $$
BEGIN
    -- Cambiar esta fecha para modificar el período activo
    IF NEW.created_at <= '2025-08-20'::timestamp THEN
        -- ... resto del código
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Código JavaScript (SECUNDARIO)
La configuración adicional se encuentra en el archivo `src/store/useStore.js` en la función `isJuergasRockAssignmentActive()`:

```javascript
isJuergasRockAssignmentActive: () => {
  // CAMBIAR ESTA FECHA cuando quieras desactivar la asignación automática
  const assignmentDeadline = new Date('2024-12-31T23:59:59Z');
  const now = new Date();
  return now <= assignmentDeadline;
},
```

### Cómo Cambiar la Fecha Límite

1. **Para desactivar la asignación automática**: Cambia la fecha `assignmentDeadline` a una fecha pasada
   ```javascript
   const assignmentDeadline = new Date('2024-01-01T00:00:00Z'); // Ya expirado
   ```

2. **Para extender la asignación automática**: Cambia la fecha a una fecha futura
   ```javascript
   const assignmentDeadline = new Date('2025-06-30T23:59:59Z'); // Hasta junio 2025
   ```

3. **Para activar temporalmente**: Cambia la fecha a una fecha futura
   ```javascript
   const assignmentDeadline = new Date('2024-12-31T23:59:59Z'); // Hasta fin de 2024
   ```

## Comportamiento

### Cuando la Asignación Está Activa
- ✅ Los nuevos usuarios se asignan automáticamente al festival "Juergas Rock"
- ✅ Se les asigna el estado "Con entrada" (`have_ticket`)
- ✅ Se crean notificaciones para otros usuarios
- ✅ Se registra en los logs: `"✅ Automatic assignment to Juergas Rock is still active"`

### Cuando la Asignación Está Inactiva
- ❌ Los nuevos usuarios NO se asignan automáticamente
- ❌ No se crean notificaciones de asignación
- ✅ Se registra en los logs: `"⏰ Automatic assignment to Juergas Rock has expired"`

## Logs de Debug

La aplicación registra el estado de la asignación automática en la consola:

```
🎸 Assigning user to Juergas Rock: [user-id]
✅ Automatic assignment to Juergas Rock is still active. Proceeding with assignment.
```

O cuando está inactiva:

```
🎸 Assigning user to Juergas Rock: [user-id]
⏰ Automatic assignment to Juergas Rock has expired. Skipping assignment.
```

## Notas Importantes

1. **Trigger de Base de Datos**: La asignación automática se maneja principalmente por el trigger `trigger_auto_add_to_juergas_rock`
2. **Código JavaScript**: Es una capa adicional de seguridad que también verifica la fecha límite
3. **Cambios en Producción**: Para cambiar la fecha del trigger, usa el Supabase SQL Editor
4. **Usuarios Existentes**: Los usuarios que ya fueron asignados mantienen su estado
5. **Asignación Manual**: Los usuarios siempre pueden asignarse manualmente al festival
6. **Festival Existente**: El festival "Juergas Rock" debe existir para que funcione la asignación
7. **Estado Corregido**: El trigger ahora asigna `'have_ticket'` (Con entrada) en lugar de `'thinking_about_it'` (Pensándolo)

## Ejemplos de Fechas

### Para el Trigger de Base de Datos:
```sql
-- Desactivar inmediatamente
IF NEW.created_at <= '2024-01-01'::timestamp THEN

-- Hasta fin de año 2024
IF NEW.created_at <= '2024-12-31'::timestamp THEN

-- Hasta agosto 2025 (actual)
IF NEW.created_at <= '2025-08-20'::timestamp THEN
```

### Para el Código JavaScript:
```javascript
// Desactivar inmediatamente
new Date('2024-01-01T00:00:00Z')

// Hasta fin de año 2024
new Date('2024-12-31T23:59:59Z')

// Hasta junio 2025
new Date('2025-06-30T23:59:59Z')

// Hasta fin de año 2025
new Date('2025-12-31T23:59:59Z')
```

## Desactivar Completamente el Trigger

Si quieres desactivar completamente la asignación automática, puedes eliminar el trigger:

```sql
-- Eliminar el trigger
DROP TRIGGER IF EXISTS trigger_auto_add_to_juergas_rock ON users;

-- Eliminar la función
DROP FUNCTION IF EXISTS auto_add_user_to_juergas_rock();
``` 