import React, { useState } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from '../global/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@utils/Constants';
import { screenHeight, screenWidth } from '@utils/Scaling';
import { navigate } from '@utils/NavigationUtils';

const Header = () => {

    const onClick = () => {
        navigate('ProviderProfile')
    }

    return (
        <View style={styles.mainContainer}>
            <SafeAreaView />
            <View style={[styles.flexRowBetween, styles.container]}>

                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo} />

                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        onPress={() => navigate('Subscription')}
                        style={styles.iconButton}
                    >
                        <Icon iconFamily='MaterialCommunityIcons' name='crown' size={24} color='#F5A623' />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onClick}>
                        <Icon iconFamily='Ionicons' name="person-outline" size={24} color='#333' />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )
}
export default Header;

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    container: {
        paddingHorizontal: 0,

        zIndex: 4,
    },
    logo: {
        width: screenWidth * 0.45,
        height: screenHeight * 0.08,
        resizeMode: 'contain',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        padding: 4,
        paddingRight: 15
    },
    flexRowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
})
