import CustomButton from '@components/UI/CustomButton';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import { Colors, Fonts } from '@utils/Constants';
import { navigate, resetAndNavigate } from '@utils/NavigationUtils';
import React, { useState } from 'react';
import { registerCustomer } from '@service/authService';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Keyboard,
    Image
} from 'react-native';
import CountryPicker, { countries, Country } from './CountryCode';
import { RFValue } from 'react-native-responsive-fontsize';

const CustomerSignup = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

    const handleSignup = async () => {
        Keyboard.dismiss();
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const fullPhoneNumber = `${selectedCountry.dial_code}${phonenumber}`;
            const data = {
                name,
                phone: fullPhoneNumber,
                password
            }
            await registerCustomer(data);
            Alert.alert("Success", "Account created successfully", [
                { text: "OK", onPress: () => resetAndNavigate('Customerdashboard') }
            ]);

        } catch (error: any) {
            console.log("Signup Failed", error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigate('CustomerLogin')}
                >
                    <Icon
                        name="arrow-back-outline"
                        size={22}
                        color={Colors.text}
                        iconFamily="Ionicons"
                    />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('@assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode='contain'
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        <CustomText varient="h4" fontFamily={Fonts.Bold} style={styles.title}>
                            Create Account
                        </CustomText>
                        <CustomText varient="body" style={styles.subtitle}>
                            Sign up to get started
                        </CustomText>

                        <View style={styles.formContainer}>

                            <CustomText style={styles.label}>Full Name</CustomText>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconBox}>
                                    <Icon name="person-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setName}
                                    value={name}
                                    cursorColor={Colors.primary}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                            <View style={{ height: 15 }} />


                            <CustomText style={styles.label}>Phone Number</CustomText>
                            <View style={styles.phoneInputContainer}>
                                <TouchableOpacity
                                    style={styles.countryCode}
                                    onPress={() => setShowCountryPicker(true)}
                                >
                                    <CustomText style={styles.flag}>{selectedCountry.flag}</CustomText>
                                    <CustomText fontFamily={Fonts.Medium} style={styles.countryCodeText}>
                                        {selectedCountry.dial_code}
                                    </CustomText>
                                    <Icon name="caret-down" size={10} color="#6b7280" iconFamily="Ionicons" />
                                </TouchableOpacity>

                                <View style={styles.separator} />

                                <TextInput
                                    style={styles.phoneInput}
                                    onChangeText={text => setPhonenumber(text.slice(0, 10))}
                                    value={phonenumber}
                                    cursorColor={Colors.primary}
                                    keyboardType="number-pad"
                                    placeholder="Phone number"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                            <View style={{ height: 15 }} />

                            <CustomText style={styles.label}>Password</CustomText>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconBox}>
                                    <Icon name="lock-closed-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setPassword}
                                    value={password}
                                    cursorColor={Colors.primary}
                                    placeholder="Create password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={secureTextEntry}
                                />
                                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                                    <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 15 }} />

                            <CustomText style={styles.label}>Confirm Password</CustomText>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconBox}>
                                    <Icon name="lock-closed-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setConfirmPassword}
                                    value={confirmPassword}
                                    cursorColor={Colors.primary}
                                    placeholder="Confirm password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={confirmSecureTextEntry}
                                />
                                <TouchableOpacity onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)} style={styles.eyeIcon}>
                                    <Icon name={confirmSecureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                                </TouchableOpacity>
                            </View>

                        </View>

                        <CustomButton
                            title="Sign Up"
                            onPress={() => handleSignup()}
                            disabled={!name || phonenumber.length != 10 || !password || !confirmPassword}
                            loading={loading}
                            style={styles.continueButton}
                        />

                        <View style={styles.loginContainer}>
                            <CustomText style={styles.footerText}>Already have an account? </CustomText>
                            <TouchableOpacity onPress={() => navigate('CustomerLogin')}>
                                <CustomText style={styles.loginText}>Login</CustomText>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <CountryPicker
                visible={showCountryPicker}
                onSelect={setSelectedCountry}
                onClose={() => setShowCountryPicker(false)}
                selectedCountry={selectedCountry}
            />
        </SafeAreaView>
    );
};

export default CustomerSignup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 25,
        backgroundColor: '#F9FAFB',
    },
    navBar: {
        paddingHorizontal: 24,
        paddingTop: 10,
        zIndex: 10
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1, shadowRadius: 4
            },
            android: { elevation: 3 }
        })
    },
    scrollContent: {
        flexGrow: 1,
        
        paddingBottom: 40
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: RFValue(120),
        height: RFValue(80),
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    title: {
        color: '#111827',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 5
    },
    subtitle: {
        color: '#6b7280',
        marginBottom: 30,
        fontSize: 14,
        textAlign: 'center'
    },
    formContainer: {
        marginBottom: 24,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 58,
        paddingHorizontal: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 }
        })
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: '100%',
        marginRight: 10,
    },
    flag: {
        fontSize: 22,
    },
    countryCodeText: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 4
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
        marginRight: 12
    },
    phoneInput: {
        flex: 1,
        fontSize: 17,
        color: '#1f2937',
        height: '100%',
        fontFamily: Fonts.Medium,
        padding: 0
    },
    label: {
        marginBottom: 8,
        color: '#374151',
        fontWeight: '500'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 58,
        paddingHorizontal: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 }
        })
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#111827',
        fontSize: 16,
        marginLeft: 10
    },
    iconBox: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    eyeIcon: {
        padding: 4
    },
    continueButton: {
        marginTop: 0,
        height: 56,
        borderRadius: 16
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    footerText: {
        color: '#9ca3af',
        fontSize: 14
    },
    loginText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: 14,
    }
});
