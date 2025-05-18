import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor } from 'react-native-vision-camera';

import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Skia, PaintStyle, Canvas, Rect, Circle, vec, PointMode } from '@shopify/react-native-skia';
import type { SkPoint } from '@shopify/react-native-skia';
import {
  OpenCV, ObjectType, RetrievalModes, ColorConversionCodes, MorphShapes,
  MorphTypes, ContourApproximationModes, PointVector,
} from 'react-native-fast-opencv'

const paint = Skia.Paint();
paint.setStyle(PaintStyle.Fill);
paint.setColor(Skia.Color('lime'));
paint.setStyle(PaintStyle.Fill);
paint.setColor(Skia.Color(0x66_e7_a6_49));

const border = Skia.Paint();
border.setStyle(PaintStyle.Fill);
border.setColor(Skia.Color(0xff_e7_a6_49));
border.setStrokeWidth(4);

type Point = { x: number; y: number };
export default function Index() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const { resize } = useResizePlugin();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet';


    /** Image scaling */
    const ratio = 500 / frame.width;
    const height = frame.height * ratio;
    const width = frame.width * ratio;
    const resized = resize(frame, {
      scale: {
        width: width,
        height: height,
      },
      pixelFormat: 'bgr',
      dataType: 'uint8',
    });

    /** Pre-processing and filters */

    const source = OpenCV.frameBufferToMat(height, width, 3, resized);

    OpenCV.invoke(
      'cvtColor',
      source,
      source,
      ColorConversionCodes.COLOR_BGR2GRAY,
    );

    const kernel = OpenCV.createObject(ObjectType.Size, 4, 4);
    const blurKernel = OpenCV.createObject(ObjectType.Size, 7, 7);
    const structuringElement = OpenCV.invoke(
      'getStructuringElement',
      MorphShapes.MORPH_ELLIPSE,
      kernel,
    );

    OpenCV.invoke(
      'morphologyEx',
      source,
      source,
      MorphTypes.MORPH_OPEN,
      structuringElement,
    );
    OpenCV.invoke(
      'morphologyEx',
      source,
      source,
      MorphTypes.MORPH_CLOSE,
      structuringElement,
    );
    OpenCV.invoke('GaussianBlur', source, source, blurKernel, 0);
    OpenCV.invoke('Canny', source, source, 75, 100);

    /** Contour detection */
    const contours = OpenCV.createObject(ObjectType.PointVectorOfVectors);

    OpenCV.invoke(
      'findContours',
      source,
      contours,
      RetrievalModes.RETR_LIST,
      ContourApproximationModes.CHAIN_APPROX_SIMPLE,
    );

    const contoursMats = OpenCV.toJSValue(contours);
    /** Detection of a document */

    let greatestPolygon: PointVector | undefined;
    let greatestArea = 0;

    for (let index = 0; index < contoursMats.array.length; index++) {
      const contour = OpenCV.copyObjectFromVector(contours, index);
      const { value: area } = OpenCV.invoke('contourArea', contour, false);

      if (area > 2000 && area > greatestArea) {
        const peri = OpenCV.invoke('arcLength', contour, true);
        const approx = OpenCV.createObject(ObjectType.PointVector);

        OpenCV.invoke('approxPolyDP', contour, approx, 0.1 * peri.value, true);

        greatestPolygon = approx;
        greatestArea = area;
      }
    }

    frame.render();

    /** Drawing a document border */

    type Point = { x: number; y: number };
    if (greatestPolygon) {
      const points: Point[] = OpenCV.toJSValue(greatestPolygon).array;

      if (points.length === 4) {
        const path = Skia.Path.Make();
        const pointsToShow: SkPoint[] = [];

        const lastPointX = points[3].x / ratio;
        const lastPointY = points[3].y / ratio;

        path.moveTo(lastPointX, lastPointY);
        pointsToShow.push(vec(lastPointX, lastPointY));

        for (let index = 0; index < 4; index++) {
          const pointX = points[index].x / ratio;
          const pointY = points[index].y / ratio;

          path.lineTo(pointX, pointY);
          pointsToShow.push(vec(pointX, pointY));
        }

        path.close();

        frame.drawPath(path, paint);
        frame.drawPoints(PointMode.Polygon, pointsToShow, border);
      }
    }

    OpenCV.clearBuffers();

  }, []);

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

  //   const src = OpenCV.frameBufferToMat(height, width, 3, resized);
  //   const dst = OpenCV.createObject(ObjectType.Mat, 0, 0, DataTypes.CV_8U);

  //   const lowerBound = OpenCV.createObject(ObjectType.Scalar, 30, 60, 60);
  //   const upperBound = OpenCV.createObject(ObjectType.Scalar, 50, 255, 255);
  //   OpenCV.invoke('cvtColor', src, dst, ColorConversionCodes.COLOR_BGR2HSV);
  //   OpenCV.invoke('inRange', dst, lowerBound, upperBound, dst);

  //   const channels = OpenCV.createObject(ObjectType.MatVector);
  //   OpenCV.invoke('split', dst, channels);
  //   const grayChannel = OpenCV.copyObjectFromVector(channels, 0);

  //   const contours = OpenCV.createObject(ObjectType.MatVector);
  //   OpenCV.invoke(
  //     'findContours',
  //     grayChannel,
  //     contours,
  //     RetrievalModes.RETR_TREE,
  //     ContourApproximationModes.CHAIN_APPROX_SIMPLE
  //   );

  //   const contoursMats = OpenCV.toJSValue(contours);
  //   const rectangles: Rect[] = [];

  //   for (let i = 0; i < contoursMats.array.length; i++) {
  //     const contour = OpenCV.copyObjectFromVector(contours, i);
  //     const { value: area } = OpenCV.invoke('contourArea', contour, false);

  //     if (area > 3000) {
  //       const rect = OpenCV.invoke('boundingRect', contour);
  //       rectangles.push(rect);
  //     }
  //   }

  //   frame.render();

  //   for (const rect of rectangles) {
  //     const rectangle = OpenCV.toJSValue(rect);

  //     frame.drawRect(
  //       {
  //         height: rectangle.height * 4,
  //         width: rectangle.width * 4,
  //         x: rectangle.x * 4,
  //         y: rectangle.y * 4,
  //       },
  //       paint
  //     );
  //   }

  //   OpenCV.clearBuffers(); // REMEMBER TO CLEAN
  // }, []);

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
        {/* Example of drawing a rectangle */}

        <Rect
          x={50}
          y={50}
          width={100}
          height={100}
          color="red"
        />


        <Circle
          cx={200}
          cy={200}
          r={50}
          color="blue"
        />

      </Canvas>
    </View>
  );
}