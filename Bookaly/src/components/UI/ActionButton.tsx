import { Colors, Fonts } from '@utils/Constants';
import React, { FC } from 'react'
import {Text,TouchableOpacity,View} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import { StyleSheet } from 'react-native';
import  Icon  from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '@components/ui/CustomText';

interface ActionButttonProps {
    icon:string;
    label: string;
    onPress?:()=> void
}


const ActionButtton:FC<ActionButttonProps> =({icon,label,onPress})=>{
    return(
        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Icon  name={icon} color={Colors.text} size={RFValue(14)}/> 
            </View>
            <CustomText  varient='h7' fontFamily={Fonts.Medium}>
                {label}
            </CustomText>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    btn:{
        flexDirection:'row',
        alignItems:'center',
        gap:10,
        marginVertical:10
    },
    iconContainer:{
        justifyContent:'center',
        alignItems:'center',
        padding:8,
        borderRadius:100,
        backgroundColor:Colors.backgroundSecondary
    }
})
export default ActionButtton;