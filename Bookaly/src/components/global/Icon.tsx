import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { FC } from 'react'
import {RFValue} from 'react-native-responsive-fontsize'



interface IconProps{
    color?:string;
    size: number;
    name: string ;
    iconFamily: 'Ionicons' | 'MaterialCommunityIcons' |'MaterialIcons'
}



const Icon:FC<IconProps> =({color, size, name, iconFamily})=>{
    return(
        <>
        {iconFamily === 'Ionicons'&& (
            <Ionicons color={color} size={RFValue(size)} name={name}  />
        )}
        {iconFamily === 'MaterialCommunityIcons'&& (
            <MaterialCommunityIcons color={color} size={RFValue(size)} name={name}  />
        )}
        {iconFamily === 'MaterialIcons'&& (
            <MaterialIcons color={color} size={RFValue(size)} name={name}  />
        )}
        

        </>
    )
}
export default Icon;