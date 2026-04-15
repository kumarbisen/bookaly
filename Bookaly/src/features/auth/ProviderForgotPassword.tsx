import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Text
} from 'react-native';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import CustomButton from '@components/UI/CustomButton';
import { Colors, Fonts } from '@utils/Constants';
import { resetAndNavigate, goBack, navigationRef } from '@utils/NavigationUtils';
import { resetProviderPassword } from '@service/authService';
import auth from '@react-native-firebase/auth';
import CountryPicker, { countries, Country } from './CountryCode';

const ProviderForgotPassword = () => {

    const [step, setStep] = useState<'PHONE_INPUT' | 'OTP_INPUT' | 'PASSWORD_RESET'>('PHONE_INPUT');

    // Phone Input State
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

    // OTP State
    const [confirmation, setConfirmation] = useState<any>(null);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const inputs = useRef<Array<TextInput | null>>([]);

    // Password Reset State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);


    // Timer logic for OTP
    useEffect(() => {
        let interval: any;
        if (step === 'OTP_INPUT' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);


    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert("Error", "Please enter a valid phone number");
            return;
        }

        // Basic formatting
        const formattedPhone = `${selectedCountry.dial_code}${phone}`;

        setLoading(true);
        try {
            const confirmationResult = await auth().signInWithPhoneNumber(formattedPhone);
            setConfirmation(confirmationResult);
            setStep('OTP_INPUT');
            setTimer(60);
        } catch (error: any) {
            console.log("OTP Send Error", error);
            if (error.code === 'auth/invalid-phone-number') {
                Alert.alert('Error', 'Invalid phone number.');
            } else if (error.code === 'auth/quota-exceeded') {
                Alert.alert('Error', 'SMS quota exceeded. Try again later.');
            } else if (error.code === 'auth/billing-not-enabled' || error.message?.includes('billing')) {
                Alert.alert('Configuration Error', 'Firebase billing is not enabled. Please enable billing in the Firebase Console.');
            } else {
                Alert.alert('Error', 'Failed to send OTP. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const otp = otpCode.join('');
        if (otp.length !== 6) return;

        setLoading(true);
        try {
            await confirmation.confirm(otp);
            // Success
            setStep('PASSWORD_RESET');
        } catch (error) {
            console.log("OTP Verify Error", error);
            Alert.alert("Error", "OTP Mismatch. Please try again.");
            // Clear OTP?
            // setOtpCode(['', '', '', '', '', '']);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        // Re-use send logic but keep step same
        const formattedPhone = `${selectedCountry.dial_code}${phone}`;
        try {
            const confirmationResult = await auth().signInWithPhoneNumber(formattedPhone);
            setConfirmation(confirmationResult);
            setTimer(60);
            Alert.alert("Success", "OTP Resent successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to resend OTP");
        }
    };

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...otpCode];
        newCode[index] = text;
        setOtpCode(newCode);
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        // Auto verify? User didn't request explicitly but it's good UX.
        // if (newCode.every(d => d !== '') && index === 5) { ... }
    };
    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };


    // Step 3: Reset Password
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            // Identifier is the phone number
            // Use the raw phone number as that is likely how it is stored in the DB (based on SignUp)
            // The OTP verification confirms they own the number.
            const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
            await resetProviderPassword(fullPhoneNumber, newPassword);
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'Login Now', onPress: () => resetAndNavigate('ProviderLogin') }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to reset password';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };


    // Renders
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (navigationRef.isReady() && navigationRef.canGoBack()) {
                            goBack();
                        } else {
                            resetAndNavigate('ProviderLogin');
                        }
                    }}>
                        <Icon name="arrow-back" size={24} color="#333" iconFamily="Ionicons" />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <CustomText varient="h3" fontFamily={Fonts.Bold} style={styles.title}>
                            {step === 'PASSWORD_RESET' ? 'Set New Password'
                                : step === 'OTP_INPUT' ? 'Verify OTP'
                                    : 'Forgot Password'}
                        </CustomText>
                        <CustomText varient="h7" style={styles.subtitle}>
                            {step === 'PASSWORD_RESET' ? 'Create a strong password for your account.'
                                : step === 'OTP_INPUT' ? `Enter the 6-digit code sent to ${phone}`
                                    : 'Enter your phone number to reset your password.'}
                        </CustomText>
                    </View>

                    <View style={styles.formContainer}>
                        {/* STEP 1: PHONE */}
                        {step === 'PHONE_INPUT' && (
                            <>
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
                                        onChangeText={setPhone}
                                        value={phone}
                                        cursorColor={Colors.primary}
                                        placeholder="Enter phone number"
                                        keyboardType="number-pad"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <CustomButton
                                    title="Send OTP"
                                    onPress={handleSendOtp}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.actionButton}
                                />
                            </>
                        )}


                        {/* STEP 2: OTP */}
                        {step === 'OTP_INPUT' && (
                            <>
                                <View style={styles.otpContainer}>
                                    {otpCode.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputs.current[index] = ref; }}
                                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleCodeChange(text, index)}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace') {
                                                    handleBackspace(otpCode[index], index);
                                                }
                                            }}
                                            cursorColor={Colors.primary}
                                        />
                                    ))}
                                </View>

                                <View style={styles.resendContainer}>
                                    {timer > 0 ? (
                                        <CustomText style={styles.timerText}>
                                            Resend in <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{timer}s</Text>
                                        </CustomText>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendOtp}>
                                            <CustomText style={{ color: Colors.primary, fontSize: 16 }}>Resend OTP</CustomText>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <CustomButton
                                    title="Verify OTP"
                                    onPress={handleVerifyOtp}
                                    loading={loading}
                                    disabled={otpCode.some(c => c === '')}
                                    style={styles.actionButton}
                                />
                            </>
                        )}

                        {/* STEP 3: RESET PASSWORD */}
                        {step === 'PASSWORD_RESET' && (
                            <>
                                <CustomText style={styles.label}>New Password</CustomText>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}>
                                        <Icon name="lock-closed-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={setNewPassword}
                                        value={newPassword}
                                        cursorColor={Colors.primary}
                                        placeholder="New Password"
                                        secureTextEntry={secureTextEntry}
                                        placeholderTextColor="#9ca3af"
                                    />
                                    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                                        <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                                    </TouchableOpacity>
                                </View>

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
                                        placeholder="Confirm Password"
                                        secureTextEntry={secureTextEntry}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                <CustomButton
                                    title="Reset Password"
                                    onPress={handleResetPassword}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.actionButton}
                                />
                            </>
                        )}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        marginTop: 25
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerContainer: {
        marginBottom: 32,
    },
    title: {
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        color: '#6b7280',
    },
    formContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 56,
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
    },
    iconBox: {
        width: 48,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#1f2937',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 56,
        paddingHorizontal: 16,
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
        fontSize: 16,
        color: '#1f2937',
        height: '100%',
        fontFamily: Fonts.Regular,
        padding: 0
    },
    eyeIcon: {
        padding: 12
    },
    actionButton: {
        height: 56,
        borderRadius: 16,
        marginTop: 10
    },
    // OTP Styles
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        color: '#1f2937',
        backgroundColor: '#fff',
        elevation: 1,
    },
    otpInputFilled: {
        borderColor: Colors.primary,
        backgroundColor: '#F0F9FF',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 24
    },
    timerText: {
        color: '#6b7280',
        fontSize: 14
    }
});

export default ProviderForgotPassword;
