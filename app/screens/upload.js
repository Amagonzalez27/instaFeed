import React from 'react';
import {
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
} from 'react-native';
import { f, database, storage } from '../../config/fbConfig';
// Permission: before allowing access we need permission to get photos from user's phone
// ImagePicker: resource to select images from user's camera
import { Permissions, ImagePicker } from 'expo';

import UserAuth from '../components/auth';
import SelectedImage from '../components/selectedImage';

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      imageId: this.uniqueId(),
      imageSelected: false,
      caption: '',
      progress: 0,
      uploading: false,
      uri: '',
      currentFileType: '',
      camera: '',
      cameraRoll: '',
    };
  }

  componentDidMount = () => {
    // var that = this;
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
  };

  _checkPermissions = async () => {
    // check if we have permssion to camera && camera roll
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const { statusRoll } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({
      camera: status,
      cameraRoll: statusRoll,
    });
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

  findNewImage = async () => {
    this._checkPermissions();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      console.log('upload image');
      this.setState({
        imageSelected: true,
        imageId: this.uniqueId(),
        uri: result.uri,
      });
    } else {
      console.log('cancel');
      this.setState({
        imageSelected: false,
      });
    }
  };

  uploadPublish = () => {
    if (this.state.uploading == false) {
      if (this.state.caption != '') {
        //
        this.uploadImage(this.state.uri);
      } else {
        alert('Please enter a caption..');
      }
    } else {
      console.log('Ignore button tap as already uploading');
    }
  };

  uploadImage = async uri => {
    // var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;

    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(uri)[1];
    this.setState({
      currentFileType: ext,
      uploading: true,
    });
    const FilePath = `${imageId}.${this.state.currentFileType}`;

    // TO CREATE THE BLOB
    const oReq = new XMLHttpRequest();
    oReq.open('GET', uri, true);
    oReq.responseType = 'blob';
    oReq.onload = () => {
      const blob = oReq.response;
      //Call function to complete upload with the new blob to handle the uploadTask.
      this.completeUploadBlob(blob, FilePath);
    };
    oReq.send();
  };

  completeUploadBlob = (blob, FilePath) => {
    const userid = f.auth().currentUser.uid;
    // firebase storage path
    // create path user/userId/img/newImage.jpn
    // .put(blob) to upload the image
    const uploadTask = storage
      .ref('user/' + userid + '/img')
      .child(FilePath)
      .put(blob);

    const next = snapshot => {
      // callback
      var progress = (
        (snapshot.bytesTransferred / snapshot.totalBytes) *
        100
      ).toFixed(0);
      // console.log('Upload is ' + progress + '% complete');
      this.setState({
        progress: progress,
      });
    };

    const error = err => {
      console.log('error with upload - ' + err);
    };

    const complete = () => {
      //complete
      this.setState({ progress: 100 });
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        console.log(downloadURL);
        this.processUpload(downloadURL);
      });
    };

    // Represents the process of uploading image
    // on(event, nextOrObserver, error, complete) returns (function() or function())
    // many legal ways of representing data
    /* passing them as callbacks */
    uploadTask.on('state_changed', next, error, complete);

    /* passing them as an object/subscribe */
    /*
    uploadTask.on(
      'state_changed', {
      next: next
      error: error
      complete: complete
      }
    );

    var subscribe = uploadTask.on(storage.TaskEvent.STATE_CHANGE)
    subscribe(next, error, complete)
     */
  };

  processUpload = imageUrl => {
    //Process here...
    //Set needed info
    var userId = f.auth().currentUser.uid;
    var imageId = this.state.imageId;
    var caption = this.state.caption;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    //Build photo object
    //author, caption, posted, url
    var photoObj = {
      author: userId,
      caption: caption,
      posted: timestamp,
      url: imageUrl,
    };

    //Update database
    //Add to main feed
    database.ref('/photos/' + imageId).set(photoObj);
    //Set user photos object
    database.ref('/users/' + userId + '/photos/' + imageId).set(photoObj);

    Alert.alert('Image Uploaded!!');

    this.setState({
      uploading: false,
      imageSelected: false,
      caption: '',
      uri: '',
    });
  };

  render() {
    // Check if logged in is false
    if (!this.state.loggedIn) {
      return <UserAuth message="Please login to upload a photo" />;
    }
    return (
      <View style={{ flex: 1 }}>
        {this.state.imageSelected ? (
          <View>
            <View
              style={{
                height: 70,
                paddingTop: 30,
                backgroundColor: 'white',
                borderColor: 'lightgrey',
                borderBottomWidth: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Upload</Text>
            </View>
            <View style={{ padding: 5 }}>
              <Text style={{ marginTop: 5 }}>Caption:</Text>
              <TextInput
                editable={true}
                placeholder="Enter your caption..."
                maxLength={150}
                multiline={true}
                numberOfLines={4}
                onChangeText={text => this.setState({ caption: text })}
                style={{
                  marginVertical: 10,
                  height: 100,
                  padding: 5,
                  borderColor: 'grey',
                  borderWidth: 1,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  color: 'black',
                }}
              />

              <TouchableOpacity
                onPress={() => this.uploadPublish()}
                style={{
                  alignSelf: 'center',
                  width: 170,
                  marginHorizontal: 'auto',
                  backgroundColor: 'purple',
                  borderRadius: 5,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ textAlign: 'center', color: 'white' }}>
                  Upload & Publish
                </Text>
              </TouchableOpacity>

              <SelectedImage
                uploading={this.state.uploading}
                progress={this.state.progress}
                uri={this.state.uri}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 28, paddingBottom: 15 }}>Upload</Text>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'blue',
                borderRadius: 5,
              }}
              onPress={() => this.findNewImage()}
            >
              <Text style={{ color: 'white' }}>Select Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
