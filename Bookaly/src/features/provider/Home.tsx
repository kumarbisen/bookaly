
import Header from '@components/provider/Header';
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Content from './Content';


const Home = () => {
    return (
        <View style={styles.container}>
            <Header />
            <Content />
        </View>

    )
}
export default Home;
const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})