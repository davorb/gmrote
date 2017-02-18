(function () {
  console.log('Loaded client javascript');

  let authorizationCode;

  let ws = new WebSocket('ws://192.168.1.2:5672');

  function setPlaybackButton(id, method) {
    return document
      .getElementById(id)
      .onclick = function () {
        ws.send(JSON.stringify({
          "namespace": "playback",
          "method": method
        }));
      };
  }

  setPlaybackButton('pause-btn', 'playPause');
  setPlaybackButton('back-btn', 'rewind');
  setPlaybackButton('forward-btn', 'forward');

  ws.onmessage = function (event) {
    let data = JSON.parse(event.data);

    console.log(data.channel);

    if (data.channel === 'track') {
      let payload = data.payload;

      setSongInfo(payload.title, payload.artist, payload.albumArt);
    } else if (data.channel === 'connect' && data.payload === 'CODE_REQUIRED') {
      if (!authorizationCode) {
        authorizationCode = window.prompt('Please input the authorization code');
      }
      console.dir(data);
      console.log(`Using auth code ${authorizationCode}`);

      if (authorizationCode) {
        ws.send(JSON.stringify({
          "namespace": "connect",
          "method": "connect",
          "arguments": ["gmrote", authorizationCode]
        }));
      }
    } else if (data.channel === 'connect') {
      console.log(`Received permanent code ${data.payload}`);
      authorizationCode = data.payload;
    }
  };

  ws.onopen = function (event) {
    if (!authorizationCode) {
      ws.send(JSON.stringify({
        "namespace": "connect",
        "method": "connect",
        "arguments": ["gmrote"]
      }));
    }
  };

  function setSongInfo (title, artist, artURL) {
    let elemTitle = document.getElementById('song');
    elemTitle.textContent = title;

    let elemArtist = document.getElementById('artist');
    elemArtist.textContent = artist;

    let elemArt = document.getElementById('art');
    art.setAttribute('src', artURL);

    let elemGlass = document.getElementsByClassName('glass')[0];
    elemGlass.style.backgroundImage = "url('"+artURL+"')";
  }
})();
