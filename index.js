import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  NetInfo,
  StatusBar,
  Animated,
  Easing,
  AppState,
  SafeAreaView,
  Modal,
  Text,
  TouchableOpacity,
  Image
} from "react-native";
import styles from "./index.styles";

export default class OfflineBar extends Component {
  static propTypes = {
    offlineText: PropTypes.string
  };

  animationConstants = {
    DURATION: 800,
    TO_VALUE: 4,
    INPUT_RANGE: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
    OUTPUT_RANGE: [0, -15, 0, 15, 0, -15, 0, 15, 0]
  };

  setNetworkStatus = status => {
    this.setState({ isConnected: status });
    if (status) {
      this.triggerAnimation();
    }
  };

  state = {
    isConnected: true
  };
  _handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      NetInfo.isConnected.fetch().then(this.setNetworkStatus);
    }
  };
  componentWillMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.addEventListener("change", this._handleAppStateChange);
    this.animation = new Animated.Value(0);
  }
  componentWillUnMount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.removeEventListener("change", this._handleAppStateChange);
  }
  // Took Reference from https://egghead.io/lessons/react-create-a-button-shake-animation-in-react-native#/tab-code
  triggerAnimation = () => {
    this.animation.setValue(0);
    Animated.timing(this.animation, {
      duration: this.animationConstants.DURATION,
      toValue: this.animationConstants.TO_VALUE,
      useNativeDriver: true,
      ease: Easing.bounce
    }).start();
  };

  render() {
    const interpolated = this.animation.interpolate({
      inputRange: this.animationConstants.INPUT_RANGE,
      outputRange: this.animationConstants.OUTPUT_RANGE
    });
    const animationStyle = {
      transform: [{ translateX: interpolated }]
    };
    const { offlineText = "Uh Oh! You don't have internet" } = this.props;
    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={!this.state.isConnected}
        onRequestClose={() => console.log("closed")}>
        <SafeAreaView style={[styles.container]}>
          <StatusBar backgroundColor="#424242" />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: '15%' }}>
          <Image source={require('./images/no_internet_icon.png')} style={{height: 100, width: 100, borderRadius: 50}}/>
            <Animated.Text style={[styles.offlineText, animationStyle]}>
              {offlineText}
            </Animated.Text>
            <Text style={{color: 'white', fontWeight: '300', fontSize: 13}}>Check your connection and try again</Text>
            <TouchableOpacity onPress={() => this.triggerAnimation()}
              style={{
              width: 250,
              height: 50,
              borderRadius: 15,
              backgroundColor: '#636e72',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 40,
              shadowColor: '#000000',
              shadowOffset: {
                  width: 0,
                  height: 2
              },
              shadowRadius: 3,
              shadowOpacity: 0.3,
              elevation: 6,
            }}>
              <Text style={{color: 'white', fontSize: 20, fontWeight: '600'}}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}
