import { Colors, Fonts } from '@utils/Constants';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from './CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomHeader: FC<{ title: string; search?: boolean }> = ({
  title,
  search,
}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView edges={['top']} />
      <View style={styles.flexRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Customerdashboard' as never);
            }
          }}
        >
          <Icon name="chevron-back" color={Colors.text} size={RFValue(22)} />
        </Pressable>

        <View style={styles.titleContainer}>
          <CustomText
            style={styles.text}
            varient="h5"
            fontFamily={Fonts.Bold}
          >
            {title}
          </CustomText>
        </View>

        <View style={styles.rightPlaceholder}>
          {search && (
            <Icon name='search' color={Colors.text} size={RFValue(20)} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  flexRow: {
    height: 56, // Standard header height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 18,
    color: '#1a1a1a',
  },
  rightPlaceholder: {
    width: 40,
    alignItems: 'flex-end',
  }
});
export default CustomHeader;
