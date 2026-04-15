import { appAxios } from './apiInterceptors';

export const uploadProfileImage = async (providerId: string, imageUri: string) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `profile_${providerId}.jpg`,
        } as any);

        const result = await appAxios.post(
            `/upload/profile/${providerId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        return result.data;
    } catch (error: any) {
        console.log('Upload failed:', error);
        throw error.response?.data || error;
    }
};

export const fetchProviderImage = async (providerId: string) => {
    try {
        const response = await appAxios.get(`/upload/provider/${providerId}`);
        return response.data.provider;
    } catch (error: any) {
        console.log('Failed to fetch provider:', error);
        throw error;
    }
};

export const deleteProfileImage = async (providerId: string) => {
    try {
        const response = await appAxios.delete(`/upload/profile/${providerId}`);
        return response.data;
    } catch (error: any) {
        console.log('Delete failed:', error);
        throw error;
    }
};