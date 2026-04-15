import CustomText from '@components/UI/CustomText';
import moment from 'moment-timezone';
import { Colors } from '@utils/Constants';
import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '@components/global/Icon';
import { booktoken, fetchTokens, fetchUserTokens } from '@service/BookingProvider';
import { useRoute } from '@react-navigation/native';
import { countries } from '../../features/auth/CountryCode';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RefreshControl } from 'react-native';
import { collectData } from '@state/scanStore';
import { useFavoriteStore } from '@state/favoriteStore';
import { TouchableOpacity } from 'react-native';
import { io } from "socket.io-client";
import { SOCKET_URL } from "@service/config";
import { tokenStorage } from '@state/storage';
import { jwtDecode } from "jwt-decode";


interface tokendata {
  _id?: string;
  token_id: number;
  issued_at: string | Date;
  user_id?: { name?: string; phone?: string } | string;
  provider_id?: { _id: string; name: string; provider_id: string } | string;
  expires_at?: string;
}

const Content: FC = () => {
  const insets = useSafeAreaInsets();
  const [tokens, setTokens] = useState<tokendata[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { tokenData } = collectData();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();

  const load = async () => {
    
    if (tokens.length === 0 && !refreshing) setLoading(true);

    const data = await fetchUserTokens();
    console.log(data);

    if (data && data.tokens) {
      const activeTokens = data.tokens;
      const today = new Date().toDateString();
      const todaysTokens = activeTokens.filter((token: tokendata) => new Date(token.issued_at).toDateString() === today);
      setTokens(todaysTokens.reverse());
    }

    setLoading(false);
  };


  useEffect(() => {
    load();
  }, [tokenData]);

  useEffect(() => {
    let socket: any;
    const token = tokenStorage.getString('accessToken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.userId || decoded.id; 

        socket = io(SOCKET_URL);
        console.log("Connecting to socket:", SOCKET_URL);

        socket.on("connect", () => {
          console.log("Socket connected");
          socket.emit("joinRoom", userId);
        });

        socket.on("token_updated", (data: any) => {
          console.log("Token updated event received:", data);
          load();
          load();
        });

      } catch (e) {
        console.log("Socket setup error", e);
      }
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);



  const onRefresh = async () => {
    setRefreshing(true);

    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: tokendata }) => {
    const date = new Date(item.issued_at);
    const userPhone = typeof item.user_id === 'object' && item.user_id?.phone ? item.user_id.phone : '';
   
    let userTimezone = moment.tz.guess(); 
    if (userPhone) {
      const matchedCountry = countries.find(c => userPhone.startsWith(c.dial_code));
      if (matchedCountry && matchedCountry.timezone) {
        userTimezone = matchedCountry.timezone;
      }
    }

    const expires = item.expires_at ? moment(item.expires_at).tz(userTimezone).format('HH:mm') : null;

    const providerObject = typeof item.provider_id === 'object' ? item.provider_id : null;
    const businessName = providerObject ? providerObject.name : 'Provider';
    const publicProviderId = providerObject ? providerObject.provider_id : '';
    const internalProviderId = providerObject ? providerObject._id : (item.provider_id as string);

    const favId = publicProviderId || internalProviderId;

    const isFav = isFavorite(favId);

    const toggleFavorite = () => {
      if (isFav) {
        removeFavorite(favId);
      } else {
        addFavorite({
          _id: favId,
          name: businessName,
        });
      }
    };

    return (
      <View style={styles.cardcontainer}>


        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, styles.providerIconBg]}>
              <Icon
                name="storefront-outline"
                size={22}
                iconFamily="MaterialCommunityIcons"
                color={Colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <CustomText style={styles.providerName} numberOfLines={1}>
                {businessName}
              </CustomText>
              <Text style={styles.providerIdText}>
                ID: {publicProviderId || internalProviderId}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <CustomText style={styles.statusText}>Active</CustomText>
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favIcon}>
              <Icon
                name={isFav ? "heart" : "heart-outline"}
                size={24}
                color={isFav ? "#ef4444" : "#9ca3af"}
                iconFamily="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </View>


          <LinearGradient
            colors={['#e3f2fd', '#f3f4f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tokenContainer}
          >
            <CustomText style={styles.tokenLabel}>TOKEN NUMBER</CustomText>
            <CustomText style={styles.tokenNumber}>{item.token_id}</CustomText>
          </LinearGradient>

          
          <View style={styles.cardFooter}>
            <View style={styles.footerRow}>
              <Icon name="calendar-outline" size={16} color="#666" iconFamily="Ionicons" />
              <Text style={styles.footerText}>Booked: {date.toLocaleDateString()}</Text>
            </View>

            <View style={styles.footerRow}>
              <Icon name="time-outline" size={16} color='#d32f2f' iconFamily="Ionicons" />
              <Text style={[styles.footerText, { color: '#d32f2f' }]}>
                Expires : {expires ? expires : 'no expiry'}
              </Text>
            </View>
          </View>
        </View>
      </View >
    );
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 24, }} size="large" color={Colors.primary} />;

  return (
    <View style={[
      styles.container,
      {
        paddingBottom: insets.bottom,
        marginBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom + 10, 15) + 25
      }
    ]}>
      <>
        <View >
          <FlatList
            data={tokens}
            keyExtractor={item => item._id ?? String(item.token_id)}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No bookings found for Today</Text>
            }
            contentContainerStyle={
              tokens.length === 0
                ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
                : undefined
            }
          />
        </View>
      </>

      <CustomText style={styles.text2}>Made with ❤️ by Vivek Bisen</CustomText>
    </View>
  );
};
export default Content;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardcontainer: {
    margin: 10,

  },
  empty: {
    color: '#666',
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,

    marginHorizontal: 12, 
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerIconBg: {
    backgroundColor: '#e0f7fa', 
  },
  textContainer: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Okra-Regular',
    color: '#65686bff',
  },
  providerIdText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  favIcon: {
    padding: 4,
  },
  statusBadge: {
    backgroundColor: '#e6fffa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b2f5ea',
  },
  statusText: {
    fontSize: 10,
    color: '#2c7a7b',
    fontWeight: '600',
  },
  // Token Section
  tokenContainer: {
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
    fontWeight: '500',
  },

  text2: {
    opacity: 0.5,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 12,
  },
});
