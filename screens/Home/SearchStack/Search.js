import React from 'react';
import { StyleSheet, SafeAreaView, FlatList, View, Button, Text, Picker } from 'react-native';
import { ListItem, Overlay, Icon, SearchBar } from 'react-native-elements'
import firebase from 'firebase';
import { eventsDB } from '../../../src/db'

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
    this.state = {
      searchResult: [],
      searchInput: '',
      searchMethod: 'Title',
      methodOverlayVisible: false,
    };
  }

  async componentDidMount() {
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
    } else if (method == 'Categories'){
      this.setState({ searchInput });
      const newData = this.eventsData.filter(item => {
        const textData = searchInput.toUpperCase();
        const itemKeywords = item.data().keywords

        let included = false;
        itemKeywords.map(item => {
          const itemData = item.toUpperCase();
          if (itemData.indexOf(textData) > -1) included =true;
        })
        return included;
      });
      this.setState({ searchResult: newData });

    }
  }
  _showFilter = () => {
    this.setState({ methodOverlayVisible: true })
  }

  /**
   * Render
   */
  _renderRow = (item) => {
    const element = item.item.data()
    return (
      <ListItem
        title={element.title}
        titleStyle={{ fontSize: 16, color: 'black' }}
        subtitle={element.host}
        subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
      // onPress={() => this._toggleEventDetails(element, item.item.id)}
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
            // style={styles.picker} itemStyle={styles.pickerItem}
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
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderSearchMethod()}
        <SearchBar
          platform="default"
          placeholder={this.state.searchMethod}
          containerStyle={{ backgroundColor: 'transparent', }}
          lightTheme
          round
          onChangeText={searchInput => this._search(searchInput, this.state.searchMethod)}
          value={this.state.searchInput}
          onClear={() => {this.setState({ searchResult: []})}}
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