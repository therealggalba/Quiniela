import { useCallback, useState } from 'react';

const STORAGE_KEY = 'quiniela_favorite_player_id';

export function useFavoritePlayer() {
  const [favoritePlayerId, setFavoritePlayerId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  const toggleFavorite = useCallback((playerId: string) => {
    setFavoritePlayerId((current) => {
      const next = current === playerId ? null : playerId;
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
      return next;
    });
  }, []);

  return { favoritePlayerId, toggleFavorite };
}
