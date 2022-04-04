import React, { useState, useEffect, useRef } from "react";

import * as tf from '@tensorflow/tfjs';

const CATEGORIES = {
  0: "Malignant",
  1: "Benign"
};

function App() {

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  const imageRef = useRef();
  const textInputRef = useRef();
  const fileInputRef = useRef();


  const loadModel = async () => {
    setIsModelLoading(true);
    try {
      // const model = await mobilenet.load();

      const model = await tf.loadLayersModel(" https://skin-cancer-backend.herokuapp.com/modeljs/model.json");
      setModel(model);
      setIsModelLoading(false);
    }
    catch (error) {
      console.log(error);
      setIsModelLoading(false);
    }
  };


  const uploadImage = (e) => {
    const { files } = e.target
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  };

  // const identify = async () => {
  //   textInputRef.current.value = "";
  //   const results = await model.classify(imageRef.current);
  //   setResults(results);
  // };

  const identify = async () => {
    const image = tf.browser.fromPixels(imageRef.current);



    const tensor = image.resizeNearestNeighbor([240, 240]).toFloat().expandDims()




    let prediction = await model.predict(tensor).data();

    let pred_array = Array.from(prediction).map(function (p, i) {
      return {
        probability: p,
        className: CATEGORIES[i]
      }
    }).sort(function (a, b) {
      return b.probability - a.probability;
    })



    setResults(pred_array);
  }


  const handleOnChange = (e) => {
    setImageUrl(e.target.value);

    setResults([]);
  };

  const triggerUpload = () => {
    setResults([]);
    fileInputRef.current.click();
  }

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (imageUrl) {
      const uniqueUrls = [...new Set([imageUrl, ...history])]

      setHistory(uniqueUrls);
    }
  }, [imageUrl]);

  if (isModelLoading) {
    return <h2>Model Loading...</h2>
  };


  return (
    <div className="App">
      <h1 className='header'>Skin Cancer Identification</h1>
      <div className='inputHolder'>
        <input type='file' accept='image/*' capture='camera' onChange={uploadImage} ref={fileInputRef} className="uploadInput" />
        <button className="uploadImage" onClick={triggerUpload}>Upload Image</button>
        {/* <span className="or">OR</span> */}
        {/* <input type="text" placeholder="Paste Image URL here" ref={textInputRef} onChange={handleOnChange} /> */}
      </div>

      <div className="mainWrapper">
        <div className="mainContent">
          <div className="imageHolder">
            {imageUrl && <img src={imageUrl} alt="Upload Preview" ref={imageRef} />}
          </div>

          {
            results.length > 0 &&
            <div className='resultsHolder'>
              {results.map((result, index) => {
                return (
                  <div className='result' key={result.className}>
                    <span className='name'>{result.className}</span>
                    <span className='confidence'>
                      Confidence level: {(result.probability * 100).toFixed(2)}% {index === 0 &&
                        <span className='bestGuess'>Best Guess</span>
                      }</span>
                  </div>
                )
              })}
            </div>}
        </div>
        {imageUrl && <button className='button' onClick={identify}>Identify Image</button>}
      </div>

      {history.length > 0 &&
        <div className="recentPredictions">
          <h2>Recent Images</h2>
          <div className="recentImages">
            {
              history.map((image, index) => (
                <div className="recentPrediction" key={`${image}${index}`}>
                  <img src={image} alt="Recent Prediction" onClick={() => { setResults([]); setImageUrl(image) }} />
                </div>
              ))
            }
          </div>
        </div>
      }


    </div>
  );
}

export default App;
