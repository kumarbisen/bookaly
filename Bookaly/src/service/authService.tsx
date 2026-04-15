import axios from 'axios'
import { BASE_URL } from './config'
import { tokenStorage } from '@state/storage'
import { useAuthStore } from '@state/authStore'
import { resetAndNavigate } from '@utils/NavigationUtils'
import { appAxios } from './apiInterceptors'


export const customerLogin = async (phone: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/customer/login`, { phone, password })
        const { accessToken, refreshToken, customer, success, message } = response.data || {};

        
    if (success === false || !accessToken || !refreshToken || !customer) {
      throw new Error(message || 'Invalid phone number or password.');
    }
        useAuthStore.getState().setAuth({
            user: customer,
            accessToken,
            refreshToken,
            role: 'Customer'
        })

        return { accessToken, refreshToken, customer };
    } catch (error) {
        console.log("Login Error", error);
        throw error;
    }
}

export const registerCustomer = async (data: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/customer/register`, data);
        const { accessToken, refreshToken, customer } = response.data;
        useAuthStore.getState().setAuth({
            user: customer,
            accessToken,
            refreshToken,
            role: 'Customer',
        });
    } catch (error) {
        console.log("Registration Error", error);
        throw error;
    }
}

export const resetCustomerPassword = async (phone: string, newPassword: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/customer/reset-password`, {
            phone,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.log("Reset password error", error);
        throw error;
    }
}


export const providerLogin = async (data: { email: string; password: string }) => {
    try {
        const { email, password } = data;
        const response = await axios.post(`${BASE_URL}/provider/login`, { email, password });
        const { accessToken, refreshToken, provider, success, message } = response.data || {};

    if (success === false || !accessToken || !refreshToken || !provider) {
      throw new Error(message || 'Invalid email or password.');
    }
        useAuthStore.getState().setAuth({
            user: provider,
            accessToken,
            refreshToken,
            role: 'Provider',
        });
        return { accessToken, refreshToken, provider };
    } catch (error) {
        console.log("Login Error", error);
        throw error;
    }
}

export const providerSignUp = async (data: { email: string; password: string; name: string; phone: string; provider_id: string }) => {
    try {
        const { email, password, name, phone, provider_id } = data;
        const response = await axios.post(`${BASE_URL}/provider/register`, { email, password, name, phone, provider_id });
        const { accessToken, refreshToken, provider } = response.data;
        useAuthStore.getState().setAuth({
            user: provider,
            accessToken,
            refreshToken,
            role: 'Provider',
        });
    } catch (error) {
        console.log("Sign Up Error", error);
        throw error;
    }
}

export const refresh_tokens = async () => {
    try {
        const refreshToken = tokenStorage.getString('refreshToken')
        const response = await axios.post(`${BASE_URL}/refresh-token`, {
            refreshToken
        })


        const new_access_token = response.data.accessToken
        const new_refresh_token = response.data.refreshToken

        if (new_access_token) {
            tokenStorage.set('accessToken', new_access_token)
        }
        if (new_refresh_token) {
            tokenStorage.set('refreshToken', new_refresh_token)
        }
        return new_access_token
    } catch (error) {
        console.log("REFRESH TOKEN ERROR", error)
        tokenStorage.clearAll()
        resetAndNavigate("CustomerLogin")

    }
}

export const refetchUser = async (setUser: any) => {
    try {
        const response = await appAxios.get(`/user`)
        setUser(response.data.user)
    } catch (error) {
        console.log("login error", error);

    }
}



export const updateUser = async (data: any) => {
    try {
        const response = await appAxios.post(`/user`, data)
        const { setUser } = useAuthStore.getState()
        setUser(response.data.user)
    } catch (error) {
        console.log("Error updating user", error)
        throw error;
    }
}

export const checkUsernameAvailability = async (provider_id: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/provider/check-username`, {
            params: { provider_id }
        });
        return response.data;
    } catch (error) {
        console.log("Check username error", error);
        return { available: false };
    }
}

export const resetProviderPassword = async (identifier: string, newPassword: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/provider/reset-password`, {
            identifier,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.log("Reset password error", error);
        throw error;
    }
}

