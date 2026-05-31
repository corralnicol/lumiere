// hooks tipados para usar en toda la app con Redux
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// en vez de usar useDispatch y useSelector directamente, usamos estos
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;
