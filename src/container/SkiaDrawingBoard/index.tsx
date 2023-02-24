import {
  Canvas,
  ExtendedTouchInfo,
  Path,
  Skia,
  SkiaView,
  TouchInfo,
  useDrawCallback,
  useTouchHandler,
} from '@shopify/react-native-skia';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import useDrawingStore, { CurrentPath } from './store';
import Header from './components/header';
import history from './history';
import Toolbar from './components/toolbar';

const Drawing = () => {
  const touchState = useRef(false);
  const currentColor = useDrawingStore(state => state.color);
  const currentStrokeWidth = useDrawingStore(state => state.strokeWidth);

  const canvas = useRef<any>();
  const currentPath = useRef<CurrentPath | null>();
  const { width } = useWindowDimensions();
  const completedPaths = useDrawingStore(state => state.completedPaths);
  const setCompletedPaths = useDrawingStore(state => state.setCompletedPaths);
  const stroke = useDrawingStore(state => state.stroke);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const skiaViewRef = useRef(null);

  const completedPathsRef = useRef(completedPaths)

  const onDrawingActive = useCallback((touchInfo: ExtendedTouchInfo) => {
    const { x, y } = touchInfo;
    if (!currentPath.current?.path) return;
    if (touchState.current) {
      currentPath.current.path.lineTo(x, y);
      if (currentPath.current) {
        canvas.current?.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    }
  }, []);

  useEffect(() => {
    completedPathsRef.current = completedPaths
  }, [completedPaths])

  const onDrawingStart = useCallback(
    (touchInfo: TouchInfo) => {
      if (currentPath.current) return;
      const { x, y } = touchInfo;
      currentPath.current = {
        path: Skia.Path.Make(),
        paint: stroke.copy(),
      };

      touchState.current = true;
      currentPath.current.path?.moveTo(x, y);

      if (currentPath.current) {
        canvas.current?.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    },
    [stroke],
  );

  const onDrawingFinished = () => {
    updatePaths();
    currentPath.current = null;
    touchState.current = false;
  };

  const touchHandler = useTouchHandler({
    onActive: onDrawingActive,
    onStart: onDrawingStart,
    onEnd: onDrawingFinished,
  });

  const updatePaths = () => {
    console.log("completedPaths=>>>", completedPaths.length, completedPathsRef.current.length);

    if (!currentPath.current) return;
    let updatedPaths = completedPathsRef.current?.length ? [...completedPathsRef.current] : [];
    updatedPaths.push({
      path: currentPath.current?.path.copy(),
      paint: currentPath.current?.paint.copy(),
      color: useDrawingStore.getState().color,
      strokeWidth: useDrawingStore.getState().strokeWidth
    });
    history.push(currentPath.current);
    console.log("updatedPaths", updatedPaths.length);

    setCompletedPaths(updatedPaths);
  };

  const onDraw = useDrawCallback((_canvas, info) => {


    touchHandler(info.touches);

    if (currentPath.current) {
      canvas.current?.drawPath(
        currentPath.current.path,
        currentPath.current.paint,
      );
    }

    if (!canvas.current) {
      useDrawingStore.getState().setCanvasInfo({
        width: info.width,
        height: info.height,
      });
      canvas.current = _canvas;
    }
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    setCanvasHeight(event.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <View
        style={{
          backgroundColor: '#f0f0f0',
          flex: 1,
          alignItems: 'center',
        }}>
        <Header innerRef={skiaViewRef} />


        <View
          onLayout={onLayout}
          style={{
            width: width - 24,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            borderRadius: 10,
            overflow: 'hidden',
            elevation: 1,
          }}>
          <SkiaView
            onDraw={onDraw}
            mode={'continuous'}
            style={{ height: canvasHeight, width: width - 24, zIndex: 10 }}
          />

          <Canvas
            ref={skiaViewRef}
            style={{
              height: canvasHeight,
              width: width - 24,
              position: 'absolute',
            }}>
            {completedPaths?.map(path => (
              <Path
                key={path.path.toSVGString()}
                path={path.path}
                //@ts-ignore 
                style="stroke"
                strokeWidth={path.strokeWidth}
                color={path.color}
                paint={{ current: path.paint }}
              />
            ))}
          </Canvas>
        </View>

        <Toolbar />
      </View>
    </SafeAreaView>
  );
};

export default Drawing;

