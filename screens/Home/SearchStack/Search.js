import React from 'react';
import { StyleSheet, SafeAreaView, View, Button, Text } from 'react-native';
import firebase from 'firebase';

export default class Search extends React.Component {

   
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Text> Search </Text>
                
            </SafeAreaView>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
})