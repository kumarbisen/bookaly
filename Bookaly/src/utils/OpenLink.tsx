import { Linking } from "react-native";

export const handleOpenLink = async (url: string) => {
    try {
        
        const supported = await Linking.canOpenURL(url);

        if (supported || url.startsWith('http') || url.startsWith('mailto')) {
            await Linking.openURL(url);
        } else {
            console.log("Don't know how to open this URL: " + url);
        }
    } catch (error) {
        console.error('An error occurred', error);
    }
};
