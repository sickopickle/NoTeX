import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';
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
import { UndoIcon } from './src/assets/undo_icon';
import { ClearIcon } from './src/assets/clear_icon';
import { EqualsIcon } from './src/assets/solve_icon';
import { EraserIcon } from './src/assets/eraser_icon';
import { PencilIcon } from './src/assets/pencil_icon';
import {
  deviceWidth,
  responsiveHeight,
  responsiveWidth,
} from './src/utils/ScalingUtils';
import { BLACK, WHITE } from './src/consts/colors';
//import * as ctc from '@nanopore/fast-ctc-decode';

const parse_latex = (symbols, relations) => {
  let utf = 0;
  let open_brackets = 0;
  let latex_string = symbols[0];
  for (let i = 0; i < relations.length; i++) {
    let s = symbols[i + 1];
    const full_rel = relations[i];
    let split_rel = full_rel.split('-');
    let add_symbol = true;
    for (let rel of split_rel) {
      if (
        rel == 'DFS' ||
        rel == 'UFS' ||
        rel == 'OFI' ||
        rel == 'UFD' ||
        rel == 'UFL' ||
        rel == 'DFL'
      ) {
        latex_string += '}';
        open_brackets -= 1;
      }
      if (rel == 'NTB') {
        add_symbol = false;
        if (utf) {
          latex_string += '}{';
          utf -= 1;
        } else {
          latex_string = '\\frac{' + latex_string + '}{';
          open_brackets += 1;
        }
      }
      if (rel == 'UTF') {
        latex_string += '\\frac{' + s;
        open_brackets += 1;
        utf += 1;
        add_symbol = false;
      }
      if (rel == 'Sub' || rel == 'LB' || rel == 'DTI') {
        latex_string += '_{';
        open_brackets += 1;
      }
      if (rel == 'Sup') {
        latex_string += '^{';
        open_brackets += 1;
      }
      if (rel == 'Inside') {
        latex_string += '{';
        open_brackets += 1;
      }
      if (rel == 'STS') {
        latex_string += '}_{';
      }
      if (rel == 'ITL') {
        latex_string += '}^{';
      }
      if (rel == 'Radical') {
        latex_string += '[';
      }
      if (rel == 'RTI') {
        latex_string += ']{';
        open_brackets += 1;
      }
    }
    if (add_symbol) {
      latex_string += s;
    }
  }
  latex_string += '}'.repeat(open_brackets);
  //latex_string+=("}")*open_brackets
  return latex_string;
}; 
const convert_sequence = (sequence) => {
  return [
    sequence.filter((element, index) => {
      return index % 2 === 0 && index != 0 && index != sequence.length - 1;
    }),
    sequence.filter((element, index) => {
      return index % 2 === 1;
    }),
  ];
};
const get_latex = (sequence) => {
  const converted_sequence = convert_sequence(sequence);
  console.log(converted_sequence);
  return parse_latex(converted_sequence[1], converted_sequence[0]);
};

export default function App() {
  const [result, setResult] = useState('Ans');
  const [model, setModel] = useState('');
  const [sequence, setSequence] = useState([]);
  useEffect(() => {
    async function loadModel() {
      console.log('[+] Application started');
      //Wait for tensorflow module to be ready
      const tfReady = await tf.ready();
      console.log('[+] Loading model...');
      const modelJson = await require('./assets/model/model.json');
      const modelWeight = await require('./assets/model/group1-shard1of1.bin');
      const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeight)
      );
      console.log('[+] Loading pre-trained face detection model');
      setModel(model);
      console.log('[+] Model Loaded');
    }
    loadModel();
  }, []);
  const getPreds = async (input) => {
    const result = await model.predict(input).data();
    const vocab = {
      0: 'Right',
      1: 'Sub',
      2: 'Sup',
      3: 'Inside',
      4: 'UTF',
      5: 'NTB',
      6: 'BTD',
      7: 'UFD',
      8: 'DFS',
      9: 'UFS',
      10: 'OFI',
      11: 'DFS-NTB',
      12: 'LB',
      13: 'UFL',
      14: 'STS',
      15: 'DTI',
      16: 'ITL',
      17: 'DFL',
      18: 'UFS-NTB',
      19: 'DFS-UFD',
      20: 'UFS-UFD',
      21: 'DFS-DFS',
      22: 'OFI-NTB',
      23: 'OFI-UFD',
      24: 'DFS-OFI',
      25: 'OFI-OFI',
      26: 'UFD-DFS',
      27: 'Sup-UTF',
      28: 'UFS-UTF',
      29: 'UFL-UTF',
      30: 'Inside-UTF',
      31: 'UFD-OFI',
      32: 'DFS-OFI-UFD',
      33: 'NTB-UTF',
      34: 'UFS-UFS',
      35: 'DFL-UTF',
      36: 'UFD-UFD',
      37: 'UFS-OFI',
      38: 'UFS-DFS',
      39: 'Radical',
      40: 'RTI',
      41: 'RTI-UTF',
      42: 'Radical-UTF',
      43: '!',
      44: '(',
      45: ')',
      46: '+',
      47: '-',
      48: 'frac',
      49: '.',
      50: '/',
      51: '0',
      52: '1',
      53: '2',
      54: '3',
      55: '4',
      56: '5',
      57: '6',
      58: '7',
      59: '8',
      60: '9',
      61: '<',
      62: '=',
      63: '>',
      64: 'A',
      65: 'B',
      66: 'C',
      67: 'COMMA',
      68: 'E',
      69: 'F',
      70: 'G',
      71: 'H',
      72: 'I',
      73: 'L',
      74: 'M',
      75: 'N',
      76: 'P',
      77: 'R',
      78: 'S',
      79: 'T',
      80: 'V',
      81: 'X',
      82: 'Y',
      83: '[',
      84: '\\Delta',
      85: '\\alpha',
      86: '\\beta',
      87: '\\cos',
      88: '\\div',
      89: '\\exists',
      90: '\\forall',
      91: '\\gamma',
      92: '\\geq',
      93: '\\gt',
      94: '\\in',
      95: '\\infty',
      96: '\\int',
      97: '\\lambda',
      98: '\\ldots',
      99: '\\leq',
      100: '\\lim',
      101: '\\log',
      102: '\\lt',
      103: '\\mu',
      104: '\\neq',
      105: '\\phi',
      106: '\\pi',
      107: '\\pm',
      108: '\\prime',
      109: '\\rightarrow',
      110: '\\sigma',
      111: '\\sin',
      112: '\\sqrt',
      113: '\\sum',
      114: '\\tan',
      115: '\\theta',
      116: '\\times',
      117: '\\{',
      118: '\\}',
      119: ']',
      120: 'a',
      121: 'b',
      122: 'c',
      123: 'd',
      124: 'e',
      125: 'f',
      126: 'g',
      127: 'h',
      128: 'i',
      129: 'j',
      130: 'k',
      131: 'l',
      132: 'm',
      133: 'n',
      134: 'o',
      135: 'p',
      136: 'q',
      137: 'r',
      138: 's',
      139: 't',
      140: 'u',
      141: 'v',
      142: 'w',
      143: 'x',
      144: 'y',
      145: 'z',
      146: '|',
      147: 'EOS',
    };
    const output=Array(result)[0];
    
    let max_prob=0;
    let prev_idx = -1;
    let sequence = [];
    let symbol_idx = 0;
    for (let i = 0; i < result.length; i++) {
      if (i % 149 == 0 && i > 0) {
        max_prob = 0;
        if (symbol_idx != prev_idx && symbol_idx != 148) {
          sequence.push(vocab[symbol_idx]);
        }
        prev_idx = symbol_idx;
      }
      if (output[i] > max_prob) {
        symbol_idx = i % 149;
        max_prob = output[i];
      }
    }
    setSequence(sequence);
  };

  const picRef = useRef();

  const canvasRef = useRef(null);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };
  const getPaths = () => canvasRef.current?.getPaths();
  const getSVG = () => canvasRef.current?.getSvg();
  //console.log(canvasRef.current?.getTimestamps());

  //const getData = () => {
  //  console.log(canvasRef.current?.getFeatures());
  //}

  const [type, onChangeType] = useState('solve');
  const [math, onChangeText] = useState('5x=5');
  const [vari, onChangeVar] = useState('x');
  const [expressionOutput, expOutput] = useState('');
  const [currentTool, onChangeTool] = useState('brush');
  const [selectedBtn, setSelectedBtn] = useState('brush');

  const actionButtons = [
    {
      label: 'undo',
      icon: () => (
        <UndoIcon height={responsiveWidth(8)} width={responsiveWidth(8)} />
      ),
      onPress: () => handleUndo(),
      isSelected: false,
    },
    {
      label: 'clear',
      icon: () => (
        <ClearIcon height={responsiveWidth(8)} width={responsiveWidth(8)} />
      ),
      onPress: () => handleClear(),
      isSelected: false,
    },
    {
      label: 'equals',
      icon: () => (
        <EqualsIcon height={responsiveWidth(8)} width={responsiveWidth(8)} />
      ),
      onPress: () => onPressSolveEquation(),
      isSelected: false,
    },
    {
      label: 'eraser',
      icon: () => (
        <EraserIcon height={responsiveWidth(8)} width={responsiveWidth(8)} />
      ),
      onPress: () => {
        onChangeTool('eraser');
        setSelectedBtn('eraser');
      },
      isSelected: selectedBtn === 'eraser',
    },
    {
      label: 'brush',
      icon: () => (
        <PencilIcon height={responsiveWidth(8)} width={responsiveWidth(8)} />
      ),
      onPress: () => {
        onChangeTool('brush');
        setSelectedBtn('brush');
      },
      isSelected: selectedBtn === 'brush',
    },
  ];

  const onPressSolveEquation = async () => {
    if (getPaths().length) {
      const pointdata = getPaths()[0].data;
      const startX = pointdata[0][0][0];
      let max_y = -1000,
        min_y = 1000;
      for (let i = 0; i < pointdata.length; i++) {
        const stroke = pointdata[i];
        for (let l = 0; l < stroke.length; l++) {
          max_y = Math.max(stroke[l][1], max_y);
          min_y = Math.min(stroke[l][1], min_y);
        }
      }
      let wholepath = '';
      for (let l = 0; l < pointdata.length; l++) {
        //console.log(pointdata[l]);
        const points = filterRepeats_Normalize(
          pointdata[l],
          startX,
          min_y,
          max_y,
          200
        );
        const path = simplifySvgPath(points, {
          precision: 5,
          tolerance: 15,
        });
        wholepath += path;
      }

      const model_input = tf.expandDims(
        tf.tensor(convert_svg_to_features(wholepath))
      );
      const input_shape = model_input.length;
      //console.log(model_input);
      getPreds(model_input);
      console.log('s', sequence);
      console.log('latex', get_latex(sequence));
    } else {
      console.log('Empty canvas.');
    }
  };

  const filterRepeats_Normalize = (
    points,
    start_x,
    min_y,
    max_y,
    precision_b = 200,
    first_offstroke_dist = 80
  ) => {
    let filtered_points = [];
    for (let i = 0; i < points.length; i++) {
      if (
        i == points.length - 1 ||
        points[i][0] != points[i + 1][0] ||
        points[i][1] != points[i + 1][1]
      ) {
        const y_range = max_y - min_y == 0 ? 1 : max_y - min_y;
        //console.log(points[i][0]);
        filtered_points.push([
          ((points[i][0] - start_x) * precision_b) / y_range +
            first_offstroke_dist,
          ((points[i][1] - min_y) * precision_b) / y_range,
        ]);
        //filtered_points.push([(points[i][0]-(start_x-first_offstroke_dist*y_range/precision_b))*precision_b/y_range, (points[i][1]-min_y)*precision_b/y_range])
        //filtered_points.push((np.array(points[i])-np.array([start_x-first_offstroke_dist*y_range/precision_b, min_y]))*precision_b/y_range)
      }
    }
    return filtered_points;
  };
  const convert_svg_to_features = (svg) => {
    //console.log(svg);
    let allSegmentData, startPoints, endPoints, prevEnd, prevX, prevY;
    prevEnd = [0, 0];
    allSegmentData = [];
    const traces = svg.split('M').slice(1);
    for (let t = 0; t < traces.length; t++) {
      //for (let trace of svg.split("M").slice(1)) {
      const trace = traces[t];
      const curves = trace.split('c');
      startPoints = curves[0].split(',');
      const curX = Number(startPoints[0]);
      const curY = Number(startPoints[1]);
      startPoints = [curX, curY];
      prevX = curX;
      prevY = curY;
      if (t == 0) {
        allSegmentData.push([
          80.0,
          100 - startPoints[1],
          0.0,
          0.0,
          0.0,
          0.0,
          0,
        ]);
        allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
      }
      if (t > 0) {
        allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
        allSegmentData.push([startPoints[0]-prevEnd[0], startPoints[1]-prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0]);
        allSegmentData.push([0, 0, 0, 0, 0, 0, 0]);
      }
      for (let curve of curves.slice(1)) {
        let segmentData=[prevX,prevY,0,0,0,0,0];
        curve=curve.split(" ");
        for (let i=0;i<curve.length;i++) {
          let coords=curve[i].split(",");
          segmentData[2+i*2]=Number(coords[0])+prevX;
          segmentData[3+i*2]=Number(coords[1])+prevY;
        }
        const features = [
          segmentData[6] - segmentData[0],
          segmentData[7] - segmentData[1],
          Math.sqrt(
            (segmentData[0] - segmentData[2]) ** 2 +
              (segmentData[1] - segmentData[3]) ** 2
          ),
          Math.sqrt(
            (segmentData[6] - segmentData[4]) ** 2 +
              (segmentData[7] - segmentData[5]) ** 2
          ),
          Math.atan2(
            segmentData[3] - segmentData[1],
            segmentData[2] - segmentData[0]
          ) -
            Math.atan2(
              segmentData[7] - segmentData[1],
              segmentData[6] - segmentData[0]
            ),
          Math.atan2(
            segmentData[5] - segmentData[7],
            segmentData[4] - segmentData[6]
          ) -
            Math.atan2(
              segmentData[1] - segmentData[7],
              segmentData[0] - segmentData[6]
            ),
          1,
        ];
        allSegmentData.push(features);
        endPoints = [segmentData[6], segmentData[7]];
      }
      prevX = curX;
      prevY = curY;

      prevEnd = endPoints.slice(0);
    }
    allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
    allSegmentData.push([80.0, 100 - prevEnd[1], 0.0, 0.0, 0.0, 0.0, 0]);
    allSegmentData.push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]);
    return allSegmentData;
  };
  const solve = () => {
    let eq;
    try {
      eq = nerdamer(type + '(' + math + ',' + vari + ')').toTeX();
    } catch (err) {
      eq = 'invalid';
    }
    expOutput('$' + eq + '$');
  };
  const toolTitle = (current) => {
    if (current == 'brush') {
      return 'Eraser';
    } else {
      return 'Brush';
    }
  };
  return (
    <SafeAreaView style={styles.parentContainer}>
      <Text style={styles.title}>Paperless</Text>
      <Canvas
        ref={canvasRef}
        height={responsiveHeight(25)}
        width={deviceWidth - responsiveWidth(10)}
        thickness={1}
        opacity={1}
        tool={currentTool}
        style={styles.canvas}
      />

      <View style={styles.buttonContainer}>
        {actionButtons.map((action, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                action.onPress();
              }}
              style={styles.btn(action?.isSelected)}
            >
              {action.icon()}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.divider} />
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
      <MathJax html={`Answer{ ${expressionOutput}`} />
      <Text>{result}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(4),
  },
  canvas: {
    alignItems: 'center',
    justifyContent: 'space-around',
    //borderColor: 'black',
    //borderWidth: 2,
    // marginHorizontal: responsiveWidth(2),
    marginVertical: responsiveHeight(1),
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  input: {
    borderColor: BLACK,
  },
  text: {
    borderColor: BLACK,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    width: '100%',
  },
  camera: {
    borderColor: BLACK,
    height: 700,
    alignItems: 'center',
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1,
  },
  btn: (isSelected) => ({
    backgroundColor: WHITE,
    paddingVertical: responsiveHeight(1),
    borderWidth: isSelected ? 1 : 0,
    borderColor: BLACK,
    paddingHorizontal: responsiveWidth(2),
  }),
  divider: {
    height: 1,
    width: '100%',
    borderBottomColor: BLACK,
    borderBottomWidth: 1,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
  },
});
