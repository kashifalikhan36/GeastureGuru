import "../App.css";
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";

import ybot from "../Models/ybot/ybot.glb";

import * as words from "../Animations/words";
import * as alphabets from "../Animations/alphabets";
import { defaultPose } from "../Animations/defaultPose";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Convert() {
  const [text, setText] = useState("");
  const [bot, setBot] = useState(ybot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);

  const componentRef = useRef({});
  const { current: ref } = componentRef;

  let textFromInput = React.createRef();

  useEffect(() => {
    // Initialize the scene, camera, and renderer
    ref.scene = new THREE.Scene();
    ref.scene.background = new THREE.Color(0xdddddd);

    ref.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    ref.renderer = new THREE.WebGLRenderer({ antialias: true });
    ref.renderer.setSize(window.innerWidth, window.innerHeight - 70);

    // Append the renderer to the DOM
    document.getElementById("canvas").innerHTML = ""; // Clear existing content
    document.getElementById("canvas").appendChild(ref.renderer.domElement);

    // Add lights to the scene
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);

    // Load the 3D model
    const loader = new GLTFLoader();
    loader.load(
      bot,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.type === "SkinnedMesh") {
            child.frustumCulled = false;
          }
        });
        ref.avatar = gltf.scene;
        ref.scene.add(ref.avatar);
        defaultPose(ref);
      },
      (xhr) => {
        console.log("Loading model:", (xhr.loaded / xhr.total) * 100, "%");
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Handle window resizing
    const handleResize = () => {
      const canvasParent = document.getElementById("canvas");
      const width = canvasParent.offsetWidth;
      const height = canvasParent.offsetHeight;

      // Update camera aspect ratio and projection matrix
      ref.camera.aspect = width / height;
      ref.camera.updateProjectionMatrix();

      // Resize the renderer
      ref.renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [bot]);

  // Animation loop
  ref.animate = () => {
    if (ref.animations.length === 0) {
      ref.pending = false;
      return;
    }
    requestAnimationFrame(ref.animate);
    if (ref.animations[0].length) {
      if (!ref.flag) {
        if (ref.animations[0][0] === "add-text") {
          setText((prevText) => prevText + ref.animations[0][1]);
          ref.animations.shift();
        } else {
          for (let i = 0; i < ref.animations[0].length; ) {
            let [boneName, action, axis, limit, sign] = ref.animations[0][i];
            const bone = ref.avatar.getObjectByName(boneName);
            if (sign === "+" && bone[action][axis] < limit) {
              bone[action][axis] += speed;
              bone[action][axis] = Math.min(bone[action][axis], limit);
              i++;
            } else if (sign === "-" && bone[action][axis] > limit) {
              bone[action][axis] -= speed;
              bone[action][axis] = Math.max(bone[action][axis], limit);
              i++;
            } else {
              ref.animations[0].splice(i, 1);
            }
          }
        }
      }
    } else {
      ref.flag = true;
      setTimeout(() => {
        ref.flag = false;
      }, pause);
      ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  };

  // Function to trigger text animations
  const sign = (inputRef) => {
    const str = inputRef.current.value.toUpperCase();
    const strWords = str.split(" ");
    setText("");

    for (let word of strWords) {
      if (words[word]) {
        ref.animations.push(["add-text", word + " "]);
        words[word](ref);
      } else {
        for (const [index, ch] of word.split("").entries()) {
          if (index === word.length - 1) {
            ref.animations.push(["add-text", ch + " "]);
          } else {
            ref.animations.push(["add-text", ch]);
          }
          alphabets[ch](ref);
        }
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3">
          <label className="label-style">Text Input</label>
          <textarea
            rows={3}
            ref={textFromInput}
            placeholder="Type here..."
            className="w-100 input-style"
          />
          <button
            onClick={() => {
              sign(textFromInput);
            }}
            className="btn btn-primary w-100 btn-style btn-start"
          >
            Start Animations
          </button>
          <label className="label-style mt-4">Animation Speed</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-100 input-style"
          />
          <label className="label-style mt-4">Pause Time (ms)</label>
          <input
            type="number"
            value={pause}
            onChange={(e) => setPause(parseInt(e.target.value))}
            className="w-100 input-style"
          />
        </div>
        <div className="col-md-7">
          <div id="canvas" />
        </div>
      </div>
    </div>
  );
}

export default Convert;
