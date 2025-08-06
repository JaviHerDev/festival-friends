import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (necesitarás agregar tus credenciales)
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBadges() {
  console.log('🔍 Debugging badge system...');
  
  try {
    // 1. Verificar definiciones de insignias
    console.log('\n📋 1. Verificando definiciones de insignias...');
    const { data: badgeDefinitions, error: badgeError } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('name');
    
    if (badgeError) {
      console.error('❌ Error loading badge definitions:', badgeError);
    } else {
      console.log('✅ Badge definitions loaded:', badgeDefinitions?.length || 0);
      if (badgeDefinitions && badgeDefinitions.length > 0) {
        console.log('📋 Badge details:');
        badgeDefinitions.forEach(badge => {
          console.log(`  - ${badge.name} (${badge.badge_key}) - Active: ${badge.is_active}`);
        });
      }
    }
    
    // 2. Verificar insignias de usuarios
    console.log('\n👤 2. Verificando insignias de usuarios...');
    const { data: userBadges, error: userBadgeError } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge_definitions(name, badge_key),
        users(name, nickname)
      `)
      .order('awarded_at', { ascending: false });
    
    if (userBadgeError) {
      console.error('❌ Error loading user badges:', userBadgeError);
    } else {
      console.log('✅ User badges loaded:', userBadges?.length || 0);
      if (userBadges && userBadges.length > 0) {
        console.log('📋 Recent user badges:');
        userBadges.slice(0, 5).forEach(badge => {
          console.log(`  - ${badge.users?.name} received ${badge.badge_definitions?.name} on ${badge.awarded_at}`);
        });
      }
    }
    
    // 3. Verificar votos de insignias
    console.log('\n🗳️ 3. Verificando votos de insignias...');
    const { data: badgeVotes, error: voteError } = await supabase
      .from('badge_votes')
      .select(`
        *,
        badge_definitions(name, badge_key),
        festivals(name)
      `)
      .order('created_at', { ascending: false });
    
    if (voteError) {
      console.error('❌ Error loading badge votes:', voteError);
    } else {
      console.log('✅ Badge votes loaded:', badgeVotes?.length || 0);
      if (badgeVotes && badgeVotes.length > 0) {
        console.log('📋 Recent badge votes:');
        badgeVotes.slice(0, 5).forEach(vote => {
          console.log(`  - Vote for ${vote.badge_definitions?.name} in ${vote.festivals?.name}`);
        });
      }
    }
    
    // 4. Verificar encuestas
    console.log('\n📊 4. Verificando encuestas...');
    const { data: surveys, error: surveyError } = await supabase
      .from('festival_surveys')
      .select(`
        *,
        festivals(name)
      `)
      .order('created_at', { ascending: false });
    
    if (surveyError) {
      console.error('❌ Error loading surveys:', surveyError);
    } else {
      console.log('✅ Surveys loaded:', surveys?.length || 0);
      if (surveys && surveys.length > 0) {
        console.log('📋 Recent surveys:');
        surveys.slice(0, 5).forEach(survey => {
          console.log(`  - Survey for ${survey.festivals?.name} - Active: ${survey.is_active}`);
        });
      }
    }
    
    // 5. Verificar respuestas de encuestas
    console.log('\n📝 5. Verificando respuestas de encuestas...');
    const { data: surveyResponses, error: responseError } = await supabase
      .from('survey_responses')
      .select(`
        *,
        festival_surveys(
          festivals(name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (responseError) {
      console.error('❌ Error loading survey responses:', responseError);
    } else {
      console.log('✅ Survey responses loaded:', surveyResponses?.length || 0);
      if (surveyResponses && surveyResponses.length > 0) {
        console.log('📋 Recent survey responses:');
        surveyResponses.slice(0, 5).forEach(response => {
          console.log(`  - Response for ${response.festival_surveys?.festivals?.name} on ${response.created_at}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

// Ejecutar el debug
debugBadges(); 