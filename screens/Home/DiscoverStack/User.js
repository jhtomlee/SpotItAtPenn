import React from 'react';
import { StyleSheet, SafeAreaView, View, Button, Text } from 'react-native';
import firebase from 'firebase';

export default class User extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "User",
      headerTintColor: '#a41034',
    }
  }

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