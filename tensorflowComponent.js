import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

/*const predictTensorflow = async (uri) => {
    await tf.setBackend('rn-webgl');
    await tf.ready();
    const model = await mobilenet.load();

    // Get a reference to the bundled asset and convert it to a tensor
    const image = require('./assets/icon.png');
    const imageAssetPath = Image.resolveAssetSource(image);
    console.log(imageAssetPath.uri);
    const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
    
    //const response = await fetch(uri, {}, { isBinary: true });
    console.log(response);
    const imageData = await response.arrayBuffer();
    //const imageData = await uri.arrayBuffer();
    console.log(imageData);

    const imageTensor = decodeJpeg(imageData);

    const prediction = await model.classify(imageTensor);

    console.log(imageTensor);

    // Use prediction in app.
    setState({
    prediction,
    });
}*/




/*const predictTensorflow = async (uri) => {
    
}*/

//export default predictTensorflow;