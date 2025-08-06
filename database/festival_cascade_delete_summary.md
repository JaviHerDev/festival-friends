# Eliminación en Cascada de Festivales

Cuando se elimina un festival, se eliminan automáticamente todos los datos relacionados para mantener la integridad de la base de datos.

## Tablas que se eliminan automáticamente (CASCADE DELETE)

### 1. **festival_attendances**
- Todas las asistencias registradas para el festival
- Estados de asistencia (tengo entrada, pensándolo, no voy)
- Notas de asistencia

### 2. **notifications**
- Notificaciones que referencian directamente el festival (`festival_id`)
- Notificaciones que contienen el festival en el campo `data` JSON (via trigger)

### 3. **user_badges**
- Insignias otorgadas específicamente en ese festival
- Votos recibidos para esas insignias
- Información de quién otorgó la insignia

### 4. **badge_votes**
- Votos de insignias relacionados con el festival
- Estadísticas de votación

### 5. **festival_statistics**
- Estadísticas específicas del festival
- Métricas y datos analíticos

### 6. **festival_surveys**
- Encuestas asociadas al festival
- Configuración de encuestas

## Datos que NO se eliminan

### **survey_responses**
- Las respuestas de encuestas se mantienen para análisis histórico
- Solo se elimina la configuración de la encuesta, no las respuestas

### **users**
- Los usuarios se mantienen intactos
- Solo se eliminan sus asistencias al festival específico

### **badge_definitions**
- Las definiciones de insignias se mantienen
- Solo se eliminan las instancias otorgadas en ese festival

## Triggers Activos

### **trigger_delete_festival_notifications_json**
- Se ejecuta ANTES de eliminar el festival
- Elimina notificaciones que referencian el festival en el campo `data` JSON
- Complementa la eliminación en cascada de la columna `festival_id`

## Beneficios

1. **Integridad de datos**: No quedan referencias huérfanas
2. **Automatización**: No requiere código adicional para limpiar datos
3. **Consistencia**: Garantiza que todos los datos relacionados se eliminen
4. **Seguridad**: Previene errores de eliminación parcial

## Políticas de Seguridad

- Solo los creadores del festival pueden eliminarlo (RLS policy)
- La eliminación en cascada respeta las políticas de RLS
- Los usuarios solo pueden eliminar sus propios festivales 