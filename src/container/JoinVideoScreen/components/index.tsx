import { StyleProp, TouchableOpacity, ViewProps, ViewStyle } from "react-native"
import { RtcRendererViewProps, RtcSurfaceView, RtcSurfaceViewProps, RtcTextureView } from "react-native-agora"
import IAgoraRtcRenderView from "react-native-agora/lib/typescript/internal/IAgoraRtcRenderView"

type TOuch = {
    onPress: () => void,
    containerStyle?: StyleProp<ViewStyle>
}
type TextureProps = RtcRendererViewProps & ViewProps & {
    onPress: () => void,
    containerStyle: StyleProp<ViewStyle>,

}

export const RtcTextuerButton = ({ onPress, containerStyle, ...Props }: TextureProps) => {
    return <TouchableOpacity style={containerStyle} onPress={onPress}>
        <RtcTextureView
            {...Props}
        />
    </TouchableOpacity>
}

type SurfaceProps = RtcSurfaceViewProps & ViewProps & {
    onPress: () => void,
    containerStyle?: StyleProp<ViewStyle>
}

export const RtcSurfaceButton = ({ onPress, containerStyle, ...Props }: SurfaceProps) => {
    return <TouchableOpacity style={containerStyle} onPress={onPress}>
        <RtcSurfaceView
            {...Props}
        />
    </TouchableOpacity>
}