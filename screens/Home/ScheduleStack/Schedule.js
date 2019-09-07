import React from 'react';
import { StyleSheet, SafeAreaView, View, Button, Text } from 'react-native';
import firebase from 'firebase';

export default class Schedule extends React.Component {

    _signout = () => {
        try {
            firebase.auth().signOut();
            this.props.navigation.navigate('Loading');
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Text> Schedule </Text>
                <Button title="logout" onPress={this._signout}> </Button>
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