import React from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from './Icon';
import { Colors } from '@utils/Constants';
import { navigate, resetAndNavigate } from '@utils/NavigationUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const BottomTab = ({ activeTab = 'Home' }: { activeTab?: string }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom + 10, 15) + 10 }]}>
            <TouchableOpacity onPress={() => resetAndNavigate('Customerdashboard')}>
                <Icon
                    color='#3ebcdc'
                    size={28}
                    name={activeTab === 'Home' ? 'home' : 'home-outline'}
                    iconFamily='MaterialCommunityIcons'
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetAndNavigate('Favorate')}>
                <Icon
                    color='#3ebcdc'
                    size={28}
                    name={activeTab === 'Favorate' ? 'bookmark' : 'bookmark-outline'}
                    iconFamily='MaterialCommunityIcons'
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetAndNavigate('profileScreen')}>
                <Icon
                    color='#3ebcdc'
                    size={28}
                    name={activeTab === 'Profile' ? 'account' : 'account-outline'}
                    iconFamily='MaterialCommunityIcons'
                />
            </TouchableOpacity>
        </View>
    )
}
export default BottomTab;
const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: "absolute",
        bottom: 0,

        flexDirection: "row",
        justifyContent: 'space-between',
        backgroundColor: Colors.primary_light,
        alignItems: 'center',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        elevation: 10,


        shadowRadius: 5,
        shadowColor: "#888",
        paddingHorizontal: 25,
        paddingTop: 15,
       
    },
})
