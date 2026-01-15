import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean; 
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);


const STORAGE_KEY = 'hana_author_favorites_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
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

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites mutlaka FavoritesProvider içinde kullanılmalıdır!');
  }
  return context;
};