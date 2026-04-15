import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import { useAuthStore } from '@state/authStore';
import { resetAndNavigate } from '@utils/NavigationUtils';
import { Colors, Fonts } from '@utils/Constants';
import Icon from '@components/global/Icon';
import CustomHeader from '@components/UI/CustomHeader';
import CustomButton from '@components/UI/CustomButton';
import CustomText from '@components/UI/CustomText';
import { updateUser } from '@service/authService';
import QRGereratorModel from '@components/models/QRGereratorModel';
import { uploadProfileImage } from '@service/uploadServices';
import { launchImageLibrary } from 'react-native-image-picker';

const ProviderProfile = () => {
    const { user, logout, setUser } = useAuthStore();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [qrmodalVisible, setQrmodalVisible] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [newAddress, setNewAddress] = useState(user?.contactd_info?.address || '');
    const [updating, setUpdating] = useState(false);


    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(
        user?.profileImage || null
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        resetAndNavigate('CustomerLogin');
                    }
                }
            ]
        );
    };



    const handleUpdateName = async () => {
        if (!newName.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }
        setUpdating(true);
        try {
           
            const updatePayload = {
                name: newName,
                contactd_info: {
                    ...user?.contactd_info,
                    address: newAddress
                }
            };
            await updateUser(updatePayload);
            
            setEditModalVisible(false);
            Alert.alert("Success", "Profile updated successfully");

        } catch (error) {
            console.log("Update Error", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };
    const handleAvatarEdit = () => {
        const options = {
            mediaType: 'photo' as const,
            includeBase64: false,
            maxWidth: 500,
            maxHeight: 500,
            quality: 0.8 as const,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
            }

            if (response.errorCode) {
                Alert.alert('Error', `Image picker error: ${response.errorMessage}`);
                return;
            }

            if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];

                try {
                    setUploadingImage(true);

                    
                    const uploadResponse = await uploadProfileImage(user?._id || user?.id, selectedImage.uri || '');

                    if (uploadResponse.imageUrl) {
                        
                        setProfileImageUri(uploadResponse.imageUrl);

                        
                        if (uploadResponse.provider) {
                            setUser(uploadResponse.provider);
                        }

                        Alert.alert('Success', 'Profile picture updated successfully!');
                    }
                } catch (error: any) {
                    console.log('Upload error:', error);
                    Alert.alert(
                        'Upload Failed',
                        error.message || 'Failed to upload image. Please try again.'
                    );
                } finally {
                    setUploadingImage(false);
                }
            }
        });
    };

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }


    const MenuItem = ({ icon, title, onPress, isDestructive = false, showChevron = true }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIconContainer]}>
                    <Icon
                        name={icon}
                        size={20}
                        color={isDestructive ? '#EF4444' : Colors.primary}
                        iconFamily="MaterialCommunityIcons"
                    />
                </View>
                <CustomText
                    style={[styles.menuText, isDestructive && styles.destructiveText]}
                    fontFamily={Fonts.Medium}
                >
                    {title}
                </CustomText>
            </View>
            {showChevron && (
                <Icon name="chevron-forward" size={20} color="#9CA3AF" iconFamily="Ionicons" />
            )}
        </TouchableOpacity>
    );


    const getContactDisplay = () => {
        if (user?.phone) return user.phone;
        if (user?.email) return user.email;
        return "No Contact Info";
    };

    return (
        <View style={styles.container}>

            <CustomHeader title="Profile" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.headerSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={
                                profileImageUri
                                    ? { uri: profileImageUri }
                                    : require('@assets/images/user.jpg')
                            }
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge} onPress={handleAvatarEdit}>
                            <Icon name="pencil" size={12} color="#fff" iconFamily="Ionicons" />
                        </TouchableOpacity>
                    </View>

                    <CustomText style={styles.userName} varient="h4" fontFamily={Fonts.Bold}>
                        {user?.name || "Provider Name"}
                    </CustomText>

                    <View style={styles.contactPill}>
                        <CustomText style={styles.contactText} fontFamily={Fonts.Medium}>
                            {getContactDisplay()}
                        </CustomText>
                    </View>

                    <CustomText style={[styles.contactText, { marginTop: 10, color: Colors.text, opacity: 0.7 }]} fontFamily={Fonts.Regular}>
                        {user?.contactd_info?.address || "No Address"}
                    </CustomText>
                </View>

                
                <View style={styles.menuCard}>
                    <MenuItem
                        icon="qrcode-scan"
                        title="My QR Code"
                        onPress={() => setQrmodalVisible(true)}
                    />
                    <View style={styles.divider} />

                    <MenuItem
                        icon="account-edit-outline"
                        title="Edit Profile"
                        onPress={() => {
                            setNewName(user?.name || '');
                            setNewAddress(user?.contactd_info?.address || '');
                            setEditModalVisible(true);
                        }}
                    />
                    <View style={styles.divider} />

                    <MenuItem
                        icon="file-document-outline"
                        title="Terms of Service"
                        onPress={() => handleOpenLink('https://www.bookaly.app/#terms-conditions')}
                    />
                    <View style={styles.divider} />

                    <MenuItem
                        icon="shield-check-outline"
                        title="Privacy Policy"
                        onPress={() => handleOpenLink('https://www.bookaly.app/#privacy-policy')}
                    />
                    <View style={styles.divider} />

                    <MenuItem
                        icon="headset"
                        title="Contact Us"
                        onPress={() => handleOpenLink('https://vivekbisen.me')}
                    />
                    <View style={styles.divider} />




                    <MenuItem
                        icon="delete-outline"
                        title="Request Account Deletion"
                        onPress={() => handleOpenLink('https://forms.gle/YMNpcUc15TgHJxVW9')}
                    />
                    <View style={styles.divider} />

                    <MenuItem
                        icon="logout"
                        title="Logout"
                        onPress={handleLogout}
                        isDestructive
                        showChevron={false}
                    />

                </View>

                <CustomText style={styles.versionText}>Version 1.0.18</CustomText>

            </ScrollView>


           
            <Modal
                transparent={true}
                visible={editModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle} varient="h5" fontFamily={Fonts.Bold}>
                            Edit Profile
                        </CustomText>

                        <View style={styles.inputContainer}>
                            <CustomText style={styles.inputLabel}>Full Name</CustomText>
                            <TextInput
                                style={styles.input}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="Enter your name"
                                cursorColor={Colors.primary}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <CustomText style={styles.inputLabel}>Address</CustomText>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                                value={newAddress}
                                onChangeText={setNewAddress}
                                placeholder="Enter your address"
                                cursorColor={Colors.primary}
                                multiline
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <CustomButton
                                title="Cancel"
                                onPress={() => setEditModalVisible(false)}
                                style={[styles.modalButton, styles.cancelButton]}
                                textStyle={{ color: '#374151' }}
                            />
                            <View style={{ width: 10 }} />
                            <CustomButton
                                title="Save"
                                onPress={handleUpdateName}
                                loading={updating}
                                style={[styles.modalButton, styles.saveButton]}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <QRGereratorModel
                visible={qrmodalVisible}
                onClose={() => setQrmodalVisible(false)}
            />

        </View>
    );
};

export default ProviderProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', 
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
        borderWidth: 4,
        borderColor: '#fff',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        color: '#111827',
        fontSize: 22,
        marginBottom: 8,
    },
    contactPill: {
        backgroundColor: '#E0F2FE', 
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    contactText: {
        color: '#0284C7', 
        fontSize: 14,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    destructiveIconContainer: {
        backgroundColor: '#FEF2F2',
    },
    menuText: {
        fontSize: 16,
        color: '#374151',
    },
    destructiveText: {
        color: '#EF4444',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 64, 
    },
    versionText: {
        textAlign: 'center',
        color: '#9CA3AF',
        marginTop: 24,
        fontSize: 12,
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 16,
        color: '#1f2937',
    },
    modalActions: {
        flexDirection: 'row',
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        marginTop: 0, 
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: Colors.primary,
    }
});
