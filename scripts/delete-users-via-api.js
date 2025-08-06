// Script para eliminar usuarios usando la API de administración de Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvlrmnxatfpfjnrwzukz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3Mjk3NCwiZXhwIjoyMDUwNTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Usar la service key para acceso de administrador
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuario que queremos mantener
const KEEP_USER_ID = 'ab28050e-f20b-4082-8c73-d3b2aa3eaf5e';

// Usuarios que queremos eliminar
const USERS_TO_DELETE = [
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440015'
];

async function deleteUsersViaAPI() {
  console.log('🚀 Iniciando eliminación de usuarios via API...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const userId of USERS_TO_DELETE) {
    try {
      console.log(`🗑️  Eliminando usuario: ${userId}`);
      
      // Eliminar usuario usando la API de administración
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.log(`❌ Error eliminando ${userId}:`, error.message);
        errorCount++;
        errors.push({ userId, error: error.message });
      } else {
        console.log(`✅ Usuario ${userId} eliminado exitosamente`);
        successCount++;
      }
      
      // Pequeña pausa entre eliminaciones para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.log(`❌ Error inesperado eliminando ${userId}:`, err.message);
      errorCount++;
      errors.push({ userId, error: err.message });
    }
  }

  console.log('\n📊 Resumen de eliminación:');
  console.log(`✅ Usuarios eliminados exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Detalles de errores:');
    errors.forEach(({ userId, error }) => {
      console.log(`  - ${userId}: ${error}`);
    });
  }

  // Verificar usuarios restantes
  console.log('\n🔍 Verificando usuarios restantes...');
  const { data: remainingUsers, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log('❌ Error obteniendo lista de usuarios:', listError.message);
  } else {
    console.log(`📊 Usuarios restantes: ${remainingUsers.users.length}`);
    remainingUsers.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
  }

  console.log('\n🎉 Proceso completado!');
}

// Ejecutar el script
deleteUsersViaAPI().catch(console.error); 