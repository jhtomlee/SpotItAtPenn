import React from 'react'
import { StyleSheet, Text, FlatList, TouchableOpacity, AsyncStorage } from 'react-native'
import { ListItem } from 'react-native-elements'
import { SafeAreaView } from 'react-navigation';
import { keywordsDB, usersDB } from '../../src/db'
import * as firebase from 'firebase';


export default class Interets extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "My Interests",
      headerTintColor: '#2bb5bc',
      headerStyle: {
        backgroundColor: '#e8e8e8',
        height: 100,
        borderBottomWidth: 0,
      },
    }
  }

  constructor(props) {
    super(props);
    this.selected = new Set();
    this.state = {
      interestsData: []
    };
  }

  // methods
  async componentDidMount() {
    const db = await firebase.firestore();
    const doc = await db.collection(keywordsDB).doc('keywords').get();
    const {
      keywords
    } = doc.data();
    keywords.sort();
    this.setState({interestsData:keywords})
  }
  _renderRow = item => {
    const interest = item.item;
    return (
      <ListItem
        containerStyle={{ backgroundColor: '#e8e8e8' }}
        title={interest}
        onPress={() => {
          {
            this.selected.has(interest)
              ? this.selected.delete(interest)
              : this.selected.add(interest);
          }
          const { toggle } = this.state;
          this.setState({ toggle: !toggle });
        }}
        containerStyle={
          this.selected.has(interest)
            ? { backgroundColor: 'dimgrey', borderRadius: 5 }
            : { backgroundColor: '#e8e8e8' }
        }
        titleStyle={
          this.selected.has(interest)
            ? { fontSize: 14, color: 'white' }
            : { fontSize: 14, color: 'dimgrey' }
        }
      />
    );
  };
  _continue = async () => {

    const arr = Array.from(this.selected);
    const db = firebase.firestore();
    const userId = await AsyncStorage.getItem('userId');
    db.collection(usersDB)
      .doc(userId)
      .update({
        subscribedInterests: arr,
      })
      .catch(function (error) {
        throw new Error('Error updating document: ', error);
      });

    this.props.navigation.navigate('Loading');
  }


  /**
   * Render()
   */
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.interestsData}
          renderItem={this._renderRow}
          extraData={this.state}
        />
        <TouchableOpacity
          style={styles.bottonContainer}
          onPress={this._continue}
        >
          <Text style={styles.bottonText}>START SPOTIT</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  bottonContainer: {
    backgroundColor: '#2bb5bc',
    paddingVertical: 15,
    marginTop: 20,
  },
  bottonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }
})