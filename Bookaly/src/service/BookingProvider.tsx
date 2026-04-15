
import { appAxios } from './apiInterceptors';


export const booktoken = async (providerPublicId: string) => {
    try {
        const response = await appAxios.post('/tokens/book', { providerPublicId })
        return response.data

    } catch (error: any) {
        console.log('Booking failed to create', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(error.message);
    }
}



// get token for provider
export const fetchTokens = async (date?: string) => {
    try {
        const query = date ? `?date=${date}` : '';
        const response = await appAxios.get(`/tokens/fetch${query}`);
        return response.data;



    } catch (error) {
        console.log("Failed to fetch tokens", error);
        return null;
    }
}


export const fetchUserTokens = async () => { try { const response = await appAxios.get('/tokens/user'); return response.data; } catch (error) { console.log('Failed to fetch user tokens', error); return null; } }

export const searchProvider = async (providerId: string) => {
    try {
        const response = await appAxios.get(`/provider/search?providerId=${providerId}`);
        return response.data;
    } catch (error) {
        console.log('Failed to search provider', error);
        return null;
    }
}
