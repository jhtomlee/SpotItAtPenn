import React from 'react';
import { StyleSheet, SafeAreaView, FlatList, AsyncStorage, View, TouchableWithoutFeedback, Text, Linking, Picker, ScrollView } from 'react-native';
import { ListItem, Overlay, Icon, SearchBar } from 'react-native-elements'
import firebase from 'firebase';
import { eventsDB, usersDB } from '../../../src/db'
import moment from 'moment';

export default class Search extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Search",
      headerTintColor: '#2bb5bc',
      headerRight: (

        <Icon containerStyle={{ paddingRight: 14, }}
          name="filter"
          type="material-community"
          size={25}
          color="#2bb5bc"
          onPress={navigation.getParam('handleHeaderRight')} />

      ),
    }
  }
  constructor(props) {


    super(props);
    this.eventsData = []
    this.likedEvent = new Set();
    this.likesCounts = {};
    this.state = {
      userId: null,
      searchResult: [],
      searchInput: '',
      searchMethod: 'Title',
      methodOverlayVisible: false,
      eventOverlayVisible: false,
      pressedItem: null,
      pressedItemId: null,
    };
  }

  async componentDidMount() {
    if (!this.state.userId) {
      const userId = await AsyncStorage.getItem('userId');
      this.setState({ userId })
    }
    this.props.navigation.setParams({
      handleHeaderRight: this._showFilter,
    });
    await this.fetchEventData();


  }
  fetchEventData = async () => {
    const db = await firebase.firestore();
    db.collection(eventsDB)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const eventElement = doc;
          this.eventsData.push(eventElement)
          this.eventsData.sort((a, b) => {
            return a.data().time - b.data().time;
          });
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }
  _search = (searchInput, method) => {
    if (method == 'Title') {
      this.setState({ searchInput });
      const newData = this.eventsData.filter(item => {
        const itemData = `${item.data().title.toUpperCase()} `;
        const textData = searchInput.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({ searchResult: newData });
    } else if (method == 'Host') {
      this.setState({ searchInput });
      const newData = this.eventsData.filter(item => {
        const itemData = `${item.data().host.toUpperCase()} `;
        const textData = searchInput.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({ searchResult: newData });
    } else if (method == 'Categories') {
      this.setState({ searchInput });
      const newData = this.eventsData.filter(item => {
        const textData = searchInput.toUpperCase();
        const itemKeywords = item.data().keywords

        let included = false;
        itemKeywords.map(item => {
          const itemData = item.toUpperCase();
          if (itemData.indexOf(textData) > -1) included = true;
        })
        return included;
      });
      this.setState({ searchResult: newData });

    }
  }
  _showFilter = () => {
    this.setState({ methodOverlayVisible: true })
  }
  _toggleEventDetails = async (item, id) => {
    const { eventOverlayVisible } = this.state;
    this.setState({ eventOverlayVisible: !eventOverlayVisible });
    this.setState({ pressedItem: item });
    this.setState({ pressedItemId: id });

    //fetch event likes info
    const db = await firebase.firestore();
    db.collection(eventsDB).doc(id).get()
      .then((doc) => {

        if (doc.exists) {
          const eventElement = doc;

          //store like counts
          this.likesCounts[doc.id] = eventElement.data().likesCount

          //store liked events by user
          const nose = eventElement.data().likedBy
          if (nose && nose.length > 0) {
            nose.map((id) => {
              if (id === this.state.userId) {
                this.likedEvent.add(doc.id)

              }
            })
          }
          const { toggle } = this.state;
          this.setState({ toggle: !toggle });

          console.log("Document data:", doc.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
  };
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
        onPress={() => this._toggleEventDetails(element, item.item.id)}
      />
    );


  }
  renderSearchMethod = () => {
    return (
      <Overlay
        isVisible={this.state.methodOverlayVisible}
        onBackdropPress={() => this.setState({ methodOverlayVisible: false })}
        height={300}
      >

        <View style={{ flex: 1, }}>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                paddingTop: 30,
                color: 'black',
                fontWeight: 'bold',
                fontSize: 18,
              }}
            >
              Search Method
              </Text>
          </View>

          <Picker
            selectedValue={this.state.searchMethod}
            onValueChange={(itemValue) => this.setState({ searchMethod: itemValue })}
          >
            <Picker.Item label="Title" value="Title" />
            <Picker.Item label="Host" value="Host" />
            <Picker.Item label="Categories" value="Categories" />
          </Picker>
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
              <View style={{ paddingRight: 30 }}>
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
              <View>
                <Text>{}</Text>
              </View>
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

            <View style={{ justifyContent: 'center',alignItems: 'center',flexDirection: 'row' }}>
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
              <Text>  x {this.likesCounts[this.state.pressedItemId]}</Text>
            </View>
          </ScrollView>
        ) : (
            <View></View>
          )}
      </Overlay>
    )
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderSearchMethod()}
        {this.renderEventOverlay()}
        <SearchBar
          platform="default"
          placeholder={this.state.searchMethod}
          containerStyle={{ backgroundColor: 'transparent', }}
          lightTheme
          round
          onChangeText={searchInput => this._search(searchInput, this.state.searchMethod)}
          value={this.state.searchInput}
          onClear={() => { this.setState({ searchResult: [] }) }}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.searchResult}
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
    // justifyContent: 'center',
  },
})