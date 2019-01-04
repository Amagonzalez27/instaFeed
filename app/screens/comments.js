import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Text,
  View,
} from 'react-native';
import { f, auth, database, storage } from '../../config/fbConfig';

import UserAuth from '../components/auth';

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      commentsList: [],
      comment: '',
      photoId: '',
    };
  }

  componentDidMount = () => {
    f.auth().onAuthStateChanged(user => {
      if (user) {
        // Logged in
        this.setState({
          loggedIn: true,
        });
      } else {
        // Not Logged in
        this.setState({
          loggedIn: false,
        });
      }
    });

    this.checkParams();
  };

  checkParams = () => {
    //
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.photoId) {
        this.setState({
          photoId: params.photoId,
        });
        this.fetchComments(params.photoId);
      }
    }
  };

  addCommentToList = (commentsList, data, comment) => {
    var that = this;
    const commentObj = data[comment];
    database
      .ref('users')
      .child(commentObj.author)
      .child('username')
      .once('value')
      .then(snapshot => {
        const exists = snapshot.val() !== null;
        if (exists) {
          let data = snapshot.val();

          let newPost = {
            id: comment,
            comment: commentObj.comment,
            posted: this.timeConverter(commentObj.posted),
            author: data,
            authorId: commentObj.author,
          };

          this.setState({
            refresh: false,
            loading: false,
            commentsList: [...this.state.commentsList, newPost],
          });
        }
      })
      .catch(error => console.log(error));
  };

  fetchComments = photoId => {
    database
      .ref('comments')
      .child(photoId)
      .orderByChild('posted')
      .once('value')
      .then(snapshot => {
        const exists = snapshot.val() !== null;
        console.log('DOES IT EXIST', exists);
        if (exists) {
          let data = snapshot.val();
          for (let comment in data) {
            this.addCommentToList(this.state.commentsList, data, comment);
          }
        } else {
          this.setState({
            commentsList: [],
          });
        }
      })
      .catch(error => console.log(error));
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

  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  uniqueId = () => {
    return (
      this.s4() +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4()
    );
  };

  postComment = () => {
    var comment = this.state.comment;
    if (comment !== '') {
      // process
      var imageId = this.state.photoId;
      var userId = f.auth().currentUser.uid;
      var commentId = this.uniqueId();
      var dateTime = Date.now();
      var timestamp = Math.floor(dateTime / 1000);

      this.setState({
        comment: '',
      });

      var commentObj = {
        posted: timestamp,
        author: userId,
        comment: comment,
      };

      database.ref('/comments/' + imageId + '/' + commentId).set(commentObj);
      // reload thecomments
      this.reloadCommentList();
    } else {
      alert('Please enter a comment before posting.');
    }
  };

  reloadCommentList = () => {
    this.setState({
      commentsList: [],
    });
    this.fetchComments(this.state.photoId);
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            height: 70,
            paddingTop: 30,
            backgroundColor: 'white',
            borderColor: 'lightgrey',
            borderBottomWidth: 0.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ width: 100 }}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', paddingLeft: 10 }}>
              Go Back
            </Text>
          </TouchableOpacity>
          <Text>Comments</Text>
          <Text style={{ width: 100 }} />
        </View>

        {this.state.commentsList.length === 0 ? (
          <Text>No Comments Found</Text>
        ) : (
          <FlatList
            data={this.state.commentsList}
            refreshing={this.state.refresh}
            keyExtractor={(item, index) => index.toString()}
            style={{ flex: 1, backgroundColor: '#eee' }}
            renderItem={({ item, index }) => {
              console.log('CHECKING THE ITEMS:', item, item.comment);
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
                      width: '100%',
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
                  <View
                    style={{
                      padding: 5,
                    }}
                  >
                    <Text>{item.comment}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {this.state.loggedIn === true ? (
          // are logged in
          <KeyboardAvoidingView
            behavior="padding"
            enabled
            style={{
              borderTopWidth: 1,
              borderTopColor: 'grey',
              padding: 10,
              marginBottom: 15,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>Post Comment</Text>
            <View>
              <TextInput
                editable={true}
                placeholder="Enter your comment here"
                value={this.state.comment}
                onChangeText={text => this.setState({ comment: text })}
                style={{
                  marginVertical: 10,
                  height: 50,
                  padding: 5,
                  borderColor: 'grey',
                  borderRadius: 3,
                  backgroundColor: 'white',
                  color: 'black',
                }}
              />
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: 'blue',
                  borderRadius: 5,
                }}
                onPress={() => this.postComment()}
                onSubmitEditing={() => {
                  this.setState({ comment: '' });
                }}
              >
                <Text style={{ color: 'white' }}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          // not logged in
          <UserAuth
            message="Please login to post a comment"
            moveScreen={true}
            navigation={this.props.navigation}
          />
        )}
      </View>
    );
  }
}

export default Comment;
