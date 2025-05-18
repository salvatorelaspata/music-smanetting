import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor } from 'react-native-vision-camera';

import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Skia, PaintStyle, Canvas } from '@shopify/react-native-skia';

import {
  OpenCV, ObjectType, DataTypes, ColorConversionCodes, RetrievalModes,
  ContourApproximationModes, Rect
} from 'react-native-fast-opencv'

const paint = Skia.Paint();
paint.setStyle(PaintStyle.Fill);
paint.setColor(Skia.Color('lime'));

export default function Index() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const { resize } = useResizePlugin();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // const frameProcessor = useSkiaFrameProcessor((frame) => {
  //   'worklet';

  //   const height = frame.height / 4;
  //   const width = frame.width / 4;

  //   const resized = resize(frame, {
  //     scale: {
  //       width: width,
  //       height: height,
  //     },
  //     pixelFormat: 'bgr',
  //     dataType: 'uint8',
  //   });

  //   // Process the resized frame data here
  //   // For now just return the frame data
  //   return resized;
  // }, []);

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet';

    const height = frame.height / 4;
    const width = frame.width / 4;

    const resized = resize(frame, {
      scale: {
        width: width,
        height: height,
      },
      pixelFormat: 'bgr',
      dataType: 'uint8',
    });

    const src = OpenCV.frameBufferToMat(height, width, 3, resized);
    const dst = OpenCV.createObject(ObjectType.Mat, 0, 0, DataTypes.CV_8U);

    const lowerBound = OpenCV.createObject(ObjectType.Scalar, 30, 60, 60);
    const upperBound = OpenCV.createObject(ObjectType.Scalar, 50, 255, 255);
    OpenCV.invoke('cvtColor', src, dst, ColorConversionCodes.COLOR_BGR2HSV);
    OpenCV.invoke('inRange', dst, lowerBound, upperBound, dst);

    const channels = OpenCV.createObject(ObjectType.MatVector);
    OpenCV.invoke('split', dst, channels);
    const grayChannel = OpenCV.copyObjectFromVector(channels, 0);

    const contours = OpenCV.createObject(ObjectType.MatVector);
    OpenCV.invoke(
      'findContours',
      grayChannel,
      contours,
      RetrievalModes.RETR_TREE,
      ContourApproximationModes.CHAIN_APPROX_SIMPLE
    );

    const contoursMats = OpenCV.toJSValue(contours);
    const rectangles: Rect[] = [];

    for (let i = 0; i < contoursMats.array.length; i++) {
      const contour = OpenCV.copyObjectFromVector(contours, i);
      const { value: area } = OpenCV.invoke('contourArea', contour, false);

      if (area > 3000) {
        const rect = OpenCV.invoke('boundingRect', contour);
        rectangles.push(rect);
      }
    }

    frame.render();

    for (const rect of rectangles) {
      const rectangle = OpenCV.toJSValue(rect);

      frame.drawRect(
        {
          height: rectangle.height * 4,
          width: rectangle.width * 4,
          x: rectangle.x * 4,
          y: rectangle.y * 4,
        },
        paint
      );
    }

    OpenCV.clearBuffers(); // REMEMBER TO CLEAN
  }, []);

  if (!hasPermission) {
    return <Text>No permission</Text>;
  }

  if (device == null) {
    return <Text>No device</Text>;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <Canvas style={StyleSheet.absoluteFill}>
        {/* You can add Skia drawing code here if needed */}
      </Canvas>
    </View>
  );
}