import React, { Component, useState } from 'react';
import { Alert, KeyboardAvoidingView, LayoutAnimation, PermissionsAndroid, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  ErrorCodeType,
  IRtcEngine,
  IRtcEngineEventHandler,
  LocalVideoStreamError,
  LocalVideoStreamState,
  RtcConnection,
  RtcStats,
  RtcSurfaceView,
  RtcTextureView,
  UserOfflineReasonType,
  VideoDimensions,
  VideoEncoderConfiguration,
  VideoSourceType,
  VideoViewSetupMode,
} from 'react-native-agora';

import Config from '../../config/agora.config';

import {
  BaseComponent,
  BaseVideoComponentState,
} from '../../components/BaseComponent';
import {
  AgoraButton,
  AgoraDivider,
  AgoraDropdown,
  AgoraStyle,
  AgoraSwitch,
  AgoraText,
  AgoraTextInput,
  AgoraView,
} from '../../components/ui';
import { enumToItems } from '../../utils';
import { StackScreenProps } from '@react-navigation/stack';
import { LogSink } from '../../components/LogSink';
import { RtcSurfaceButton, RtcTextuerButton } from './components';

interface State {
  switchCamera: boolean;
  renderByTextureView: boolean;
  setupMode: VideoViewSetupMode;
  appId: string;
  enableVideo: boolean;
  channelId?: string;
  token: string;
  uid: number;
  joinChannelSuccess?: boolean;
  remoteUsers?: number[];
  startPreview?: boolean;
  largeViewId: number;
  largeViewData?: {
    canvas: any,
  }
}

const Header = ({ getData }: { getData: () => Array<string> }) => {
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  return (
    <>
      <AgoraButton title="Logs" onPress={toggleOverlay} />
      <LogSink
        visible={visible}
        data={getData()}
        onBackdropPress={toggleOverlay}
      />
    </>
  );
};

export default class JoinChannelVideo extends Component<{}, State>
  implements IRtcEngineEventHandler {
  private _data: Array<string> = [];
  protected engine?: IRtcEngine;

  constructor(props: {} & StackScreenProps<any>) {
    super(props);
    this.state = this.createState();
    props.navigation.setOptions({
      headerRight: () => <Header getData={() => this._data} />,
    });
  }

  componentDidMount() {
    this.initRtcEngine();
  }

  componentWillUnmount() {
    this.releaseRtcEngine();
  }

  protected createState(): State {
    return {
      appId: Config.appId,
      enableVideo: true,
      channelId: Config.channelId,
      token: Config.token,
      uid: Config.uid,
      joinChannelSuccess: false,
      remoteUsers: [],
      startPreview: false,
      switchCamera: false,
      renderByTextureView: false,
      setupMode: VideoViewSetupMode.VideoViewSetupReplace,
      largeViewId: -1,
    };
  }

  /**
   * Step 1: initRtcEngine
   */
  protected async initRtcEngine() {
    const { appId } = this.state;
    if (!appId) {
      this.error(`appId is invalid`);
    }

    this.engine = createAgoraRtcEngine();
    // await this.engine.setVideoEncoderConfiguration({
    //   dimensions: { width: 320, height: 240 },
    //   bitrate: 140,
    //   frameRate: 30,
    // })
    this.engine.initialize({
      appId,
      // Should use ChannelProfileLiveBroadcasting on most of cases
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    this.engine.registerEventHandler(this);

    this.engine.setVideoEncoderConfiguration({
      frameRate: 30,
    })
    if (Platform.OS === 'android') {
      // Need granted the microphone and camera permission
      await PermissionsAndroid.requestMultiple([
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ]);
    }



    // Need to enable video on this case
    // If you only call `enableAudio`, only relay the audio stream to the target channel
    this.engine.enableVideo();

    // Start preview before joinChannel
    this.engine.startPreview();
    this.setState({ startPreview: true });
  }

  /**
   * Step 2: joinChannel
   */
  protected joinChannel() {
    const { channelId, token, uid } = this.state;
    if (!channelId) {
      this.error('channelId is invalid');
      return;
    }
    if (uid < 0) {
      this.error('uid is invalid');
      return;
    }

    // start joining channel
    // 1. Users can only see each other after they join the
    // same channel successfully using the same app id.
    // 2. If app certificate is turned on at dashboard, token is needed
    // when joining channel. The channel name and uid used to calculate
    // the token has to match the ones used for channel join
    this.engine?.joinChannel(token, channelId, uid, {
      // Make myself as the broadcaster to send stream to remote
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
  }

  /**
   * Step 3 (Optional): switchCamera
   */
  switchCamera = () => {
    const { switchCamera } = this.state;
    this.engine?.switchCamera();
    this.setState({ switchCamera: !switchCamera });
  };

  /**
   * Step 4: leaveChannel
   */
  protected leaveChannel() {
    this.engine?.leaveChannel();
  }

  /**
   * Step 5: releaseRtcEngine
   */
  protected releaseRtcEngine() {
    this.engine?.unregisterEventHandler(this);
    this.engine?.release();
  }

  onError(err: ErrorCodeType, msg: string) {
    this.info('onError', 'err', err, 'msg', msg);
  }

  onJoinChannelSuccess(connection: RtcConnection, elapsed: number) {
    this.info(
      'onJoinChannelSuccess',
      'connection',
      connection,
      'elapsed',
      elapsed
    );
    this.setState({ joinChannelSuccess: true });
  }

  onLeaveChannel(connection: RtcConnection, stats: RtcStats) {
    this.info('onLeaveChannel', 'connection', connection, 'stats', stats);
    this.setState(this.createState());
  }

  onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number) {
    this.info(
      'onUserJoined',
      'connection',
      connection,
      'remoteUid',
      remoteUid,
      'elapsed',
      elapsed
    );
    const { remoteUsers } = this.state;
    if (remoteUsers === undefined) return;
    this.log("remoteUsers+++++", remoteUsers, Platform.OS)
    const uniqueusers = [...new Set([...remoteUsers!, remoteUid])]
    this.setState({
      remoteUsers: uniqueusers,
    });
  }

  onPressVideo = (id: number, canvas?: any) => {

    LayoutAnimation.easeInEaseOut()
    this.setState({ largeViewId: this.state.largeViewId == id ? -1 : id })
    if (this.state.largeViewId == id) {
      this.setState({ largeViewData: undefined })
    } else {
      this.setState({ largeViewData: { canvas } })
    }
  }

  onUserOffline(
    connection: RtcConnection,
    remoteUid: number,
    reason: UserOfflineReasonType
  ) {
    this.info(
      'onUserOffline',
      'connection',
      connection,
      'remoteUid',
      remoteUid,
      'reason',
      reason
    );
    const { remoteUsers } = this.state;
    if (remoteUsers === undefined) return;
    this.setState({
      remoteUsers: remoteUsers!.filter((value) => value !== remoteUid),
    });
  }

  onVideoDeviceStateChanged(
    deviceId: string,
    deviceType: number,
    deviceState: number
  ) {
    this.info(
      'onVideoDeviceStateChanged',
      'deviceId',
      deviceId,
      'deviceType',
      deviceType,
      'deviceState',
      deviceState
    );
  }

  onLocalVideoStateChanged(
    source: VideoSourceType,
    state: LocalVideoStreamState,
    error: LocalVideoStreamError
  ) {
    this.info(
      'onLocalVideoStateChanged',
      'source',
      source,
      'state',
      state,
      'error',
      error
    );
  }

  protected renderUsers(): React.ReactNode {
    const {
      startPreview,
      joinChannelSuccess,
      remoteUsers,
      renderByTextureView,
      setupMode,
    } = this.state;
    console.log("remoteUsers=>>>>", remoteUsers)
    return (

      <View style={{ flexDirection: 'row' }}>

        <ScrollView horizontal style={AgoraStyle.videoContainer}>
          {startPreview || joinChannelSuccess ? (
            renderByTextureView ? (
              <RtcTextuerButton
                style={AgoraStyle.videoSmall}
                canvas={{ uid: 0, setupMode }}
                onPress={() => this.onPressVideo(0, { uid: 0, setupMode })}
                containerStyle={AgoraStyle.videoSmall}
              />

            ) : (
              <RtcSurfaceButton
                style={AgoraStyle.videoSmall}
                canvas={{ uid: 0, setupMode }}
                onPress={() => this.onPressVideo(0, { uid: 0, setupMode })}
                containerStyle={AgoraStyle.videoSmall}
              />
            )
          ) : undefined}
          {remoteUsers !== undefined && remoteUsers.length > 0 ? remoteUsers.map((value, index) =>
            renderByTextureView ? (
              <RtcTextuerButton
                key={`${value}-${index}`}
                style={AgoraStyle.videoSmall}
                onPress={() => this.onPressVideo(index + 1, { uid: value, setupMode })}
                containerStyle={AgoraStyle.videoSmall}
                canvas={{ uid: value, setupMode }}
              />
            ) : (
              <RtcSurfaceButton
                key={`${value}-${index}`}
                style={AgoraStyle.videoSmall}
                zOrderMediaOverlay={true}
                canvas={{ uid: value, setupMode }}
                onPress={() => this.onPressVideo(index + 1, { uid: value, setupMode })}
                containerStyle={AgoraStyle.videoSmall}
              />
            )
          ) : undefined}
        </ScrollView>
      </View>
    );
  }

  private _logSink(
    level: 'debug' | 'log' | 'info' | 'warn' | 'error',
    message?: any,
    ...optionalParams: any[]
  ): string {
    if (level === 'error' && !__DEV__) {
      this.alert(message);
    } else {
      console[level](message, ...optionalParams);
    }
    const content = `${optionalParams.map((v) => JSON.stringify(v))}`;
    this._data.splice(0, 0, `[${level}] ${message} ${content}`);
    return content;
  }

  protected debug(message?: any, ...optionalParams: any[]): void {
    this.alert(message, this._logSink('debug', message, optionalParams));
  }

  protected log(message?: any, ...optionalParams: any[]): void {
    this._logSink('log', message, optionalParams);
  }

  protected info(message?: any, ...optionalParams: any[]): void {
    this._logSink('info', message, optionalParams);
  }

  protected warn(message?: any, ...optionalParams: any[]): void {
    this._logSink('warn', message, optionalParams);
  }

  protected error(message?: any, ...optionalParams: any[]): void {
    this._logSink('error', message, optionalParams);
  }

  protected alert(title: string, message?: string): void {
    Alert.alert(title, message);
  }

  protected renderAction(): React.ReactNode {
    const { startPreview, joinChannelSuccess } = this.state;
    return (
      <>
        <AgoraButton
          disabled={!startPreview && !joinChannelSuccess}
          title={`switchCamera`}
          onPress={this.switchCamera}
        />
      </>
    );
  }
  protected renderChannel(): React.ReactNode {
    const { channelId, joinChannelSuccess } = this.state;
    return (
      <>
        <AgoraTextInput
          onChangeText={(text: string) => {
            this.setState({ channelId: text });
          }}
          placeholder={`channelId`}
          value={channelId}
        />
        <AgoraButton
          title={`${joinChannelSuccess ? 'leave' : 'join'} Channel`}
          onPress={() => {
            joinChannelSuccess ? this.leaveChannel() : this.joinChannel();
          }}
        />
      </>
    );
  }


  render() {
    const { enableVideo, largeViewData, largeViewId, renderByTextureView } = this.state;
    return (
      <KeyboardAvoidingView
        style={AgoraStyle.fullSize}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AgoraView style={AgoraStyle.fullWidth}>
          {this.renderChannel()}
        </AgoraView>


        {(largeViewId != -1 && largeViewData) ? (renderByTextureView ? (
          <RtcTextuerButton
            {...largeViewData}
            onPress={() => this.onPressVideo(largeViewId)}
            containerStyle={AgoraStyle.videoLarge}
            key={largeViewId}
          />
        ) : (
          <RtcSurfaceButton
            style={AgoraStyle.videoLarge}
            zOrderMediaOverlay={true}
            onPress={() => this.onPressVideo(largeViewId)}
            containerStyle={AgoraStyle.videoLarge}
            key={largeViewId}
            {...largeViewData}
          />
        )) : (enableVideo ? (
          <AgoraView style={{ flex: 1 }}>
            {this.renderUsers()}
          </AgoraView>
        ) : null)
        }

        <AgoraView style={AgoraStyle.float}>{this.renderAction()}</AgoraView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 10,
    fontWeight: 'bold',
  },
  viewUsers: {
    flexDirection: 'row',
  }
});