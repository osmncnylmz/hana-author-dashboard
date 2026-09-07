import { createContext, useContext } from 'react';

export interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites mutlaka FavoritesProvider içinde kullanılmalıdır!');
  }
  return context;
};
