import React from 'react';
import { TouchableOpacity, FlatList, Text, View, Image } from 'react-native';
import { database } from '../../config/fbConfig';

export default class PhotoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoFeed: [],
      refresh: false,
      loading: true,
      empty: false,
    };
  }

  componentDidMount = () => {
    const { isUser, userId } = this.props;
    if (isUser) {
      // Profile
      this.loadFeed(userId);
    } else {
      this.loadFeed('');
    }
  };

  pluralCheck = s => {
    if (s === 1) {
      return ' ago';
    } else {
      return 's ago';
    }
  };

  timeConverter = timestamp => {
    var a = new Date(timestamp * 1000);
    var seconds = Math.floor((new Date() - a) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return `${interval} year${this.pluralCheck(interval)}`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return `${interval} month${this.pluralCheck(interval)}`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return `${interval} day${this.pluralCheck(interval)}`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return `${interval} hour${this.pluralCheck(interval)}`;
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return `${interval} minute${this.pluralCheck(interval)}`;
    }
    return `${Math.floor(seconds)} second${this.pluralCheck(seconds)}`;
  };

  addToFlatList = (photoFeed, data, photo) => {
    let photoObj = data[photo];
    database
      .ref('users')
      .child(photoObj.author)
      .child('username')
      .once('value')
      .then(snapshot => {
        const exists = snapshot.val() !== null;
        if (exists) data = snapshot.val();

        const newPost = {
          id: photo,
          url: photoObj.url,
          caption: photoObj.caption,
          posted: this.timeConverter(photoObj.posted),
          timestamp: photoObj.posted,
          author: data,
          authorId: photoObj.author,
        };

        var myData = []
          .concat(this.state.photoFeed, newPost)
          .sort((a, b) => a.timestamp < b.timestamp);

        this.setState(() => {
          return {
            photoFeed: myData,
            refresh: false,
            loading: false,
          };
        });
      })
      .catch(error => console.log(error));
  };

  loadFeed = (userId = '') => {
    this.setState({
      refresh: true,
      photoFeed: [],
    });

    // var that = this;

    var loadRef = database.ref('photos');
    if (userId !== '') {
      loadRef = database
        .ref('users')
        .child(userId)
        .child('photos');
    }
    loadRef
      .orderByChild('posted')
      .once('value')
      .then(snapshot => {
        const exists = snapshot.val() !== null;
        if (exists) {
          let data = snapshot.val();

          // let photoFeed = that.state.photoFeed;
          this.setState({ empty: false });
          for (let photo in data) {
            this.addToFlatList(this.state.photoFeed, data, photo);
          }
        } else {
          this.setState({ empty: true });
        }
      })
      .catch(error => console.log(error));
  };

  loadNew = () => {
    // when refresh load feed from firebase database
    this.loadFeed();
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.loading === true ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            {this.state.empty ? (
              <Text>No photos found</Text>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        ) : (
          <FlatList
            refreshing={this.state.refresh}
            onRefresh={this.loadNew}
            data={this.state.photoFeed}
            keyExtractor={(item, index) => index.toString()}
            style={{ flex: 1, backgroundColor: '#eee' }}
            renderItem={({ item, index }) => {
              return (
                <View
                  key={index}
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    marginBottom: 5,
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderColor: 'grey',
                  }}
                >
                  <View
                    style={{
                      padding: 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text>{item.posted}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('User', {
                          userId: item.authorId,
                        })
                      }
                    >
                      <Text>{item.author}</Text>
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Image
                      source={{
                        uri: item.url,
                      }}
                      style={{
                        resizeMode: 'cover',
                        width: '100%',
                        height: 275,
                      }}
                    />
                  </View>
                  <View style={{ padding: 5 }}>
                    <Text>{item.caption}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('Comments', {
                          photoId: item.id,
                        })
                      }
                    >
                      <Text
                        style={{
                          color: 'blue',
                          marginTop: 10,
                          textAlign: 'center',
                        }}
                      >
                        [ View Comments ]
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    );
  }
}
