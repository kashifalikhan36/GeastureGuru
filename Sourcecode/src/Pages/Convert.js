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
  const [pause, setPause] = useState(100);

  const componentRef = useRef({});
  const { current: ref } = componentRef;

  let textFromInput = React.createRef();

  useEffect(() => {
    ref.flag = false;
    ref.pending = false;
    ref.animations = [];
    ref.characters = [];

    ref.scene = new THREE.Scene();
    ref.scene.background = "white";

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);

    ref.renderer = new THREE.WebGLRenderer({ antialias: true });
    ref.camera = new THREE.PerspectiveCamera(
      30,
      (window.innerWidth * 0.57) / (window.innerHeight - 70),
      0.1,
      1000
    );
    ref.renderer.setSize(window.innerWidth * 0.57, window.innerHeight - 70);

    document.getElementById("canvas").innerHTML = "";
    document.getElementById("canvas").appendChild(ref.renderer.domElement);

    ref.camera.position.z = 1.6;
    ref.camera.position.y = 1.4;

    let loader = new GLTFLoader();
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
        console.log(xhr);
      }
    );
  }, [ref, bot]);

  ref.animate = () => {
    if (ref.animations.length === 0) {
      ref.pending = false;
      return;
    }
    requestAnimationFrame(ref.animate);
    if (ref.animations[0].length) {
      if (!ref.flag) {
        if (ref.animations[0][0] === "add-text") {
          setText(text + ref.animations[0][1]);
          ref.animations.shift();
        } else {
          for (let i = 0; i < ref.animations[0].length; ) {
            let [boneName, action, axis, limit, sign] = ref.animations[0][i];
            if (
              sign === "+" &&
              ref.avatar.getObjectByName(boneName)[action][axis] < limit
            ) {
              ref.avatar.getObjectByName(boneName)[action][axis] += speed;
              ref.avatar.getObjectByName(boneName)[action][axis] = Math.min(
                ref.avatar.getObjectByName(boneName)[action][axis],
                limit
              );
              i++;
            } else if (
              sign === "-" &&
              ref.avatar.getObjectByName(boneName)[action][axis] > limit
            ) {
              ref.avatar.getObjectByName(boneName)[action][axis] -= speed;
              ref.avatar.getObjectByName(boneName)[action][axis] = Math.max(
                ref.avatar.getObjectByName(boneName)[action][axis],
                limit
              );
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

  const sign = (inputRef) => {
    var STR = `SO LETS GET STARTED UH SO ILL BE TALKING ABOUT BUILDING LLMS TODAY UM SO I THINK A LOT OF YOU HAVE HEARD OF LLMS BEFORE UH BUT JUST AS A QUICK RECAP UH LLMS STANDING FOR LARGE LANGUAGE MODELS ARE BASICALLY ALL THE CHAT BOTS UH THAT YOUVE BEEN HEARING ABOUT RECENTLY SO UH CHAD GPT FROM OPEN AI CLAUDE FROM ANTHROPIC GEMINI AND AND MANY OTHER TYPES OF MODELS LIKE THIS AND TODAY WELL BE TALKING ABOUT HOW THEY ACTUALLY WORK SO ITS GOING TO BE AN OVERVIEW BECAUSE ITS ONLY ONE LECTURE AND ITS HARD TO COMPRESS EVERYTHING BUT HOPEFULLY ILL TOUCH A LITTLE BIT ABOUT ALL THE COMPONENTS THAT ARE NEEDED TO TRAIN UH SOME OF THESE LLMS UH ALSO IF YOU HAVE QUESTIONS PLEASE INTERRUPT ME AND ASK UH IF YOU HAVE A QUESTION MOST LIKELY OTHER PEOPLE IN THE ROOM OR ON ZOOM HAVE THE SAME QUESTION SO PLEASE ASK UM GREAT SO WHAT MATTERS WHEN TRAINING LLMS UM SO THERE ARE A FEW KEY COMPONENTS THAT MATTER UH ONE IS THE ARCHITECTURE SO AS YOU PROBABLY ALL KNOW LLMS ARE NEURAL NETWORKS AND WHEN YOU THINK ABOUT NEURAL`;
    var strWords = STR.split(" ");
    setText("");
    for (let word of strWords) {
      if (words[word]) {
        ref.animations.push(["add-text", word + " "]);
        words[word](ref);
      } else {
        for (const [index, ch] of word.split("").entries()) {
          if (index === word.length - 1)
            ref.animations.push(["add-text", ch + " "]);
          else ref.animations.push(["add-text", ch]);
          alphabets[ch](ref);
        }
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3">
          <button
            onClick={() => {
              sign(textFromInput);
            }}
            className="btn btn-primary w-100 btn-style btn-start"
          >
            Start Animations
          </button>
        </div>
        <div className="col-md-7">
          <div id="canvas" />
        </div>
        <div className="col-md-2"></div>
      </div>
    </div>
  );
}

export default Convert;
