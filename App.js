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
import * as tf from '@tensorflow/tfjs';

var collections = require('pycollections');
var nerdamer = require('nerdamer'); 
require('nerdamer/Algebra'); 
require('nerdamer/Calculus'); 
require('nerdamer/Solve'); 
require('nerdamer/Extra');

import { Button, Image } from 'react-native';
import { Canvas } from '@benjeau/react-native-draw';

function parse_latex(symbols, relations) {
  let utf=0;
  let open_brackets=0;
  let latex_string=symbols[0];
  for (let i=0; i<len(relations); i++) {
    let s=symbols[i+1];
    full_rel=relations[i];
    let split_rel=full_rel.split('-');
    add_symbol=true;
    for (let rel of split_rel) {
      if (rel == "DFS" || rel== "UFS"||rel=="OFI"||rel=="UFD"||rel=="UFL"||rel=="DFL"){
        latex_string+="}";
        open_brackets-=1;
      } 
      if (rel == "NTB"){
        add_symbol=false;
        if (utf) {
          latex_string+=("}{");
          utf-=1;
        } else{
          latex_string="\\frac{"+latex_string+"}{";
          open_brackets+=1;
        }
      } if (rel == "UTF"){
        latex_string+=("\\frac{"+s);
        open_brackets+=1;
        utf+=1;
        add_symbol=false;
      } if (rel=="Sub"||rel=="LB"|| rel=="DTI"){
        latex_string+=("_{")
        open_brackets+=1;
      } if (rel == "Sup") {
        latex_string+=("^{")
        open_brackets+=1;
      } if (rel == "Inside") {
        latex_string+=("{");
        open_brackets+=1;
      } if (rel == "STS"){
        latex_string+=("}_{");
      } if (rel == "ITL"){
        latex_string+=("}^{");
      } if (rel == "Radical") {
        latex_string+="[";
      } if (rel == "RTI") {
        latex_string+="]{";
        open_brackets+=1;
      }
    }
    if (add_symbol) {
      latex_string+=s;
    }
  }
  latex_string+="}".repeat(open_brackets);   
  //latex_string+=("}")*open_brackets
  return (latex_string);
}
function parse_traces(file, tolerance=15, precision_a=8, precision_b=150) {
  a=[]
  first = true
  prevEnd = null
  //mins=tf.math.reduce_min(tf.ragged.constant(list_points), axis=(0,1))
  //maxs=tf.math.reduce_max(tf.ragged.constant(list_points), axis=(0,1))
  //min_y=float(mins[1])
  //max_y=float(maxs[1])
  for (points of list_points) {
    points=filterRepeats_Normalize(points,list_points[0][0][0],min_y,max_y,precision_b);
    features=getFeatures(points, options(False,tolerance,precision_a));
    if (first) {
      a.push([[20.0, precision_b/2-features[1][1], 0.0, 0.0, 0.0, 0.0, 0]]);
    } else {
        dx=features[1][0]-prevEnd[0];
        dy=features[1][1]-prevEnd[1];
        a.push([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1]]);
        a.push([[dx, dy, 0.0, 0.0, 0.0, 0.0, 0]]);
        a.push([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1]]);
        a.push([[dx, dy, math.sqrt(dx**2/9+dy**2/9), math.sqrt(dx**2/9+dy**2/9), 0.0, 0.0, 0]]);
    }
    a.push(features[0]);
    prevEnd = features[2];
    first=False;
  }
  a.push([[20.0, precision_b/2-prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0]]);
  return a;

function convert_sequence(sequence) {
  return (sequence.filter((element, index) => {
    return index % 2 === 0;
  }));
}
function get_latex(sequence) {
  converted_sequence=convert_sequence(sequence);
  return parse_latex(converted_sequence[0], converted_sequence[1]);
}

export default function App () {
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('Ans');
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
    //const response = await fetch(imageAssetPath.uri, {}, { isBinary{ true });
    const response = await fetch(uri, {}, { isBinary: true } );
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
    //console.log(canvasRef.current?.getTimestamps());
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
        <Image style={styles.preview} source={{ uri: "data{image/jpg;base64," + photo.base64 }} />
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
    let eq;
    try {
      eq = nerdamer(type+'('+math+','+vari+')').toTeX();
    } 
    catch (err) {
      eq = "invalid";
    }
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
      <ViewShot ref={picRef} options={{ format:"jpg", quality: 0.9 }}>
        <Canvas
          ref={canvasRef}
          height={200}
          width={200}
          thickness={1}
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
        html={`Answer{ ${expressionOutput}`}
      />
      <Text>
        {result}
      </Text>
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
