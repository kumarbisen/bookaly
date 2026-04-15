import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/UI/CustomText';
import Icon from '@components/global/Icon';

export interface Country {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
    timezone?: string;
}


export const countries: Country[] = [
    { name: 'India', dial_code: '+91', code: 'IN', flag: '🇮🇳', timezone: 'Asia/Kolkata' },
    { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸', timezone: 'America/New_York' },
    { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧', timezone: 'Europe/London' },
    { name: 'Canada', dial_code: '+1', code: 'CA', flag: '🇨🇦', timezone: 'America/Toronto' },
    { name: 'Australia', dial_code: '+61', code: 'AU', flag: '🇦🇺', timezone: 'Australia/Sydney' },
    { name: 'Germany', dial_code: '+49', code: 'DE', flag: '🇩🇪', timezone: 'Europe/Berlin' },
    { name: 'France', dial_code: '+33', code: 'FR', flag: '🇫🇷', timezone: 'Europe/Paris' },
    { name: 'Japan', dial_code: '+81', code: 'JP', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
    { name: 'China', dial_code: '+86', code: 'CN', flag: '🇨🇳', timezone: 'Asia/Shanghai' },
    { name: 'Brazil', dial_code: '+55', code: 'BR', flag: '🇧🇷', timezone: 'America/Sao_Paulo' },
];

interface CountryPickerProps {
    visible: boolean;
    onSelect: (country: Country) => void;
    onClose: () => void;
    selectedCountry?: Country;
}

const CountryPicker: React.FC<CountryPickerProps> = ({
    visible,
    onSelect,
    onClose,
    selectedCountry
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial_code.includes(searchQuery)
    );

    const renderItem = ({ item }: { item: Country }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <Text style={styles.itemFlag}>{item.flag}</Text>
            <CustomText style={styles.itemName} varient="h6">{item.name}</CustomText>
            <CustomText style={styles.itemCode} varient="h6" fontFamily={Fonts.SemiBold}>{item.dial_code}</CustomText>
            {selectedCountry?.code === item.code && (
                <Icon name="checkmark" size={20} color={Colors.primary} iconFamily="Ionicons" />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <View style={styles.controlBar} />
                    <CustomText varient="h5" fontFamily={Fonts.Bold} style={styles.title}>Select Country</CustomText>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#9ca3af" iconFamily="Ionicons" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search country or code"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </Modal>
    );
};

export default CountryPicker;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,

    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        padding: 20,
        marginTop: 'auto', // Pushes to bottom
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 5 }
        })
    },
    header: {
        alignItems: 'center',
        marginBottom: 20
    },
    controlBar: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 15
    },
    title: {
        color: "#111827"
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 20
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#111827',
        height: '100%'
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    itemName: {
        flex: 1,
        color: '#374151',
    },
    itemCode: {
        color: '#6B7280',
        marginRight: 10,
    },
});