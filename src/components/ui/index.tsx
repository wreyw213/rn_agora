import React, { useEffect, useState } from 'react';
import { Button, Image, ImageProps, StyleSheet, SwitchProps, Text, TextInput, TextProps, View, ViewProps } from 'react-native';
import PickerSelect, {
  PickerSelectProps,
  Item,
} from 'react-native-picker-select';
import { PickerProps } from '@react-native-picker/picker/typings/Picker';
import { ButtonProps } from 'react-native';
import { Slider, SliderProps } from '../Slider';
import { Switch } from 'react-native';
import { TextInputProps } from 'react-native';


export const AgoraView = (props: ViewProps) => {
  return (
    <>
      <View {...props} />
    </>
  );
};

export const AgoraText = (props: TextProps) => {
  return (
    <>
      <Text {...props} />
    </>
  );
};

export const AgoraButton = (props: ButtonProps) => {
  return (
    <>
      <Button {...props} />
    </>
  );
};

export const AgoraDivider = (props: ViewProps) => {
  return (
    <>
      <View style={{ height: 1, width: '100%', borderColor: 'grey' }} {...props} />
    </>
  );
};

export const AgoraTextInput = (props: TextInputProps) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const { style, ...others } = props;
  return (
    <View style={[AgoraStyle.input, style]}>
      <TextInput
        style={[AgoraStyle.input, style]}
        placeholderTextColor={'gray'}
        {...others}
        onChangeText={(text) => {
          setValue(text);
          props.onChangeText?.call(this, text);
        }}
        value={value}
      />
    </View>
  );
};

export const AgoraSlider = (props: SliderProps & { title: string }) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const { title, ...others } = props;
  return (
    <>
      <AgoraText children={title} />
      <Slider
        style={AgoraStyle.slider}
        minimumTrackTintColor={'white'}
        thumbStyle={AgoraStyle.thumb}
        {...others}
        value={value}
        onValueChange={(v: any) => {
          setValue(v);
          props.onValueChange?.call(this, v);
        }}
      />
    </>
  );
};

export const AgoraSwitch = (props: SwitchProps & { title: string }) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const { title, ...others } = props;
  return (
    <>
      <AgoraText children={title} />
      <Switch
        {...others}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          props.onValueChange?.call(this, v);
        }}
      />
    </>
  );
};

export const AgoraImage = (props: ImageProps) => {
  return (
    <>
      <Image {...props} />
    </>
  );
};

export interface AgoraDropdownItem extends Item { }

export const AgoraDropdown = (
  props: PickerSelectProps & PickerProps & { title: string }
) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <AgoraView style={AgoraStyle.fullWidth}>
      <AgoraText children={props.title} />
      <PickerSelect
        {...props}
        pickerProps={{
          style: AgoraStyle.fullWidth,
          enabled: props.enabled,
          dropdownIconColor: 'gray',
        }}
        value={value}
        // @ts-ignore
        textInputProps={{ style: AgoraStyle.input, chevronUp: true }}
        onValueChange={(v, index) => {
          if (v === null || v === undefined) return;
          setValue(v);
          props.onValueChange?.call(this, v, index);
        }}
      />
    </AgoraView>
  );
};

export const AgoraStyle = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  fullSize: {
    flex: 1,
  },
  input: {
    height: 50,
    color: 'black',
  },
  videoContainer: {
    height: 200,
  },
  videoLarge: {
    // flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoSmall: {
    width: 120,
    height: 120,
    margin: 20
  },
  float: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    height: 20,
    width: 20,
    backgroundColor: '#FFF',
  },
});
