let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let play_symbol = document.getElementById('play-symbol');
let autoplay = true;
let song_info = document.getElementById('song-info');
let music_progress = document.getElementById('music-progress');
let mouse_on_slider = false;
let play_button = document.getElementById('play-button');
let next_button = document.getElementById('next-button');
let back_button = document.getElementById('back-button');

let sample_songs = [
  'Coastal Fever',
  'Anthem of the Night Dwellers', 
  'Duality',
  'sense',
  'Drei',
  'isotopes',
  'Mall',
  'Mgtow',
  'Recurring Dream',
  'Somwhwere',
  'TempleOfTime',
  'mysterchristmaslightsndsong',
  'Station X Infected Final2',
  'TheNextWay',
  'TheLivingSea'
];

let song_names = [
  'Coastal Fever',
  'Anthem of the Night Dwellers',
  'Duality',
  'Sense',
  'Drei',
  'Isotopes',
  'Mall (Remix)',
  'Going your Own Way',
  'Recurring Dream',
  'Somewhere',
  'Courage through Time (Zelda Oot Remix)',
  'Winter Warmth',
  'Station X Infected',
  'The Next Way',
  'The Living Sea'
]
let song_index = 0;

song_info.innerHTML = `${song_names[song_index]} - JayMythos`;

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let radius = document.body.clientWidth <= 425 ? 120 : 160;
let steps = document.body.clientWidth <= 425 ? 60 : 120;
let interval = 360 / steps;
let pointsUp = [];
let pointsDown = [];
let running = false;
let pCircle = 2 * Math.PI * radius;
let angleExtra = 90;

// Create points
for(let angle = 0; angle < 360; angle += interval) {
  let distUp = 1.1;
  let distDown = 0.9;

  pointsUp.push({
    angle: angle + angleExtra,
    x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
    y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
    dist: distUp
  });

  pointsDown.push({
    angle: angle + angleExtra + 5,
    x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
    y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
    dist: distDown
  });
}

// -------------
// Audio stuff
// -------------

// make a Web Audio Context
let audio_set = false;
let context = null;
let splitter = null;
let analyserL = null;
let analyserR = null;

// Make a buffer to receive the audio data
let bufferLengthL = null;
let audioDataArrayL = null;

let bufferLengthR = null;
let audioDataArrayR = null;
let audio = new Audio();

function setAudio() {
  // make a Web Audio Context
  context = new AudioContext();
  splitter = context.createChannelSplitter();

  analyserL = context.createAnalyser();
  analyserL.fftSize = 8192;

  analyserR = context.createAnalyser();
  analyserR.fftSize = 8192;

  splitter.connect(analyserL, 0, 0);
  splitter.connect(analyserR, 1, 0);

  // Make a buffer to receive the audio data
  bufferLengthL = analyserL.frequencyBinCount;
  audioDataArrayL = new Uint8Array(bufferLengthL);

  bufferLengthR = analyserR.frequencyBinCount;
  audioDataArrayR = new Uint8Array(bufferLengthR);
}

function loadAudio(song_name) {
  audio.loop = false;
  audio.autoplay = false;
  audio.crossOrigin = "anonymous";

  // call `handleCanplay` when it music can be played
  audio.addEventListener('canplay', handleCanplay);
  audio.src = `/audio/music/${song_name}.mp3`;
  audio.load();
  running = true;
}

function handleCanplay() {
  // connect the audio element to the analyser node and the analyser node
  // to the main Web Audio context
  const source = context.createMediaElementSource(audio);
  source.connect(splitter);
  splitter.connect(context.destination);
}

function toggleAudio() {
  if(!audio_set) {
    setAudio();
    audio_set = true;
  }
  if (running === false) {
    loadAudio(sample_songs[song_index]);
    //document.querySelector('.call-to-action').remove();
  }

  if (audio.paused) {
    play_symbol.setAttribute('class', 'pause-lines');
    audio.play();
  } else {
    play_symbol.setAttribute('class', 'play-triangle');
    audio.pause();
  }
}
play_button.addEventListener('click', toggleAudio);

function loadSong(song_name)
{
  song_info.innerHTML = `${song_names[song_index]} - JayMythos`;
  audio.src = `/audio/music/${song_name}.mp3`;
  audio.load();
}

function nextSong()
{
  song_index++;
  if(song_index === sample_songs.length) {
    song_index = 0;
  }
  loadSong(sample_songs[song_index]);
  toggleAudio();
}

next_button.addEventListener('click', nextSong);

function lastSong()
{
  song_index--;
  if(song_index < 0) {
    song_index = sample_songs.length - 1;
  }
  loadSong(sample_songs[song_index]);
  toggleAudio();
}

back_button.addEventListener('click', lastSong);

//canvas.addEventListener('click', toggleAudio);

document.body.addEventListener('touchend', function(ev) {
  context.resume();
});

audio.addEventListener('ended', function(){
  if(autoplay) {
    nextSong();
  }
  else {
    play_symbol.setAttribute('class', 'play-triangle');
  }

});

// Progress bar for music
audio.addEventListener('loadeddata', function() {
  music_progress.value = 0;
});

audio.addEventListener('timeupdate', function() {
  if (!mouse_on_slider) {
    music_progress.value = audio.currentTime / audio.duration * 100;
    let fillColor = "#d0a342";
    let emptyColor = "#DDDDDD";
    let percent = (100 * (music_progress.value - music_progress.min)) / (music_progress.max - music_progress.min) + "%";
    //  this.setAttribute('value', this.value);
    //  this.setAttribute('title', this.value);
    music_progress.style.backgroundImage = `linear-gradient( to right, ${fillColor}, ${fillColor} ${percent}, ${emptyColor} ${percent})`;
  }
});


music_progress.addEventListener("change", () => {
  const pct = music_progress.value / 100;
  audio.currentTime = (audio.duration || 0) * pct;
});

music_progress.addEventListener("mousedown", () => {
  mouse_on_slider = true;
});

music_progress.addEventListener("mouseup", () => {
  mouse_on_slider = false;
});



// -------------
// Canvas stuff
// -------------

function drawLine(points) {
  let origin = points[0];

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255)';
  ctx.lineJoin = 'round';
  ctx.moveTo(origin.x, origin.y);

  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.lineTo(origin.x, origin.y);
  ctx.stroke();
}

function connectPoints(pointsA, pointsB) {
  for (let i = 0; i < pointsA.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255)';
    ctx.moveTo(pointsA[i].x, pointsA[i].y);
    ctx.lineTo(pointsB[i].x, pointsB[i].y);
    ctx.stroke();
  }
}

function update(dt) {
  let audioIndex, audioValue;

  // get the current audio data
  analyserL.getByteFrequencyData(audioDataArrayL);
  analyserR.getByteFrequencyData(audioDataArrayR);

  for (let i = 0; i < pointsUp.length; i++) {
    audioIndex = Math.ceil(pointsUp[i].angle * (bufferLengthL / (pCircle * 2))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayL[audioIndex] / 255;

    pointsUp[i].dist = 1.1 + audioValue * 0.8;
    pointsUp[i].x = centerX + radius * Math.cos(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;
    pointsUp[i].y = centerY + radius * Math.sin(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;

    audioIndex = Math.ceil(pointsDown[i].angle * (bufferLengthR / (pCircle * 2))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayR[audioIndex] / 255;

    pointsDown[i].dist = 0.9 + audioValue * 0.2;
    pointsDown[i].x = centerX + radius * Math.cos(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
    pointsDown[i].y = centerY + radius * Math.sin(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
  }
}

function draw(dt) {
  requestAnimationFrame(draw);

  if (running) {
    update(dt);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLine(pointsUp);
  drawLine(pointsDown);
  connectPoints(pointsUp, pointsDown);
}

function createPoints() {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  radius = document.body.clientWidth <= 425 ? 120 : 160;
  steps = document.body.clientWidth <= 425 ? 60 : 120;
  interval = 360 / steps;
  pointsUp = [];
  pointsDown = [];
  pCircle = 2 * Math.PI * radius;
  angleExtra = 90;
  
  // Create points
  for(let angle = 0; angle < 360; angle += interval) {
    let distUp = 1.1;
    let distDown = 0.9;
  
    pointsUp.push({
      angle: angle + angleExtra,
      x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
      y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
      dist: distUp
    });
  
    pointsDown.push({
      angle: angle + angleExtra + 5,
      x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
      y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
      dist: distDown
    });
  }
  
}

function onResize() {
  createPoints();

};


window.addEventListener('resize', onResize);
draw();