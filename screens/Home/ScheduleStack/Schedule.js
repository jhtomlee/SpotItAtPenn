import React from 'react';
import { StyleSheet, SafeAreaView, View, AsyncStorage, Text, FlatList } from 'react-native'
import { ListItem, Overlay, Icon } from 'react-native-elements'
import { eventsDB, usersDB, keywordsDB } from '../../../src/db'
import firebase from 'firebase';
import moment from 'moment';

export default class Schedule extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "My Schedule",
      headerTintColor: '#a41034',
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      userId: null,
      eventsData: []
    };
  }
  async componentDidMount(){
    const userId = await AsyncStorage.getItem('userId');
    if (!this.state.userId) {
      this.setState({ userId })
    }

    await this.fetchMyEvents();
    

  }
  fetchMyEvents = async () => {
    const db = await firebase.firestore();
    const doc = await db.collection(usersDB).doc(this.state.userId).get();
    const eventIds = doc.data().likedEvents;
    
    eventIds.map(async eventId => {
      console.warn(eventId)
      const eventElement = await db.collection(eventsDB).doc(eventId).get();
      const eventsData = this.state.eventsData;
      eventsData.push(eventElement)
      eventsData.sort((a, b) => {
        return a.data().time - b.data().time;
      });
      this.setState({ eventsData })
      console.warn(eventsData)
    })
  }

  /**
   * Render
   */
  _renderRow = (item) => {
    const element = item.item.data()
    const dateString = moment.unix(element.time).format("YYYY-MM-DD HH:mm");

    return (
      <ListItem
        title={element.title}
        titleStyle={{ fontSize: 16, color: 'black' }}
        subtitle={`${element.host}\n${dateString}`}
        subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
        // onPress={() => this._toggleEventDetails(element, item.item.id)}

      />
    );

  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.eventsData}
          renderItem={this._renderRow}
          extraData={this.state}
        />

      </SafeAreaView>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'center',
  },
})