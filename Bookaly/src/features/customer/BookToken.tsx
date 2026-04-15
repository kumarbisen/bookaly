import { RouteProp, useRoute } from '@react-navigation/native';
import { collectData } from '@state/scanStore';

import React, { FC, use, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@components/global/Icon';
import { goBack, navigate, push, resetAndNavigate } from '@utils/NavigationUtils';
import { Colors } from '@utils/Constants';
import { booktoken, searchProvider } from '@service/BookingProvider';
import { useAuthStore } from '@state/authStore';


const BookToken = () => {
  const { providerId, updateTokenData } = collectData()
  const { user } = useAuthStore()


  const [providerDetails, setProviderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (providerId) {
        const data = await searchProvider(providerId);
        if (data && data.provider) {
          setProviderDetails(data.provider);
        }
      }
    };
    fetchProviderDetails();
  }, [providerId]);

  const handleToken = async () => {
    try {
      console.log('Attempting to book token for provider:', providerId);
      const res = await booktoken(providerId);
      console.log('Book token response:', res);

      if (res && res.token) {
        updateTokenData(res.token);
        resetAndNavigate('Customerdashboard');
      }
    } catch (error: any) {
      console.log('Booking error', error);
      Alert.alert('Booking Failed', error.message || 'Something went wrong. Please try again.');
    }
  }


  return (
    <View style={styles.container}>


      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1f2937" iconFamily="Ionicons" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Provider Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={
                providerDetails?.profileImage
                  ? { uri: providerDetails.profileImage }
                  : require('@assets/images/user.jpg')
              }
              style={styles.avatar}
            />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{providerDetails?.name || 'Provider Name'}</Text>
              <Text style={styles.providerId}>ID: {providerDetails?.provider_id || providerId}</Text>
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={14} color="#fff" iconFamily="MaterialCommunityIcons" />
                <Text style={styles.verifiedText}>Verified Provider</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="email-outline" size={18} color={Colors.primary} iconFamily="MaterialCommunityIcons" />
              <Text style={styles.detailText}>{providerDetails?.email || 'Email not available'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="map-marker-outline" size={18} color={Colors.primary} iconFamily="MaterialCommunityIcons" />
              <Text style={styles.detailText} numberOfLines={2}>
                {providerDetails?.contactd_info?.address || 'Address not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* User Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>BOOKED BY</Text>
          <View style={styles.userCard}>
            <View style={styles.userIconBg}>
              <Icon name="account" size={24} color={Colors.primary} iconFamily="MaterialCommunityIcons" />
            </View>
            <View>
              <Text style={styles.userName}>Current User</Text>
              <Text style={styles.userPhone}>{user?.phone || 'No phone number'}</Text>
            </View>
          </View>
        </View>


        <View style={styles.footer}>
          <TouchableOpacity onPress={handleToken} activeOpacity={0.8} style={styles.buttonWrapper}>

            <Text style={styles.primaryButtonText}>Confirm & Get Token</Text>
            <Icon name="arrow-right" size={20} color="#fff" iconFamily="MaterialCommunityIcons" />

          </TouchableOpacity>

          <TouchableOpacity onPress={() => goBack()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default BookToken;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#f3f4f6',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  providerId: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  detailsRow: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1,
    left: 10,
    textTransform: 'uppercase',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfeff', // Very light cyan
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    gap: 12,
  },
  buttonWrapper: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
