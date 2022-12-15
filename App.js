import React, {useRef, useState, useEffect } from 'react';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { StyleSheet, SafeAreaView, Platform, StatusBar, TextInput, View, Text, TouchableOpacity } from 'react-native';
import MathJax from 'react-native-mathjax';
import ViewShot from "react-native-view-shot";
//import PredictTensorflow from './tensorflowComponent'
import * as mobilenet from '@tensorflow-models/mobilenet';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs'
import { getGamma } from '@luncheon/simplify-svg-path/index.js'

var nerdamer = require('nerdamer'); 
require('nerdamer/Algebra'); 
require('nerdamer/Calculus'); 
require('nerdamer/Solve'); 
require('nerdamer/Extra');

import { Button, Image } from 'react-native';
import { Canvas } from '@benjeau/react-native-draw';
    
export default function App () {


  //tensorflow

  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('bruh');
  const image = useRef(null);

  /*const load = async () => {
      try {
          // Load mobilenet.
          await tf.ready();
          const model = await mobilenet.load();
          //await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
          setIsTfReady(true);

          
      } catch (err) {
          console.log(err);
      }
  };
  useEffect(() => {
      load();
  }, []);*/

  const predict = async (uri) => {
    await tf.ready();
    setIsTfReady(true);
    
    // Start inference and show result.
    //const imageAssetPath = Image.resolveAssetSource(image);
    //const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
    const response = await fetch(uri, {}, { isBinary: true });
    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageDataArrayBuffer);
    const imageTensor = decodeJpeg(imageData);
    //console.log(imageTensor);
    const model = await mobilenet.load();
    const prediction = await model.classify(imageTensor);
    if (prediction && prediction.length > 0) {
        setResult(
            `${prediction[0].className} (${prediction[0].probability.toFixed(3)})`
        );
    }
  }


    //


  const picRef = useRef();

  const canvasRef = useRef(null);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const getSVG = () => {
    console.log(canvasRef.current?.getSvg());
    console.log(canvasRef.current?.getTimestamps());
    console.log(getGamma());
  }  
  const [type, onChangeType] = useState("solve");
  const [math, onChangeText] = useState("5x=5");
  const [vari, onChangeVar] = useState("x");
  const [expressionOutput, expOutput] = useState("");
  const [currentTool, onChangeTool] = useState("brush");
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };


  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
        <Button title="Solve" onPress={() => {
          predict(photo.uri);
          setPhoto(undefined);
        }}/>
      </SafeAreaView>
    );
  }


  const solve = () => {
    let eq = nerdamer(type+'('+math+','+vari+')').toTeX();
    expOutput('$'+eq+'$');
  }
  const toolTitle = current => {
    if (current == 'brush') {
      return 'Eraser';
    } else {
      return 'Brush';
    }
  }
  async function Snap() {
    const imageJPG = await picRef.current.capture();
    predict(imageJPG);
    //PredictTensorflow(imageJPG);
    
  }
  return (
    <SafeAreaView /*style={styles.AndroidSafeArea}*/ >
      <Text style={styles.title}>
        Paperless
      </Text>
      <ViewShot ref={picRef} options={{ format: "jpg", quality: 0.9 }}>
        <Canvas
          ref={canvasRef}
          height={200}
          width={200}
          thickness={5}
          opacity={1}
          tool={currentTool}
          style = {styles.canvas}
        />
      </ViewShot>
      
      <View style={styles.buttonContainer}>
        <Button title='Undo' onPress={handleUndo} />
        <Button title='Clear' onPress={handleClear} />
        <Button title={toolTitle(currentTool)} onPress={() => {
          if (currentTool == 'brush') {
            onChangeTool('eraser');
          } else {
            onChangeTool('brush');
          }      
        }}/>
        <Button title='Solve' onPress={getSVG} /> 
        {/*<Button title='Test' onPress={PredictTensorflow()}/>*/}
      </View>      
      
      <TextInput 
        style={styles.input}
        onChangeText={onChangeType}
        onSubmitEditing={solve}
        value={type}
      />
      <TextInput 
        style={styles.input}
        onChangeText={onChangeText}
        onSubmitEditing={solve}
        value={math}
      />
      <TextInput 
        style={styles.input}
        onChangeText={onChangeVar}
        onSubmitEditing={solve}
        value={vari}
      />
      <MathJax
        html={`Answer: ${expressionOutput}`}
      />
      <Text>
        {result}
      </Text>
      {/*<Camera style={styles.camera} ref = {cameraRef}>
        <TouchableOpacity onPress={takePic}> 
          <Image source={require("./assets/camera.png")}
            style={{width: 100,
            height: 100}} />
        </TouchableOpacity>
            </Camera>*/}
    </SafeAreaView>
  );
}

//export default App;

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  canvas: {
    alignItems: 'center',
    justifyContent: 'space-around',
    //borderColor: 'black',
    //borderWidth: 2,
    margin: 20,
    marginHorizontal: 20
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    flex: 1,
    marginTop: 10
  },
  input: {
    borderColor: "black",
  },
  text: {
    borderColor: "black",
  },
  title: {
    fontSize: 30,
    alignItems: 'center'
  },
  camera: {
    borderColor: "black",
    height: 700,
    alignItems: 'center'
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  }
});
