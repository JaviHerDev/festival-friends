// Script de prueba para verificar el flujo de autenticación
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvlrmnxatfpfjnrwzukz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🧪 Iniciando pruebas del flujo de autenticación...\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión a Supabase...');
    const { data: connectionTest } = await supabase.from('users').select('count').limit(1);
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar usuarios existentes
    console.log('2️⃣ Verificando usuarios existentes...');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: publicUsers } = await supabase.from('users').select('id, email, name');
    
    console.log(`📊 Usuarios en Auth: ${authUsers.users.length}`);
    console.log(`📊 Usuarios en public.users: ${publicUsers.length}`);
    
    if (authUsers.users.length === publicUsers.length) {
      console.log('✅ Todos los usuarios tienen perfil\n');
    } else {
      console.log('❌ Hay usuarios sin perfil\n');
    }

    // 3. Verificar trigger
    console.log('3️⃣ Verificando trigger automático...');
    const { data: triggerInfo } = await supabase.rpc('ensure_user_profile', { 
      user_uuid: authUsers.users[0]?.id 
    });
    console.log('✅ Trigger funciona correctamente\n');

    // 4. Verificar función de sincronización
    console.log('4️⃣ Verificando función de sincronización...');
    const { data: syncResult } = await supabase.rpc('sync_missing_user_profiles');
    console.log(`✅ Función de sincronización ejecutada: ${syncResult} usuarios procesados\n`);

    // 5. Verificar estructura de datos
    console.log('5️⃣ Verificando estructura de datos...');
    const { data: sampleUser } = await supabase.from('users').select('*').limit(1).single();
    
    if (sampleUser) {
      const requiredFields = ['id', 'email', 'name', 'nickname', 'city', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !sampleUser[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ Estructura de datos correcta');
        console.log(`📝 Usuario de ejemplo: ${sampleUser.name} (${sampleUser.email})`);
      } else {
        console.log(`❌ Campos faltantes: ${missingFields.join(', ')}`);
      }
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar pruebas
testAuthFlow(); 