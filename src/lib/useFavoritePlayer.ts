import { useCallback, useState } from 'react';
import { safeStorage } from './safeStorage';

const STORAGE_KEY = 'quiniela_favorite_player_id';

export function useFavoritePlayer() {
  const [favoritePlayerId, setFavoritePlayerId] = useState<string | null>(() =>
    safeStorage.getItem(STORAGE_KEY),
  );

  const toggleFavorite = useCallback((playerId: string) => {
    setFavoritePlayerId((current) => {
      const next = current === playerId ? null : playerId;
      if (next) safeStorage.setItem(STORAGE_KEY, next);
      else safeStorage.removeItem(STORAGE_KEY);
      return next;
    });
  }, []);

  return { favoritePlayerId, toggleFavorite };
}
