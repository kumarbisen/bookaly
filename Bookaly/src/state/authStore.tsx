import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage, storage, tokenStorage } from './storage'


type Role = 'Customer' | 'Provider' | null; 

interface AuthStore {
    user: Record<string, any> | null;
    role:Role;
    setAuth:(payload:{user:any, accessToken:string , refreshToken:string, role:Role}) => void;
    setUser: (user: any) => void;
    logout: () => void;
}
//Token Ko Locally Store karna baki hai
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            role: null,

            setAuth:({user, accessToken, refreshToken, role}) =>{
            tokenStorage.set('accessToken', accessToken);
            tokenStorage.set('refreshToken', refreshToken);
            set({ user, role });
            },
            
            setUser: (data) => set({ user: data }),
            logout: () => {
                try {
                    // clear tokens from storage
                    tokenStorage.clearAll && tokenStorage.clearAll();
                } catch (e) {
                    console.log(e)
                }
                set({ user: null, role: null });

            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => mmkvStorage)
        }
    )
)