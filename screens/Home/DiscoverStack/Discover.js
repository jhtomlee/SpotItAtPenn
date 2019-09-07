import React from 'react';
import { StyleSheet, SafeAreaView, AsyncStorage, TouchableOpacity, FlatList, Linking, View, TouchableWithoutFeedback, ScrollView, Text } from 'react-native';
import { ListItem, Overlay, Icon } from 'react-native-elements'
import firebase from 'firebase';
import { eventsDB, usersDB, keywordsDB } from '../../../src/db'
import moment from 'moment';


export default class Discover extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Discover",
      headerTintColor: '#a41034',
      headerRight: (
        <Icon containerStyle={{ paddingRight: 14, }}
          name="ios-contact"
          type="ionicon"
          size={25}
          color="blue"
          onPress={navigation.getParam('handleHeaderRight')} />

      ),
      headerLeft: (
        <Icon containerStyle={{ paddingLeft: 14, }}
          name="ios-compass"
          type="ionicon"
          size={25}
          color="blue"
          onPress={navigation.getParam('handleHeaderLeft')} />

      ),
    }
  }
  constructor(props) {
    super(props);
    this.selected = new Set();
    this.likedEvent = new Set();
    this.likesCounts = {};
    this.state = {
      userId: null,
      subscribedInterests: [],
      eventsData: [],
      likedBy: [],

      eventOverlayVisible: false,
      pressedItem: null,
      pressedItemId: null,
      toggle: false,

      interestOverlayVisible: false,
      interestsData: []
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      handleHeaderRight: this._navigateUser,
      handleHeaderLeft: this._navigateInterests,
    });
    if (!this.state.userId) {
      const userId = await AsyncStorage.getItem('userId');
      this.setState({ userId })
    }

    if (this.state.subscribedInterests.length === 0) {
      const subscribedInterestsArray = await AsyncStorage.getItem('subscribedInterestsArray');
      const subscribedInterests = JSON.parse(subscribedInterestsArray)
      this.setState({ subscribedInterests })
    }
    this.fetchEvents();
    this.fetchInterests();
  }
  _navigateUser = () => {
    // console.warn("hola")
    this.props.navigation.navigate('User');
  }
  _navigateInterests = () => {
    this.setState({ interestOverlayVisible: true })

  }

  fetchEvents = async () => {
    const db = await firebase.firestore();
    const eventsRef = await db.collection(eventsDB);

    this.state.subscribedInterests.map(async (interest) => {
      const query = await eventsRef.where("keywords", "array-contains", interest)
      query
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const eventElement = doc;
            const eventsData = this.state.eventsData;
            eventsData.push(eventElement)
            eventsData.sort((a, b) => {
              return a.data().time - b.data().time;
            });
            this.setState({ eventsData })

            //store like counts
            this.likesCounts[doc.id] = eventElement.data().likesCount

            //store liked events by user
            const nose = eventElement.data().likedBy
            if (nose && nose.length > 0) {
              nose.map((id) => {
                if (id === this.state.userId) {
                  this.likedEvent.add(doc.id)
                  const { toggle } = this.state;
                  this.setState({ toggle: !toggle });
                }
              })
            }
          });
        })
        .catch(function (error) {
          console.warn("Error getting documents: ", error);
        });
    })
  }
  fetchInterests = async () => {
    const db = await firebase.firestore();
    const doc = await db.collection(keywordsDB).doc('keywords').get();
    const {
      keywords
    } = doc.data();
    keywords.sort();
    this.setState({ interestsData: keywords })

    const doc2 = await db.collection(usersDB).doc(this.state.userId).get();
    const {
      subscribedInterests
    } = doc2.data();
    this.setState({ subscribedInterests })

    subscribedInterests.map((item) => {
      this.selected.add(item)
      const { toggle } = this.state;
      this.setState({ toggle: !toggle });
    })

  }

  _likedAction = async (userId, eventId) => {
    const db = await firebase.firestore();
    if (!this.likedEvent.has(eventId)) {
      //event database
      const increment = firebase.firestore.FieldValue.increment(1);
      db.collection(eventsDB).doc(eventId).update({
        likedBy: firebase.firestore.FieldValue.arrayUnion(userId),
        likesCount: increment
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
      this.likedEvent.add(eventId)
      const count = this.likesCounts[eventId]
      this.likesCounts[eventId] = count + 1;

      //userDB
      db.collection(usersDB).doc(this.state.userId).update({
        likedEvents: firebase.firestore.FieldValue.arrayUnion(eventId),
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
    } else {
      //event database
      const decrement = firebase.firestore.FieldValue.increment(-1);
      db.collection(eventsDB).doc(eventId).update({
        likedBy: firebase.firestore.FieldValue.arrayRemove(userId),
        likesCount: decrement
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
      this.likedEvent.delete(eventId)
      const count = this.likesCounts[eventId]
      this.likesCounts[eventId] = count - 1;

      //userDB
      db.collection(usersDB).doc(this.state.userId).update({
        likedEvents: firebase.firestore.FieldValue.arrayRemove(eventId),
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
    }
    const { toggle } = this.state;
    this.setState({ toggle: !toggle });

  }
  _toggleEventDetails = (item, id) => {
    const { eventOverlayVisible } = this.state;
    this.setState({ eventOverlayVisible: !eventOverlayVisible });
    this.setState({ pressedItem: item });
    this.setState({ pressedItemId: id });
  };
  _continue = async () => {
    this.setState({ eventsData: [] })

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

    

    const eventsRef = await db.collection(eventsDB);
    //refetch
    arr.map(async (interest) => {

      const query = await eventsRef.where("keywords", "array-contains", interest)
      query
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const eventElement = doc;
            const eventsData = this.state.eventsData;
            eventsData.push(eventElement)
            eventsData.sort((a, b) => {
              return a.data().time - b.data().time;
            });
            this.setState({ eventsData })

            //store like counts
            this.likesCounts[doc.id] = eventElement.data().likesCount

            //store liked events by user
            const nose = eventElement.data().likedBy
            if (nose && nose.length > 0) {
              nose.map((id) => {
                if (id === this.state.userId) {
                  this.likedEvent.add(doc.id)
                  const { toggle } = this.state;
                  this.setState({ toggle: !toggle });
                }
              })
            }
          });
        })
        .catch(function (error) {
          console.warn("Error getting documents: ", error);
        });
    })

    this.setState({ interestOverlayVisible: false })
  }




  /**
   * Render
   */
  renderInterestOverlay = () => {
    return (
      <Overlay
        isVisible={this.state.interestOverlayVisible}
        onBackdropPress={() => this.setState({ interestOverlayVisible: false })}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              paddingTop: 30,
              color: 'black',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >My Interests</Text>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={this.state.interestsData}
            renderItem={this._renderInterestRow}
            extraData={this.state}
          />
          <TouchableOpacity
            style={styles.bottonContainer}
            onPress={this._continue}
          >
            <Text style={styles.bottonText}>START SPOTIT</Text>
          </TouchableOpacity>
        </View>


      </Overlay>
    )

  }
  renderEventOverlay = () => {
    return (
      <Overlay
        isVisible={this.state.eventOverlayVisible}
        onBackdropPress={() => this.setState({ eventOverlayVisible: false })}
        fullScreen
      >

        {this.state.pressedItem ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator="false"
          >

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({ eventOverlayVisible: false })

                }}
              >
                <Icon
                  containerStyle={{ paddingTop: 30, }}
                  name="chevron-left"
                  size={32}
                  color="#2bb5bc"
                />
              </TouchableWithoutFeedback>
              <View style={{ paddingRight: 20 }}>
                <Text
                  style={{
                    paddingTop: 30,
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: 18,
                  }}
                >
                  {this.state.pressedItem.title}
                </Text>
              </View>
              <Text>    </Text>
            </View>

            {this.state.pressedItem.host ?
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: 'dimgrey',
                    fontSize: 16,
                    paddingTop: 0,
                    paddingBottom: 20,
                    paddingLeft: 15,
                    paddingRight: 15,
                    textAlign: 'justify',
                  }}
                >{`${this.state.pressedItem.host}`}</Text>
              </View>
              : <View></View>}

            {this.state.pressedItem.time ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`When? \n${moment.unix(this.state.pressedItem.time).format("YYYY-MM-DD HH:mm")}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.location ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`Where? \n${this.state.pressedItem.location}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.summary ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`What?: \n${this.state.pressedItem.summary}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.cost ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`cost: ${this.state.pressedItem.cost}`}
              </Text> : <View></View>}

            {this.state.pressedItem.registrationSite ?
              <TouchableWithoutFeedback
                onPress={() => {
                  Linking.openURL(this.state.pressedItem.registrationSite);
                }}
              >
                <View>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      fontSize: 14,
                      color: 'grey',
                    }}
                  >Website:
                </Text>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      paddingBottom: 20,
                      fontSize: 14,
                      color: 'blue',
                    }}
                  >
                    {`${this.state.pressedItem.registrationSite}`}
                  </Text>
                </View>
              </TouchableWithoutFeedback> : <View></View>}

            {this.state.pressedItem.websiteSource ?
              <TouchableWithoutFeedback
                onPress={() => {
                  Linking.openURL(this.state.pressedItem.websiteSource);
                }}
              >
                <View>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      fontSize: 14,
                      color: 'grey',
                    }}
                  >Website:
                </Text>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      paddingBottom: 20,
                      fontSize: 14,
                      color: 'blue',
                    }}
                  >
                    {`${this.state.pressedItem.websiteSource}`}
                  </Text>
                </View>
              </TouchableWithoutFeedback> : <View></View>}
            <Icon
              name={
                this.likedEvent.has(this.state.pressedItemId) ? 'heart' : 'heart-outline'
              }
              type="material-community"
              size={25}
              iconStyle={
                this.likedEvent.has(this.state.pressedItemId)
                  ? { color: 'red', }
                  : { color: '#a9a9a9' }
              }
              onPress={() => this._likedAction(this.state.userId, this.state.pressedItemId)}
            />
          </ScrollView>
        ) : (
            <View></View>
          )}
      </Overlay>
    )
  }
  _renderRow = item => {
    const element = item.item.data()
    const eventId = item.item.id
    const dateString = moment.unix(element.time).format("YYYY-MM-DD HH:mm");

    return (
      <ListItem
        title={element.title}
        titleStyle={{ fontSize: 16, color: 'black' }}
        subtitle={`${element.host}\n${dateString}`}
        subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
        onPress={() => this._toggleEventDetails(element, item.item.id)}
        rightIcon={
          <View style={{ flexDirection: 'row' }}>
            <Icon
              name={
                this.likedEvent.has(eventId) ? 'heart' : 'heart-outline'
              }
              type="material-community"
              size={25}
              iconStyle={
                this.likedEvent.has(eventId)
                  ? { color: 'red', }
                  : { color: '#a9a9a9' }
              }
              onPress={() => this._likedAction(this.state.userId, item.item.id)}

            />
            <Text>  x {this.likesCounts[eventId]}</Text>
          </View>
        }

      />
    );
  };
  _renderInterestRow = item => {
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

  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderInterestOverlay()}
        {this.renderEventOverlay()}
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