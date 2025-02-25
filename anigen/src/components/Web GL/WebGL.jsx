import React, { useEffect,useState,Fragment,useRef } from "react";
import axios from "axios";
import MyThreeScene from "../3DRender/MyThreeScene";

const WebGL=() => {

  const canvasRef = useRef(null);
  var [recorder, setRecorder] = useState(null);
  var [data, setData] = useState([]);
  const [filenames, setFilenames] = useState([]);
  const [filename, setFilename] = useState([]);

  const [filenameValue, setFilenameValue] = useState('');

  // useEffect(() => {
  //   const fetchFilenames = async () => {
  //     try {
  //       const email = localStorage.getItem('name');
  //       const response = await axios.get(`http://localhost:4000/TTS/${email}/filenames`);
  //       setFilenames(response.data.filenames);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchFilenames();
  // }, []);


  const handleFilenameChange = (event) => {
    setFilenameValue(event.target.value);
  };


  async function generateVideo() {

    const canvas = document.querySelector("#canvas");
      const stream = canvas.captureStream(60);
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        data.push(event.data);
      };
      recorder.start();
      console.log("recording started");
      await new Promise((resolve) => setTimeout(resolve, 6000));
      recorder.stop();
      const blob = new Blob(data, { type: "video/webm" });
      if (blob.size === 0) {
        alert("No data recorded");
        return;
      }

      console.log(blob)
      console.log("recording stopped");
     

      var url = URL.createObjectURL(blob);
      var video = document.querySelector("video");
      video.src = url;
      var formData = new FormData();
      formData.append("video_file", blob, "input_video.webm");
      const text = document.getElementById("script").value;
      console.log(filenameValue);
      const email=localStorage.getItem("name");
      if(filenameValue=="default"){
      var query = `http://localhost:5000/generateVideo?text=${text}&speaker=VCTK_old_20I-2440@nu.edu.pk&email=${email}`;
    }
    else{
      if(filenameValue!=""){
        var query = `http://localhost:5000/generateVideo?text=${text}&voicename=${filenameValue}&email=${email}`;
      }
      else{

        return;
      }
    }
      let response = await axios.post(query, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType:"blob"
      });
      console.log(response);
      if (response.data.type !== "video/mp4") {
        console.error("Response is not a video file");
        return;
      }
      url = URL.createObjectURL(response.data);
      video.src = url;
  }

  

  return (
    <Fragment>

      <div className="d-flex justify-content-center">
        <div className="row">
          <div className="col-md-8">
            <textarea id="script" placeholder="Enter Script" className="form-control mb-3" style={{height:"10vh",marginTop:"2vh"}}></textarea>
		<select
        className="form-select"
        style={{ width: "27vh", height: "5vh", margin:"0 0 1vh 0" }}
        value={filenameValue}
        onChange={handleFilenameChange}
      >
        <option value="">Select a voicename</option>
        {filenames.map((filename, index) => (
          <option key={index} value={filename}>
            {filename}
          </option>
        ))}
      </select>
          </div>
          <div className="col-md-4">
            <button onClick={generateVideo} className="btn btn-primary btn-lg" style={{height:"10vh",marginTop:"2vh"}}>Generate Video</button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef}></canvas>
      <MyThreeScene canvasRef={canvasRef}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin:"0 0 2vh 0"  }}>
      <video id="video" width="42%" height="42%" controls style={{display:"block", margin:"0 auto"}}></video>
    </div>
    </Fragment>
  );

}

export default WebGL
