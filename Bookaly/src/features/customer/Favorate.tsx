import CustomHeader from '@components/UI/CustomHeader';
import React from 'react';
import BottomTab from '@components/global/BottomTab';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { useFavoriteStore } from '@state/favoriteStore';
import CustomText from '@components/UI/CustomText';
import { Colors } from '@utils/Constants';
import Icon from '@components/global/Icon';
import { collectData } from '@state/scanStore';
import { navigate } from '@utils/NavigationUtils';

const Favorate = () => {
    const { favorites, removeFavorite } = useFavoriteStore();
    const { scanedData } = collectData();

    const handlePress = (item: any) => {
        scanedData(item._id);
        navigate('BookToken');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <TouchableOpacity style={styles.providerInfo} onPress={() => handlePress(item)}>
                    <View style={[styles.iconContainer, styles.providerIconBg]}>
                        <Icon
                            name="storefront-outline"
                            size={24}
                            iconFamily="MaterialCommunityIcons"
                            color={Colors.primary}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <CustomText style={styles.providerName}>{item.name}</CustomText>
                        <Text style={styles.providerId}>ID: {item._id}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeFavorite(item._id)} style={styles.removeBtn}>
                    <Icon name="heart" size={24} color="#ef4444" iconFamily="MaterialCommunityIcons" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Favorites" />

            <View style={styles.content}>
                {favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="heart-off-outline" size={64} color="#ccc" iconFamily="MaterialCommunityIcons" />
                        <Text style={styles.emptyText}>No favorites yet</Text>
                        <Text style={styles.emptySubText}>Mark providers as favorite to see them here.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            <BottomTab activeTab="Favorate" />
        </View>
    );
};

export default Favorate;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginBottom: 80, // Space for bottom tab
    },
    listContent: {
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        margin: 5,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    providerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    providerIconBg: {
        backgroundColor: '#e0f7fa',
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    providerId: {
        fontSize: 12,
        color: '#9ca3af',
    },
    removeBtn: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    }
});