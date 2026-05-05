// 🎤 Start Listening
async function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  await startVisualizer(); // real mic waveform

  recognition.start();

  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;

    addMessage(text, "user");

    const reply = await getAIResponse(text);

    addMessage(reply, "ai");
  };
}


// 🤖 API CALL
async function getAIResponse(message) {
  const res = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  if (data.audio) speak(data.audio);

  return data.reply || "No response";
}


// 💬 Add Message
function addMessage(text, sender) {
  const chat = document.getElementById("output");

  const msg = document.createElement("div");
  msg.className = sender;
  chat.appendChild(msg);

  if (sender === "ai") {
    typeText(msg, text);
  } else {
    msg.innerText = text;
  }

  chat.scrollTop = chat.scrollHeight;
}


// ✍️ Typing Effect
function typeText(el, text, speed = 20) {
  let i = 0;
  function type() {
    if (i < text.length) {
      el.innerText += text[i++];
      setTimeout(type, speed);
    }
  }
  type();
}


// 🎧 MIC VISUALIZER
let analyser, dataArray;

async function startVisualizer() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 64;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  animateWave();
}

function animateWave() {
  requestAnimationFrame(animateWave);

  analyser.getByteFrequencyData(dataArray);

  const bars = document.querySelectorAll(".waveform span");

  bars.forEach((bar, i) => {
    bar.style.height = (dataArray[i] / 2) + "px";
  });
}


// 🔊 AI VOICE VISUALIZER
function speak(audioBase64) {
  const audio = new Audio("data:audio/mpeg;base64," + audioBase64);

  const context = new AudioContext();
  const src = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 64;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animate() {
    requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);

    const bars = document.querySelectorAll(".waveform span");

    bars.forEach((bar, i) => {
      bar.style.height = (dataArray[i] / 2) + "px";
    });
  }

  animate();
  audio.play();
}