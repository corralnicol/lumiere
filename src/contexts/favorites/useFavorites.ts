import { useContext } from 'react';
import { FavoritesActionsContext, FavoritesStateContext } from './favoritesContextValues';

export const useFavoritesState = () => useContext(FavoritesStateContext);
export const useFavoritesActions = () => useContext(FavoritesActionsContext);
