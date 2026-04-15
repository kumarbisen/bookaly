import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import Purchases, { PurchasesPackage, PurchasesStoreProduct } from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { appAxios } from '@service/apiInterceptors';
import { useAuthStore } from '../../state/authStore';
import { tokenStorage } from '../../state/storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { resetAndNavigate } from '@utils/NavigationUtils';

// TODO: Replace with your actual RevenueCat API Key
const REVENUECAT_API_KEY = "goog_HAToHAUyxsdwiNLAIfSjWYVZjwN";

const Subscription = () => {
    const navigation = useNavigation<any>();
    const { user, setUser, logout } = useAuthStore();
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Initialize RevenueCat

                //    IMPORTANT: Uncomment this when you have the real key.
                if (Platform.OS === 'android') {
                    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
                }


                try {
                    // // Fetch Offerings
                    // /*
                    const offerings = await Purchases.getOfferings();
                    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                        setPackages(offerings.current.availablePackages);
                    }
                    // */

                    // Mock Data for UI Visualization
                    // setPackages([
                    //     {
                    //         identifier: 'monthly_pro',
                    //         packageType: 'MONTHLY',
                    //         product: {
                    //             identifier: 'com.bookaly.monthly',
                    //             description: 'Unlimited bookings & insights',
                    //             title: 'Monthly Pro',
                    //             price: 499,
                    //             priceString: '₹499',
                    //             currencyCode: 'INR',
                    //         offeringIdentifier: 'default'
                    //     } as any,
                    //     {
                    //         identifier: 'yearly_pro',
                    //         packageType: 'ANNUAL',
                    //         product: {
                    //             identifier: 'com.bookaly.yearly',
                    //             description: 'Best value for long term',
                    //             title: 'Yearly Pro',
                    //             price: 4999,
                    //             priceString: '₹4999',
                    //             currencyCode: 'INR',
                    //             introPrice: {
                    //                 price: 0,
                    //                 periodUnit: 'DAY',
                    //                 periodNumberOfUnits: 30,
                    //             }
                    //         },
                    //         offeringIdentifier: 'default'
                    //     } as any
                    // ]);

                } catch (e) {
                    console.error("RevenueCat Error", e);
                }

            } catch (error) {
                console.error("Error init", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const updateBackendSubscription = async (pkg: PurchasesPackage) => {
        try {
            const token = tokenStorage.getString('accessToken');
            const response = await appAxios.post('/subscription/update', {
                providerId: user?._id,
                isSubscribed: true,
                subscriptionPlan: pkg.product.identifier,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // simplify expiry logic or let backend handle it
            });

            if (response.data.success || response.status === 200) {
                // Update local user state
                setUser({ ...user, isSubscribed: true });
                return true;
            }
        } catch (error) {
            console.error("Backend update failed", error);
            Alert.alert("Sync Error", "Payment successful but failed to update account. Please contact support.");
            return false;
        }
        return false;
    };

    const handlePurchase = async (pkg: PurchasesPackage) => {
        if (purchasing) return;
        setPurchasing(true);

        try {
            // Real Purchase

            const { customerInfo } = await Purchases.purchasePackage(pkg);
            if (typeof customerInfo.entitlements.active['pro'] !== "undefined") {
                const success = await updateBackendSubscription(pkg);
                if (success) resetAndNavigate('ProviderHome');
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert("Error", error.message);
            }
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            Alert.alert("Restore", "Purchases restored.");
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setPurchasing(false);
        }
    }

    const formatTrialDuration = (product: PurchasesStoreProduct) => {
        if (!product.introPrice) return null;

        // Check if it's a free trial
        if (product.introPrice.price === 0) {
            const periodUnit = product.introPrice.periodUnit; // DAY, WEEK, MONTH, YEAR
            const periodNumberOfUnits = product.introPrice.periodNumberOfUnits;

            let unitString = '';
            switch (periodUnit) {
                case 'DAY': unitString = 'Day'; break;
                case 'WEEK': unitString = 'Week'; break;
                case 'MONTH': unitString = 'Month'; break;
                case 'YEAR': unitString = 'Year'; break;
            }
            if (periodNumberOfUnits > 1) unitString += 's';

            return `${periodNumberOfUnits} ${unitString} Free Trial`;
        }
        return null;
    };

    const handleClose = () => {
        const trialDurationMs = 30 * 24 * 60 * 60 * 1000;
        const startTime = new Date(user?.created_at || user?.createdAt || Date.now()).getTime();
        const isTrialActive = (Date.now() - startTime) < trialDurationMs;

        if (user?.isSubscribed || isTrialActive) {
            resetAndNavigate('ProviderHome');
            return;
        }

        Alert.alert(
            "Logout",
            "A subscription is required to access your account. Do you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        resetAndNavigate('ProviderLogin');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>

            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Unlock Premium</Text>
                    <Text style={styles.headerSubtitle}>
                        Remove limits and grow your business with Bookaly Pro.
                    </Text>
                </View>


                {/* Trail Status Checking UI */}
                <View style={styles.trialContainer}>
                    <Text style={styles.trialLabel}>Current Status</Text>
                    <Text style={[styles.trialValue, { color: user?.isSubscribed ? '#059669' : (Date.now() - (new Date(user?.created_at || user?.createdAt || Date.now()).getTime()) < 30 * 24 * 60 * 60 * 1000 ? '#2563EB' : '#EF4444') }]}>
                        {user?.isSubscribed
                            ? "Premium Active"
                            : (Date.now() - (new Date(user?.created_at || user?.createdAt || Date.now()).getTime()) < 30 * 24 * 60 * 60 * 1000
                                ? "Trial Active"
                                : "Trial Expired")}
                    </Text>
                </View>

                <View style={styles.packagesContainer}>
                    {packages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.identifier}
                            activeOpacity={0.9}
                            onPress={() => handlePurchase(pkg)}
                            style={[
                                styles.packageCard,
                                pkg.packageType === 'ANNUAL' && styles.popularCard
                            ]}
                        >
                            {pkg.packageType === 'ANNUAL' && (
                                <View style={styles.bestValueBadge}>
                                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                                </View>
                            )}

                            <View>
                                <Text style={styles.pkgTitle}>{pkg.product.title}</Text>
                                <Text style={styles.pkgDesc}>{pkg.product.description}</Text>
                                {pkg.product.introPrice && (
                                    <View style={styles.trialBadge}>
                                        <Text style={styles.trialBadgeText}>
                                            {formatTrialDuration(pkg.product)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
                                <Text style={styles.pkgPeriod}>
                                    /{pkg.packageType === 'ANNUAL' ? 'year' : 'mo'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={handleRestore}
                >
                    <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    Recurring billing, cancel anytime. By subscribing you agree to our Terms of Service and Privacy Policy.
                </Text>

            </ScrollView>

            {purchasing && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.overlayText}>Processing...</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        padding: 24,

        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginTop: 20,
        alignItems: 'flex-end',
        zIndex: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    featuresContainer: {
        marginBottom: 40,
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureText: {
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
        fontWeight: '500',
    },
    trialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 8
    },
    trialLabel: {
        fontSize: 14,
        color: '#9CA3AF'
    },
    trialValue: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '700'
    },
    packagesContainer: {
        gap: 16,
        marginBottom: 32,
    },
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    popularCard: {
        borderColor: '#000',
        borderWidth: 2,
        backgroundColor: '#FDFDFD'
    },
    bestValueBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
    },
    bestValueText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    pkgTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    pkgDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    pkgPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    pkgPeriod: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    restoreBtn: {
        alignItems: 'center',
        padding: 16,
        marginBottom: 20,
    },
    restoreText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
    disclaimer: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 18,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    overlayText: {
        color: '#FFF',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    trialBadge: {
        backgroundColor: '#DCFCE7',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    trialBadgeText: {
        color: '#166534',
        fontSize: 11,
        fontWeight: '600',
    }
});

export default Subscription;