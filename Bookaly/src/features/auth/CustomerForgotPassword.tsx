import CustomButton from '@components/UI/CustomButton';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import { Colors, Fonts } from '@utils/Constants';
import { navigate, resetAndNavigate } from '@utils/NavigationUtils';
import auth from '@react-native-firebase/auth';
import React, { useState, useRef, useEffect } from 'react';
import { resetCustomerPassword } from '@service/authService';
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
    Image,
    ActivityIndicator,
    Text
} from 'react-native';
import CountryPicker, { countries, Country } from './CountryCode';
import { RFValue } from 'react-native-responsive-fontsize';

const CustomerForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [phonenumber, setPhonenumber] = useState('');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
    const [confirmResult, setConfirmResult] = useState<any>(null);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);

    const inputs = useRef<Array<TextInput | null>>([]);


    // OTP Timer
    useEffect(() => {
        let interval: any;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);


    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (phonenumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }
        Keyboard.dismiss();
        setLoading(true);
        try {
            const fullPhoneNumber = `${selectedCountry.dial_code}${phonenumber}`;
            const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
            setConfirmResult(confirmation);
            setStep(2);
            setTimer(60);
        } catch (error: any) {
            console.log("Send OTP Failed", error);
            if (error.code === 'auth/invalid-phone-number') {
                Alert.alert('Invalid Phone Number', 'Please check your phone number and try again.');
            } else if (error.code === 'auth/quota-exceeded') {
                Alert.alert('Quota Exceeded', 'SMS quota exceeded. Please try again later.');
            }
            else {
                Alert.alert('Error', 'Failed to send OTP. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };


    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const otp = code.join('');
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        try {
            await confirmResult.confirm(otp);
            setStep(3);
        } catch (error) {
            console.log("Verify OTP Failed", error);
            Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        if (newCode.every(digit => digit !== '') && index === 5) {
            Keyboard.dismiss();
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const resendCode = async () => {
        setLoading(true);
        try {
            const fullPhoneNumber = `${selectedCountry.dial_code}${phonenumber}`;
            const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
            setConfirmResult(confirmation);
            setTimer(60);
            Alert.alert('Code Sent', 'A new verification code has been sent.');
        } catch (error) {
            console.log("Resend Failed", error);
            Alert.alert('Error', 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };


    // Step 3: Reset Password
    const handleResetPassword = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const fullPhoneNumber = `${selectedCountry.dial_code}${phonenumber}`;
            await resetCustomerPassword(fullPhoneNumber, newPassword);
            Alert.alert("Success", "Password reset successfully. Please login with your new password.", [
                { text: "OK", onPress: () => replaceAndNavigateToLogin() }
            ]);
        } catch (error: any) {
            console.log("Reset Password Failed", error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const replaceAndNavigateToLogin = () => {
        navigate('CustomerLogin');
    }


    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <CustomText varient="body" style={styles.subtitle}>
                Enter your registered mobile number to receive an OTP
            </CustomText>
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

            <CustomButton
                title="Send OTP"
                onPress={handleSendOtp}
                disabled={phonenumber.length != 10}
                loading={loading}
                style={styles.continueButton}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <CustomText varient="body" style={styles.subtitle}>
                Enter the verification code sent to {selectedCountry.dial_code}{phonenumber}
            </CustomText>

            <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputs.current[index] = ref; }}
                        style={[
                            styles.otpInput,
                            digit ? styles.otpInputFilled : null
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleCodeChange(text, index)}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace') {
                                handleBackspace(code[index], index);
                            }
                        }}
                        cursorColor={Colors.primary}
                    />
                ))}
            </View>

            <View style={styles.resendContainer}>
                {timer > 0 ? (
                    <CustomText style={styles.timerText}>
                        Resend code in <Text style={styles.timerCount}>{timer}s</Text>
                    </CustomText>
                ) : (
                    <TouchableOpacity onPress={resendCode} disabled={loading}>
                        <CustomText style={styles.resendText} fontFamily={Fonts.Medium}>
                            Resend Code
                        </CustomText>
                    </TouchableOpacity>
                )}
            </View>

            <CustomButton
                title="Verify OTP"
                onPress={handleVerifyOtp}
                disabled={code.some(c => c === '')}
                loading={loading}
                style={styles.continueButton}
            />
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <CustomText varient="body" style={styles.subtitle}>
                Create a new password for your account
            </CustomText>

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
                    placeholder="New password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureTextEntry}
                />
                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                    <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                </TouchableOpacity>
            </View>

            <View style={{ height: 15 }} />

            <CustomText style={styles.label}>Confirm New Password</CustomText>
            <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                    <Icon name="lock-closed-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
                </View>
                <TextInput
                    style={styles.input}
                    onChangeText={setConfirmNewPassword}
                    value={confirmNewPassword}
                    cursorColor={Colors.primary}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={confirmSecureTextEntry}
                />
                <TouchableOpacity onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)} style={styles.eyeIcon}>
                    <Icon name={confirmSecureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                </TouchableOpacity>
            </View>

            <CustomButton
                title="Reset Password"
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmNewPassword}
                loading={loading}
                style={styles.continueButton}
            />

        </View>
    )

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
                            {step === 3 ? 'Reset Password' : 'Forgot Password'}
                        </CustomText>

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

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

export default CustomerForgotPassword;

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
        justifyContent:'center'
        
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
    continueButton: {
        marginTop: 20,
        height: 56,
        borderRadius: 16
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly",
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
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
            android: { elevation: 1 }
        })
    },
    otpInputFilled: {
        borderColor: Colors.primary,
        backgroundColor: '#F0F9FF',
    },
    resendContainer: {
        marginBottom: 10,
        alignItems: 'center'
    },
    timerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    timerCount: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    resendText: {
        color: Colors.primary,
        fontSize: 16,
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
});
