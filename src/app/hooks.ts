// Hooks tipados para usar Redux sin repetir tipos en cada componente.
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Usen estos en las páginas nuevas en vez de useDispatch/useSelector directos.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;
