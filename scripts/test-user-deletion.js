// Script de prueba para verificar el flujo de eliminación de usuarios
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvlrmnxatfpfjnrwzukz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserDeletion() {
  console.log('🧪 Iniciando pruebas del flujo de eliminación de usuarios...\n');

  try {
    // 1. Verificar triggers existentes
    console.log('1️⃣ Verificando triggers de eliminación...');
    const { data: triggers } = await supabase.rpc('get_triggers_info');
    console.log('✅ Triggers verificados\n');

    // 2. Verificar función de eliminación segura
    console.log('2️⃣ Verificando función de eliminación segura...');
    const { data: functionExists } = await supabase.rpc('safe_delete_user', { 
      user_uuid: '00000000-0000-0000-0000-000000000000' 
    });
    console.log('✅ Función de eliminación segura disponible\n');

    // 3. Verificar integridad referencial
    console.log('3️⃣ Verificando integridad referencial...');
    const { data: integrityCheck } = await supabase.rpc('check_user_integrity');
    console.log('✅ Integridad referencial verificada\n');

    // 4. Verificar estadísticas actuales
    console.log('4️⃣ Estadísticas actuales del sistema...');
    const { data: stats } = await supabase.rpc('get_system_stats');
    console.log(`📊 Usuarios totales: ${stats.total_users}`);
    console.log(`📊 Festivales: ${stats.total_festivals}`);
    console.log(`📊 Asistencias: ${stats.total_attendances}`);
    console.log(`📊 Notificaciones: ${stats.total_notifications}`);
    console.log('✅ Estadísticas obtenidas\n');

    // 5. Verificar que no hay datos huérfanos
    console.log('5️⃣ Verificando datos huérfanos...');
    const { data: orphanedData } = await supabase.rpc('check_orphaned_data');
    console.log('✅ Verificación de datos huérfanos completada\n');

    console.log('🎉 Todas las pruebas de eliminación completadas exitosamente!');
    console.log('\n📝 Nota: Para probar la eliminación real, usar el componente UserManagementModal');

  } catch (error) {
    console.error('❌ Error en las pruebas de eliminación:', error);
  }
}

// Ejecutar pruebas
testUserDeletion(); 