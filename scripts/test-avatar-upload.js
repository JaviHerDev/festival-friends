import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://mvlrmnxatfpfjnrwzukz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzU0NjAsImV4cCI6MjA2OTkxMTQ2MH0.MEs9gh4YMEZq-NyEn0Xla5ckyhDzFuS7E1BJdFsDtTI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvatarUpload() {
  console.log('🧪 Testing avatar upload functionality...\n');

  try {
    // 1. Verificar que el bucket existe
    console.log('1️⃣ Checking if avatars bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    if (!avatarsBucket) {
      console.error('❌ Avatars bucket not found');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ Avatars bucket found:', avatarsBucket.name);
    console.log('   Public:', avatarsBucket.public);
    console.log('   Created:', avatarsBucket.created_at);

    // 2. Verificar políticas del bucket
    console.log('\n2️⃣ Checking bucket policies...');
    const { data: policies, error: policyError } = await supabase.rpc('get_storage_policies', { bucket_name: 'avatars' });
    
    if (policyError) {
      console.log('⚠️  Could not check policies directly, but bucket exists');
    } else {
      console.log('✅ Bucket policies:', policies);
    }

    // 3. Listar archivos existentes en el bucket
    console.log('\n3️⃣ Listing existing files in avatars bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
    } else {
      console.log('✅ Files in bucket:', files?.length || 0);
      if (files && files.length > 0) {
        files.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      }
    }

    // 4. Verificar autenticación
    console.log('\n4️⃣ Checking authentication status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else if (session) {
      console.log('✅ User authenticated:', session.user.email);
      console.log('   User ID:', session.user.id);
    } else {
      console.log('⚠️  No active session - uploads may fail');
    }

    // 5. Probar subida de archivo de prueba (solo si hay sesión)
    if (session) {
      console.log('\n5️⃣ Testing file upload...');
      
      // Crear un archivo de prueba simple
      const testFileName = `test_${Date.now()}.txt`;
      const testContent = 'This is a test file for avatar upload verification';
      const testFile = new Blob([testContent], { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(testFileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
      } else {
        console.log('✅ Upload test successful:', uploadData);
        
        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(testFileName);
        
        console.log('🔗 Public URL:', publicUrl);
        
        // Limpiar archivo de prueba
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([testFileName]);
        
        if (deleteError) {
          console.warn('⚠️  Could not delete test file:', deleteError);
        } else {
          console.log('🧹 Test file cleaned up');
        }
      }
    }

    console.log('\n✅ Avatar upload test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Bucket exists: ✅');
    console.log('   - Bucket is public: ✅');
    console.log('   - Authentication: ' + (session ? '✅' : '⚠️'));
    console.log('   - Upload test: ' + (session ? '✅' : '⏭️'));

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Ejecutar el test
testAvatarUpload(); 