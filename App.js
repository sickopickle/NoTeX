import React, {useRef, useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, TextInput, View, Text, Button } from 'react-native';
import MathJax from 'react-native-mathjax';
import { fetch, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';

var nerdamer = require('nerdamer'); 
require('nerdamer/Algebra'); 
require('nerdamer/Calculus'); 
require('nerdamer/Solve'); 
require('nerdamer/Extra');

import { Canvas } from '@benjeau/react-native-draw';
import simplifySvgPath from '@luncheon/simplify-svg-path';
//import * as ctc from '@nanopore/fast-ctc-decode';

const parse_latex = (symbols, relations) => {
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
function parse_traces(tolerance=15, precision_a=5, precision_b=250) {
  a=[]
  first = true
  prevEnd = null
  //mins=tf.math.reduce_min(tf.ragged.constant(list_points), axis=(0,1))
  //maxs=tf.math.reduce_max(tf.ragged.constant(list_points), axis=(0,1))
  //min_y=float(mins[1])
  //max_y=float(maxs[1])
  for (points of list_points) {
    points=filterRepeats_Normalize(points,list_points[0][0][0],min_y,max_y,precision_b);
    features=getData(points, options(False,tolerance,precision_a));
    if (first) {
      a.push([[20.0, precision_b/2-features[1][1], 0.0, 0.0, 0.0, 0.0, 0]]);
      a.push([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]]);
    } else {
        dx=features[1][0]-prevEnd[0];
        dy=features[1][1]-prevEnd[1];
        a.push([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1]]);
        a.push([[dx, dy, 0.0, 0.0, 0.0, 0.0, 0]]);
        a.push([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1]]);
        a.push([[dx, dy, Math.sqrt(dx**2/9+dy**2/9), Math.sqrt(dx**2/9+dy**2/9), 0.0, 0.0, 0]]);
    }
    a.push(features[0]);
    prevEnd = features[2];
    first=False;
  }
  a.push([[20.0, precision_b/2-prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0]]);
  return a;
}
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
  const [result, setResult] = useState('Ans');
  const [model,setModel]=useState("");
  useEffect(() => {
    async function loadModel(){
      console.log("[+] Application started")
      //Wait for tensorflow module to be ready
      const tfReady = await tf.ready();
      console.log("[+] Loading model...")
      const modelJson = await require("./assets/model/model.json");
      const modelWeight = await require("./assets/model/group1-shard1of1.bin");
      const model = await tf.loadLayersModel(bundleResourceIO(modelJson,modelWeight));
      console.log("[+] Loading pre-trained face detection model")
      setModel(model)
      console.log("[+] Model Loaded")
    }
    loadModel()
  }, []);
  const getPreds = async(input) => {
    const result = await model.predict(input).data();
    /*const alphabet = ["Right", "Sub", "Sup", "Inside", "UTF", "NTB", "BTD", "UFD", "DFS", "UFS", "OFI", "DFS-NTB", "LB",'UFL','STS','DTI','ITL','DFL','UFS-NTB','DFS-UFD','UFS-UFD','DFS-DFS','OFI-NTB',
    'OFI-UFD','DFS-OFI','OFI-OFI','UFD-DFS','Sup-UTF','UFS-UTF','UFL-UTF','Inside-UTF','UFD-OFI','DFS-OFI-UFD','NTB-UTF','UFS-UFS','DFL-UTF','UFD-UFD',
    'UFS-OFI','UFS-DFS','Radical','RTI','RTI-UTF','Radical-UTF','!','(',')','+','-','frac','.','/','0','1','2','3','4','5','6','7','8','9',
    '<','=','>','A','B','C','COMMA','E','F','G','H','I','L','M','N','P','R','S','T','V','X','Y','[','\\Delta','\\alpha','\\beta','\\cos','\\div',
    '\\exists','\\forall','\\gamma','\\geq','\\gt','\\in','\\infty','\\int','\\lambda','\\ldots','\\leq','\\lim','\\log','\\lt','\\mu','\\neq',
    '\\phi','\\pi','\\pm','\\prime','\\rightarrow','\\sigma','\\sin','\\sqrt','\\sum','\\tan','\\theta','\\times','\\{','\\}',']','a','b',
    'c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','|','EOS','BLANK'];
    const beamSize = 100;
    const beamCutThreshold = Number(0.0).toPrecision(2);
    const collapseRepeats = true;
    const shape = [result.length()/149, 149];
    ctc.init('fast_ctc_decode_wasm_bg.wasm');*/
    output=Array(result);
    let max_prob=0;
    for (let i=0;i<result.length();i++) {
      if (i%149==0 && i>0){
        max_prob=0;
      }
      if (output[i]>max_prob){
        symbol_idx=i%149;
        max_prob=output[i];
      }
    }
    const beamsearch = await ctc.beam_search(Array(result), alphabet, beamSize, beamCutThreshold, collapseRepeats, shape);
    //console.log(model.weights);
    //let result = await model.predict({'input_1': input,'StatefulPartitionedCall/model/bidirectional_2/forward_lstm_2/PartitionedCall/TensorArrayV2Stack/TensorListStack':input, 'StatefulPartitionedCall/model/bidirectional_2/backward_lstm_2/PartitionedCall/TensorArrayV2Stack/TensorListStack':input});
    return beamsearch;
  }



  const picRef = useRef();

  const canvasRef = useRef(null);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };
  const getPaths = () => 
    canvasRef.current?.getPaths();
  const getSVG = () => 
    canvasRef.current?.getSvg();
    //console.log(canvasRef.current?.getTimestamps());
  
  //const getData = () => {
  //  console.log(canvasRef.current?.getFeatures());
  //}  

  const [type, onChangeType] = useState("solve");
  const [math, onChangeText] = useState("5x=5");
  const [vari, onChangeVar] = useState("x");
  const [expressionOutput, expOutput] = useState("");
  const [currentTool, onChangeTool] = useState("brush");

  const filterRepeats_Normalize = (points, start_x, min_y, max_y, precision_b=200, first_offstroke_dist=80) => {
    let filtered_points=[];
    for (let i=0;i<points.length;i++) {
      if (i==points.length-1 || points[i][0] != points[i+1][0] || points[i][1] != points[i+1][1]) {
        const y_range=(max_y-min_y == 0 ? 1 : max_y-min_y);
        //console.log(points[i][0]);
        filtered_points.push([(points[i][0]-start_x)*precision_b/y_range+first_offstroke_dist, (points[i][1]-min_y)*precision_b/y_range]);
        //filtered_points.push([(points[i][0]-(start_x-first_offstroke_dist*y_range/precision_b))*precision_b/y_range, (points[i][1]-min_y)*precision_b/y_range])
        //filtered_points.push((np.array(points[i])-np.array([start_x-first_offstroke_dist*y_range/precision_b, min_y]))*precision_b/y_range)
  
      }
    }
    return filtered_points;
  }
  const convert_svg_to_features = (svg) => {
    //console.log(svg);
    let allSegmentData,startPoints,endPoints,prevEnd,prevX,prevY;
    prevEnd=[0,0];
    allSegmentData=[];
    const traces=svg.split("M").slice(1)
    for (let t=0;t<traces.length;t++) {
    //for (let trace of svg.split("M").slice(1)) {
      const trace=traces[t];
      const curves=trace.split("c");
      startPoints=curves[0].split(",");
      const curX=Number(startPoints[0]);
      const curY=Number(startPoints[1]);
      startPoints=[curX,curY];
      prevX = curX;
      prevY = curY;
      if (t==0) {
        allSegmentData.push([80.0, 100-startPoints[1], 0.0, 0.0, 0.0, 0.0, 0]);
        allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
      }
      if (t>0) {
        console.log(prevEnd);
        console.log(startPoints);
        
        allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
        allSegmentData.push([startPoints[0]-prevEnd[0], startPoints[1]-prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0])
        allSegmentData.push([0.0, 0.0, 0.0, 0,0, 0.0, 0.0, 0]);
      }
      for (let curve of curves.slice(1)) {
        let segmentData=[prevX,prevY,0,0,0,0,0,0];
        curve=curve.split(" ");
        for (let i=0;i<curve.length;i++) {
          let coords=curve[i].split(",");
          segmentData[2+i*2]=Number(coords[0])+prevX;
          segmentData[3+i*2]=Number(coords[1])+prevY;
          //coords=[Number(coords[0]),Number(coords[1])];
        }
        const features = [segmentData[6]-segmentData[0], 
                    segmentData[7]-segmentData[1], 
                    Math.sqrt((segmentData[0]-segmentData[2])**2+(segmentData[1]-segmentData[3])**2), 
                    Math.sqrt((segmentData[6]-segmentData[4])**2+(segmentData[7]-segmentData[5])**2), 
                    Math.atan2(segmentData[3]-segmentData[1], segmentData[2]-segmentData[0])-Math.atan2(segmentData[7]-segmentData[1], segmentData[6]-segmentData[0]),
                    Math.atan2(segmentData[5]-segmentData[7], segmentData[4]-segmentData[6])-Math.atan2(segmentData[1]-segmentData[7], segmentData[0]-segmentData[6]), 
                    1];
        allSegmentData.push(features);
        endPoints=[segmentData[6],segmentData[7]];
      }
      prevX=curX;
      prevY=curY;
      
      
      //console.log(allSegmentData);
      prevEnd = endPoints.slice(0);
    }
    allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
    allSegmentData.push([80.0, 100-prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0]);
    allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
    return allSegmentData
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
  return (
    <SafeAreaView /*style={styles.AndroidSafeArea}*/ >
      <Text style={styles.title}>
        Paperless
      </Text>
      <Canvas
        ref={canvasRef}
        height={200}
        width={800}
        thickness={1}
        opacity={1}
        tool={currentTool}
        style = {styles.canvas}
      />
      
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
        <Button title='Solve' onPress={async() => 
        {
          const pointdata=getPaths()[0].data;
          const startX = pointdata[0][0][0];
          let max_y=-1000, min_y=1000;
          for (let i=0;i<pointdata.length;i++){
            const stroke=pointdata[i];
            for (let l=0;l<stroke.length;l++){
              max_y=Math.max(stroke[l][1], max_y);
              min_y=Math.min(stroke[l][1], min_y);
            }
          }
          let wholepath="";
          for (let l=0;l<pointdata.length;l++){
            //console.log(pointdata[l]);
            const points=filterRepeats_Normalize(pointdata[l],startX,min_y,max_y,200);
            const path = simplifySvgPath(points, {precision: 5, tolerance: 15});
            wholepath+=path;
          }
          
          const model_input = tf.expandDims(tf.tensor(convert_svg_to_features(wholepath)));
          //model_input = tf.expandDims(tf.tensor(model_input));
          const input_shape = model_input.length;
          //console.log(model_input);
          const preds=getPreds(model_input);
          console.log(preds);
          //console.log(getPreds(model_input));
        }} />
        {/*<FeatureDataContext.Consumer>
          {value => (
          <Button title='Solve' onPress={() => {predict(value)}} />
          )} 
          </FeatureDataContext.Consumer>*/}
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