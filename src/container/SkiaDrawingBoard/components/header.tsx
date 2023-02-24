import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import useDrawingStore from '../store';
import history from '../history';
import utils from '../utils';
import { ImageFormat, SkiaView } from '@shopify/react-native-skia';
import Share from 'react-native-share';

const Header = ({ innerRef }: any) => {
  /**
   * Reset the canvas & draw state
   */
  const reset = () => {
    useDrawingStore.getState().setCompletedPaths([]);
    useDrawingStore.getState().setStroke(utils.getPaint(2, 'black'));
    useDrawingStore.getState().setColor('black');
    useDrawingStore.getState().setStrokeWidth(2);
    history.clear();
  };

  const save = () => {
    let canvasInfo = useDrawingStore.getState().canvasInfo;
    let paths = useDrawingStore.getState().completedPaths;
    if (paths.length === 0) return;
    console.log('saving');
    if (canvasInfo?.width && canvasInfo?.height) {
      console.log(
        utils.makeSvgFromPaths(paths, {
          width: canvasInfo.width,
          height: canvasInfo.height,
        }),
      );
    }
  };

  const undo = () => {
    history.undo();
  };

  const exportFile = async () => {
    try {
      const image = innerRef.current?.makeImageSnapshot();
      if (image) {
        const data = image.encodeToBase64(ImageFormat.JPEG, 100);
        const url = `data:image/png;base64,${data}`;
        const shareOptions = {
          title: 'Sharing image from awesome drawing app',
          message: 'My drawing',
          url,
          failOnCancel: false,

        };
        await Share.open(shareOptions);
      }
    } catch (err) {
      console.log("error", err);
    }
  };
  return (
    <View
      style={{
        height: 50,
        width: '100%',
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={undo}
          style={[styles.button, { marginRight: 10 }]}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={exportFile}
          activeOpacity={0.6}
          style={styles.button}>
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={reset}
          activeOpacity={0.6}
          style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={save}
          style={[styles.button, { marginLeft: 10 }]}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    ...utils.getElevation(1),
  },
  buttonText: {
    color: 'black',
  },
});

export default Header;
