import React from 'react';
import { StyleSheet, SafeAreaView, View, Button, Text } from 'react-native';
import firebase from 'firebase';

export default class Create extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Create an event",
      headerTintColor: '#a41034',
    }
  }

    
    render() {
        return (
            <SafeAreaView style={styles.container}>
                
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