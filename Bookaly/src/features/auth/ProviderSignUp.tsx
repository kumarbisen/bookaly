import React, { useState, useCallback } from 'react';
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
    TouchableWithoutFeedback
} from 'react-native';
import CountryPicker, { countries, Country } from './CountryCode';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import { Colors, Fonts } from '@utils/Constants';
import { navigate, resetAndNavigate } from '@utils/NavigationUtils';
import { providerLogin, checkUsernameAvailability, providerSignUp } from '@service/authService';
import CustomButton from '@components/UI/CustomButton';
import { debounce } from 'lodash';

const ProviderSignUp = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        provider_id: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedCheck = useCallback(
        debounce(async (username: string) => {
            if (!username || username.length < 3) {
                setIsAvailable(null);
                setIsChecking(false);
                return;
            }
            setIsChecking(true);
            try {
                const data = await checkUsernameAvailability(username);
                setIsAvailable(data.available);
            } catch (error) {
                console.log("Check username error", error);
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        }, 500),
        []
    );

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (key === 'provider_id') {
            setIsAvailable(null);
            debouncedCheck(value);
        }
    };

    const handleSignUp = async () => {
        const { name, provider_id, phone, email, password, confirmPassword } = formData;

        if (!name || !provider_id || !phone || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (isAvailable === false) {
            Alert.alert("Error", "Username is already taken");
            return;
        }

        setLoading(true);
        try {
            await providerSignUp({
                email,
                password,
                name,
                phone: `${selectedCountry.dial_code}${phone}`,
                provider_id
            });
            resetAndNavigate('ProviderLogin');
        } catch (error: any) {
            console.log("Sign Up Error", error);
            const msg = error.response?.data?.message || "Sign up failed";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>


            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigate('ProviderLogin')} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="#1f2937" iconFamily="Ionicons" />
                        </TouchableOpacity>
                        <CustomText varient="h4" fontFamily={Fonts.Bold} style={styles.title}>
                            Provider Sign Up
                        </CustomText>
                    </View>

                    <View style={styles.formContainer}>


                        <View style={styles.inputWrapper}>
                            <CustomText style={styles.label}>Business Name</CustomText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your business name"
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                                cursorColor={Colors.primary}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <CustomText style={styles.label}>Public Username (ID)</CustomText>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.inputWithIcon,
                                        isAvailable === true && styles.inputSuccess,
                                        isAvailable === false && styles.inputError
                                    ]}
                                    placeholder="Unique public ID (e.g. mybusiness_blr)"
                                    value={formData.provider_id}
                                    onChangeText={(text) => handleChange('provider_id', text)}
                                    autoCapitalize="none"
                                    cursorColor={Colors.primary}
                                />
                                <View style={styles.iconContainer}>
                                    {isChecking ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : isAvailable === true ? (
                                        <Icon name="checkmark-circle" size={20} color="green" iconFamily="Ionicons" />
                                    ) : isAvailable === false ? (
                                        <Icon name="close-circle" size={20} color="red" iconFamily="Ionicons" />
                                    ) : null}
                                </View>
                            </View>
                            {isAvailable === false && (
                                <CustomText style={styles.errorText}>Username is already taken</CustomText>
                            )}
                        </View>

                        {/* Phone */}
                        <View style={styles.inputWrapper}>
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
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChangeText={(text) => handleChange('phone', text)}
                                    keyboardType="number-pad"
                                    cursorColor={Colors.primary}
                                />
                            </View>
                        </View>


                        <View style={styles.inputWrapper}>
                            <CustomText style={styles.label}>Email Address</CustomText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                cursorColor={Colors.primary}
                            />
                        </View>


                        <View style={styles.inputWrapper}>
                            <CustomText style={styles.label}>Password</CustomText>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChangeText={(text) => handleChange('password', text)}
                                    secureTextEntry={secureTextEntry}
                                    cursorColor={Colors.primary}
                                />
                                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                                    <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                                </TouchableOpacity>
                            </View>

                        </View>


                        <View style={styles.inputWrapper}>
                            <CustomText style={styles.label}>Confirm Password</CustomText>
                            <View style={styles.passwordInputContainer}>

                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => handleChange('confirmPassword', text)}
                                    secureTextEntry={secureTextEntry}
                                    cursorColor={Colors.primary}
                                />
                                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                                    <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
                                </TouchableOpacity>
                            </View>

                        </View>

                        <CustomButton
                            title="Sign Up"
                            onPress={handleSignUp}
                            loading={loading}
                            disabled={loading}
                            style={styles.signUpButton}
                        />

                    </View>

                    <View style={styles.footer}>
                        <CustomText style={styles.footerText}>Already have an account? </CustomText>
                        <TouchableOpacity onPress={() => navigate('ProviderLogin')}>
                            <CustomText style={styles.linkText} fontFamily={Fonts.Bold}>Login</CustomText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <CountryPicker
                visible={showCountryPicker}
                onSelect={setSelectedCountry}
                onClose={() => setShowCountryPicker(false)}
                selectedCountry={selectedCountry}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        marginBottom: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        color: '#111827',
    },
    formContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        marginBottom: 16,

    },
    label: {
        marginBottom: 6,
        color: '#374151',
        fontSize: 14,
        fontFamily: Fonts.Medium
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        fontSize: 16,
        color: '#1f2937',
        fontFamily: Fonts.Regular,
        flex: 1
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWithIcon: {
        paddingRight: 40
    },
    iconContainer: {
        position: 'absolute',
        right: 12,
        height: '100%',
        justifyContent: 'center'
    },
    inputSuccess: {
        borderColor: 'green'
    },
    inputError: {
        borderColor: 'red'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4
    },
    signUpButton: {
        marginTop: 24,
        borderRadius: 16,
        height: 56
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color: Colors.primary, // Using primary color for link
        fontSize: 14,
    },

    eyeIcon: {
        padding: 12,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 50,
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
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 50,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#1f2937',
        fontFamily: Fonts.Regular,
    }
});

export default ProviderSignUp;