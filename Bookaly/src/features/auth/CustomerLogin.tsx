import CustomButton from '@components/UI/CustomButton';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';
import { Colors, Fonts } from '@utils/Constants';
import { navigate, resetAndNavigate } from '@utils/NavigationUtils';
// auth import removed
import React, { useState } from 'react';
import { customerLogin } from '@service/authService';
import { handleOpenLink } from '@utils/OpenLink';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Keyboard,
  Alert
} from 'react-native';
import CountryPicker, { countries, Country } from './CountryCode';
import { RFValue } from 'react-native-responsive-fontsize';
import { screenHeight,screenWidth } from '@utils/Scaling'; 
const CustomerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [phonenumber, setPhonenumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);


  const handleAuth = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {

      const fullPhoneNumber = `${selectedCountry.dial_code}${phonenumber}`;

      await customerLogin(fullPhoneNumber, password);
      resetAndNavigate('Customerdashboard');

    } catch (error: any) {
      const msg =error?.response?.data?.message ||error?.message ||'Invalid Phone Number or Password';
      setLoading(false);
      Alert.alert('Login Failed', 'Invalid Phone Number or Password');

    }
  };


  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.providerButton}
          onPress={() => navigate('ProviderLogin')}
        >
          <Icon
            name="storefront-outline"
            size={20}
            color={Colors.primary}
            iconFamily="Ionicons"
          />
          <CustomText style={styles.providerText}>Provider Login</CustomText>
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

            <View style={styles.formContainer}>
              <CustomText style={styles.label}>Mobile Number</CustomText>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryCode}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <CustomText style={styles.flag}>{selectedCountry.flag}</CustomText>
                  <CustomText fontFamily={Fonts.Medium} style={styles.countryCodeText}>
                    {selectedCountry.dial_code}
                  </CustomText>
                  <Icon name="caret-down" size={10} color="#6B7280" iconFamily="Ionicons" />
                </TouchableOpacity>

                <TextInput
                  style={styles.phoneInput}
                  onChangeText={text => setPhonenumber(text.slice(0, 10))}
                  value={phonenumber}
                  cursorColor={Colors.primary}
                  keyboardType="number-pad"
                  placeholder="Phone number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <CustomText style={styles.label}>Password</CustomText>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Icon name="lock-closed-outline" size={20} color="#9CA3AF" iconFamily="Ionicons" />
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setPassword(text)}
                    value={password}
                    cursorColor={Colors.primary}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                    <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" iconFamily="Ionicons" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigate('CustomerForgotPassword')}>
                  <CustomText style={styles.forgotPassword}>Forgot Password?</CustomText>
                </TouchableOpacity>
              </View>
            </View>


            <CustomButton
              title="Login"
              onPress={() => handleAuth()}
              disabled={phonenumber?.length != 10 || !password}
              loading={loading}
              style={styles.continueButton}
            />

            <View style={styles.signupContainer}>
              <CustomText style={styles.footerText}>Don't have an account?,</CustomText>
              <TouchableOpacity onPress={() => navigate('CustomerSignup')}>
                <CustomText style={styles.signupText}>Sign Up</CustomText>
              </TouchableOpacity>
            </View>



            <CustomText varient="body" style={styles.termsText}>
              By continuing, you agree to our{' '}
              <CustomText
                style={{ color: Colors.primary, fontSize:10  }}
                onPress={() => handleOpenLink('https://bookaly.app/#terms-conditions')}
              >
                Terms of Service
              </CustomText>
              {' '}&{' '}
              <CustomText
                style={{ color: Colors.primary, fontSize:10}}
                onPress={() => handleOpenLink('https://bookaly.app/#privacy-policy')}
              >
                Privacy Policy
              </CustomText>
            </CustomText>
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

export default CustomerLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 10
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  providerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: RFValue(160),
    height: RFValue(90),
  },
  contentContainer: {
    marginTop:screenHeight * 0.05,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    marginRight: 12
  },
  flag: {
    fontSize: 20,
    marginRight: 6
  },
  countryCodeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginRight: 4
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
    fontFamily: Fonts.Medium,
    padding: 0
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 16,
    marginLeft: 12
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 8
  },
  forgotPassword: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 12,
    alignSelf: 'flex-end',
    marginBottom: 24
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 4
  },
  termsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: screenHeight * 0.07,
    fontSize: 10,
    lineHeight: 18,
    paddingHorizontal: 20
  }
});
