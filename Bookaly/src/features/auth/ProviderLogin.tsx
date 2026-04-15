import CustomButton from '@components/UI/CustomButton';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import { providerLogin } from '@service/authService';
import { Colors, Fonts } from '@utils/Constants';
import { resetAndNavigate, navigate } from '@utils/NavigationUtils';
import React, { useState } from 'react';
import CountryPicker, { Country, countries } from './CountryCode';
import { StyleSheet, TextInput, View, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';

const ProviderLogin = () => {
  const [loginCredential, setloginCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const isPhoneInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.includes('@')) return false;
    if (/^\d/.test(trimmed)) return true;
    if (trimmed.startsWith('+')) return true;
    return false;
  };
  const isPhoneMode = isPhoneInput(loginCredential);

  const handleAuth = async () => {
    setLoading(true);
    try {
      let identifier = loginCredential.trim();

      // If not an email (no @), assume it's a phone number
      if (isPhoneInput(identifier)) {
        let digits = identifier.replace(/\D/g, '');
        const dialDigits = selectedCountry.dial_code.replace(/\D/g, '');
        if (dialDigits && digits.startsWith(dialDigits)) {
          digits = digits.slice(dialDigits.length);
        }
        identifier = digits ? `${selectedCountry.dial_code}${digits}` : '';
      }

      await providerLogin({ email: identifier, password });
      resetAndNavigate('ProviderHome');
    } catch (error: any) {
      console.log('Login Failed', error);
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    resetAndNavigate('ProviderSignUp');
  }

  const handleGoBack = () => {
    resetAndNavigate('CustomerLogin');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color="#333" iconFamily="Ionicons" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <CustomText varient="h3" fontFamily={Fonts.Bold} style={styles.title}>
              Provider Login
            </CustomText>
            <CustomText varient="h7" style={styles.subtitle}>
              Welcome back! Please enter your details.
            </CustomText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <CustomText style={styles.label}>
             Phone Number or Email
            </CustomText>

            <View style={styles.inputWrapper}>
              <View style={styles.iconBox}>
                <Icon name="person-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
              </View>
              {isPhoneMode && (
                <TouchableOpacity
                  style={styles.countryCodeBox}
                  onPress={() => setCountryPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <CustomText style={styles.countryCodeText}>{selectedCountry.dial_code}</CustomText>
                </TouchableOpacity>
              )}
              <TextInput
                style={styles.input}
                onChangeText={text => setloginCredential(text)}
                value={loginCredential}
                cursorColor={Colors.primary}
                placeholder={isPhoneMode ? 'Enter phone number' : 'Enter your email'}
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType={isPhoneMode ? 'phone-pad' : 'email-address'}
                autoCorrect={false}
              />
            </View>

            <CustomText style={styles.label}>Password</CustomText>
            <View style={styles.inputWrapper}>
              <View style={styles.iconBox}>
                <Icon name="lock-closed-outline" size={20} color={Colors.text} iconFamily="Ionicons" />
              </View>
              <TextInput
                style={styles.input}
                onChangeText={text => setPassword(text)}
                value={password}
                cursorColor={Colors.primary}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" iconFamily="Ionicons" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigate('ProviderForgotPassword')}>
              <CustomText style={styles.forgotPassword}>Forgot Password?</CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.btnContainer}>
            <CustomButton
              title="Login"
              onPress={handleAuth}
              disabled={false}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.SignupContainer}>



            <CustomText varient="h6" fontFamily={Fonts.Medium} style={styles.label}>Don't have an account?</CustomText>
            <TouchableOpacity onPress={handleSignUp}>
              <CustomText varient="h6" fontFamily={Fonts.Medium} style={styles.label2}>Sign Up</CustomText>
            </TouchableOpacity>

          </View>


        </ScrollView>
      </KeyboardAvoidingView>
      <CountryPicker
        visible={countryPickerVisible}
        onSelect={setSelectedCountry}
        onClose={() => setCountryPickerVisible(false)}
        selectedCountry={selectedCountry}
      />
    </SafeAreaView>
  );
};

export default ProviderLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 10,
  },

  SignupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 }
    })
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
  label2: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
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
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 }
    })
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
  countryCodeBox: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 12,
  },
  btnContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 56,
    marginBottom: 24,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 }
    })
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  forgotPassword: {
    color: Colors.primary,
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600'
  }
});
