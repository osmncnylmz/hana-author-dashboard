import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FavoritesContext } from './favorites-context';

const STORAGE_KEY = 'hana_author_favorites_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      // Valid JSON is not necessarily the shape we stored: guard the array so a
      // hand-edited or stale entry cannot crash every consumer of `favorites`.
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((id): id is number => typeof id === 'number');
    } catch (error) {
      console.error("LocalStorage okunurken hata oluştu:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("LocalStorage kaydedilirken hata oluştu:", error);
    }
  }, [favorites]);


  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id) 
        : [...prev, id]
    );
  }, []);

  
  const isFavorite = useCallback((id: number) => {
    return favorites.includes(id);
  }, [favorites]);

 
  const value = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite
  }), [favorites, toggleFavorite, isFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
