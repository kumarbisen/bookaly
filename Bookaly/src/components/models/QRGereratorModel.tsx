import Icon from '@components/global/Icon';
import CustomText from '@components/UI/CustomText';
import { Colors, Fonts } from '@utils/Constants';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useAuthStore } from '../../state/authStore';

interface QRGereratorModelProps {
    visible: boolean;
    onClose: () => void;
}

const QRGereratorModel: FC<QRGereratorModelProps> = ({ visible, onClose }) => {

    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();
    const providerId = user?.provider_id?.trim();
    const qrValue = providerId
        ? `https://bookaly.app?provider_id=${encodeURIComponent(providerId)}`
        : 'https://bookaly.app';
    const viewShotRef = useRef<ViewShot>(null);

    useEffect(() => {
        if (visible) {
            setLoading(false);
        }
    }, [visible]);

    const handleShare = async () => {
        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                const shareOptions = {
                    title: 'Share QR Code',
                    message: `Book appointments with ${user?.name} on Bookaly App! ${qrValue}`,
                    url: uri,
                    type: 'image/png',
                };
                await Share.open(shareOptions);
            }
        } catch (error) {
            console.log('Error sharing QR code:', error);
        }
    };

    const hasAndroidPermission = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            return true;
        }

        const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(permission);
        return status === 'granted';
    }

    const handleDownload = async () => {
        try {
            if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
                Alert.alert("Permission Denied", "Storage permission is required to save the QR code.");
                return;
            }

            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                await CameraRoll.saveAsset(uri, { type: 'photo' });
                Alert.alert("Success", "QR Code saved to gallery!");
            }
        } catch (error) {
            console.log('Error saving QR code:', error);
            Alert.alert("Error", "Failed to save QR Code.");
        }
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    <View style={styles.header}>
                        <CustomText varient='h5' fontFamily={Fonts.Bold}>My QR Code</CustomText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name='close' iconFamily='Ionicons' size={24} color='#1f2937' />
                        </TouchableOpacity>
                    </View>

                    
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.captureContainer}>
                        <View style={styles.qrCard}>

                            
                            <View style={styles.profileHeader}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "P"}</Text>
                                </View>
                                <View>
                                    <CustomText fontFamily={Fonts.Bold} style={styles.userName}>{user?.name || "Provider"}</CustomText>
                                    <CustomText style={styles.providerId}>@{user?.provider_id || "id"}</CustomText>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            
                            <View style={styles.qrContainer}>
                                {loading ? (
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                ) : (
                                    <QRCode
                                        value={qrValue}
                                        size={200}
                                        color="black"
                                        backgroundColor="white"
                                    />
                                )}
                            </View>

                            <CustomText style={styles.scanText}>Scan to book an appointment on Bookaly</CustomText>

                            <View style={styles.brandContainer}>
                                <CustomText style={styles.brandText} fontFamily={Fonts.Bold}>Pakka Seat</CustomText>
                            </View>
                        </View>
                    </ViewShot>

                    
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <View style={[styles.iconButton, { backgroundColor: '#EEF2FF' }]}>
                                <Icon name='share-social' iconFamily='Ionicons' size={24} color={Colors.primary} />
                            </View>
                            <CustomText style={styles.actionText}>Share</CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                            <View style={[styles.iconButton, { backgroundColor: '#F3F4F6' }]}>
                                <Icon name='download' iconFamily='Ionicons' size={24} color='#374151' />
                            </View>
                            <CustomText style={styles.actionText}>Save</CustomText>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
}

export default QRGereratorModel;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 340,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    captureContainer: {
        backgroundColor: '#fff',
        width: '100%',
    },
    qrCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 20,
        alignItems: 'center',
        width: '100%', 
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827'
    },
    userName: {
        fontSize: 16,
        color: '#111827'
    },
    providerId: {
        fontSize: 14,
        color: '#6B7280'
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F3F4F6',
        marginBottom: 20
    },
    qrContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16
    },
    scanText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center'
    },
    brandContainer: {
        position: 'absolute',
        bottom: 10,
        opacity: 0
    },
    brandText: {
        fontSize: 12,
        color: '#9CA3AF'
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 40
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    actionText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500'
    }
});