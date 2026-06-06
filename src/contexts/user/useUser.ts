import { useContext } from 'react';
import { UserDispatchContext, UserStateContext } from './userContextValues';

export const useUserState = () => useContext(UserStateContext);
export const useUserActions = () => useContext(UserDispatchContext);
