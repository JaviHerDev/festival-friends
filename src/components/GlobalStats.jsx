'use client';

import { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';

const GlobalStats = () => {
  const { getGlobalAppStats } = useStore();
  const [stats, setStats] = useState({
    totalFestivals: 0,
    totalUsers: 0,
    totalCities: 0,
    totalBadges: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Loading public global stats...');
        const { data, error } = await getGlobalAppStats();
        
        if (error) {
          console.error('❌ Error loading global stats:', error);
          // Set default values if there's an error
          setStats({
            totalFestivals: 0,
            totalUsers: 0,
            totalCities: 0,
            totalBadges: 0
          });
          return;
        }
        
        if (data) {
          console.log('✅ Public global stats loaded:', data);
          setStats(data);
        }
      } catch (err) {
        console.error('❌ Exception loading global stats:', err);
        // Set default values if there's an exception
        setStats({
          totalFestivals: 0,
          totalUsers: 0,
          totalCities: 0,
          totalBadges: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Load stats immediately when component mounts
    loadStats();
  }, [getGlobalAppStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-slate-400">...</div>
            <div className="text-sm text-slate-400">Cargando</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div className="card text-center transform hover:scale-105 transition-transform duration-200">
        <div className="text-3xl mb-2">🎪</div>
        <div className="text-2xl font-bold text-primary-400">{stats.totalFestivals}+</div>
        <div className="text-sm text-slate-400">Festivales</div>
      </div>
      <div className="card text-center transform hover:scale-105 transition-transform duration-200">
        <div className="text-3xl mb-2">👥</div>
        <div className="text-2xl font-bold text-purple-400">{stats.totalUsers}+</div>
        <div className="text-sm text-slate-400">Amigos</div>
      </div>
      <div className="card text-center transform hover:scale-105 transition-transform duration-200">
        <div className="text-3xl mb-2">🌍</div>
        <div className="text-2xl font-bold text-green-400">{stats.totalCities}+</div>
        <div className="text-sm text-slate-400">Ciudades</div>
      </div>
      <div className="card text-center transform hover:scale-105 transition-transform duration-200">
        <div className="text-3xl mb-2">🏆</div>
        <div className="text-2xl font-bold text-pink-400">{stats.totalBadges}+</div>
        <div className="text-sm text-slate-400">Insignias</div>
      </div>
    </div>
  );
};

export default GlobalStats; 