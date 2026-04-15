import { Colors } from '@utils/Constants';
import { screenHeight, screenWidth } from '@utils/Scaling';
import React, { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../global/Icon'
import QRScannerModel from '@components/models/QRScannerModel';
import { navigate } from '@utils/NavigationUtils';
import { appAxios } from '@service/apiInterceptors';
import { useFocusEffect } from '@react-navigation/native';


const Homeheader = () => {

    const [isVisible, setIsVisible] = useState(false);

    function click() {
        setIsVisible(true)
    }
    return (
        <View style={styles.mainContainer}>
            <View>
                <SafeAreaView />
                <View style={[styles.flexRowBetween, styles.container]}>
                    <Image style={styles.logo} source={require('@assets/images/logo.png')} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigate('SearchActivity')} style={styles.searchBtn}>
                            <Icon name='magnify' size={28} color={Colors.primary} iconFamily='MaterialCommunityIcons' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={click} style={styles.scan}>
                            <Icon name='qrcode-scan' size={24} color={Colors.primary} iconFamily='MaterialCommunityIcons' />
                        </TouchableOpacity>
                    </View>
                </View>

                {isVisible && (
                    <QRScannerModel
                        visible={isVisible}
                        onClose={() => setIsVisible(false)} />
                )}


            </View>
        </View>
    )
}
export default Homeheader;
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: Colors.primary_light,
    },
    flexRowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 4
    },
    container: {
        padding: 5,
        zIndex: 4,
    },
    scan: {
        backgroundColor: '#fff',
        marginEnd: 10,
        padding: 15,
        borderRadius: 50,
    },
    searchBtn: {
        marginEnd: 5,
        padding: 10,
    },
    logo: {
        width: screenWidth * 0.3,
        height: screenHeight * 0.07,
        resizeMode: 'contain',
    },
    redDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        width: 8,
        height: 8,
        borderRadius: 4,
    }
})