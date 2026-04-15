import CustomHeader from '@components/UI/CustomHeader';
import BottomTab from '@components/global/BottomTab';
import CustomText from '@components/UI/CustomText';
import { useAuthStore } from '@state/authStore';
import { storage, tokenStorage } from '@state/storage';
import { resetAndNavigate } from '@utils/NavigationUtils';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, Linking, TextInput } from 'react-native';
import { updateUser } from '@service/authService';
import { Alert } from 'react-native';
import Icon from '@components/global/Icon';
import { Colors } from '@utils/Constants';
import { handleOpenLink } from '@utils/OpenLink';

const ProfileScreen = () => {
  const { logout, user } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(user?.name || '');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      await updateUser({ name });
      setIsEditing(false);
    } catch (error) {
      console.log("Error updating name");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: 'information-circle-outline', label: 'About Us', iconFamily: 'Ionicons', url: 'https://www.bookaly.app' },
    { icon: 'headset-outline', label: 'Support', iconFamily: 'Ionicons', url: 'https://vivekbisen.me' },
    { icon: 'mail-outline', label: 'Email Us', iconFamily: 'Ionicons', url: 'mailto:thebisenx@gmail.com' },
  ];






  const handleLogout = () => {
    logout();
    tokenStorage.clearAll();
    storage.clearAll();
    resetAndNavigate('CustomerLogin');
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person-circle-outline" size={80} color={Colors.primary} iconFamily="Ionicons" />
          </View>

          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                onBlur={handleUpdateUser}
              />
            ) : (
              <CustomText style={styles.userName}>
                {user?.name || "User"}
              </CustomText>
            )}

            <TouchableOpacity
              onPress={() => isEditing ? handleUpdateUser() : setIsEditing(true)}
              style={styles.editIcon}
            >
              <Icon
                name={isEditing ? "checkmark-circle" : "create-outline"}
                size={20}
                color={Colors.primary}
                iconFamily="Ionicons"
              />
            </TouchableOpacity>
          </View>

          <CustomText style={styles.userPhone}>
            {user?.phone}
          </CustomText>
        </View>

        {/* Menu Section */}
        <View style={styles.sectionContainer}>
          <CustomText style={styles.sectionTitle}>General</CustomText>
          <View style={styles.menuCard}>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.lastMenuItem]}
                onPress={() => handleOpenLink(item.url)}
              >
                <View style={styles.menuIconBox}>
                  <Icon name={item.icon} size={20} color="#1f2937" iconFamily="Ionicons" />
                </View>
                <CustomText style={styles.menuLabel}>{item.label}</CustomText>
                <Icon name="chevron-forward" size={16} color="#e5e7eb" iconFamily="Ionicons" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#ef4444" iconFamily="Ionicons" />
          <CustomText style={styles.logoutText}>Log Out</CustomText>
        </TouchableOpacity>

      </ScrollView>

      <BottomTab activeTab='Profile' />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    // Transparent, no card bg
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    // No borders, or very subtle
  },
  lastMenuItem: {

  },
  menuIconBox: {
    width: 36,
    height: 36,
    // borderRadius: 10,
    borderRadius: 18, // round
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align left like list items
    paddingVertical: 14,
    marginTop: 10,
    gap: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 0,
    minWidth: 100,
    textAlign: 'center',
  },
  editIcon: {
    padding: 4,
  },
});
