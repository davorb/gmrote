(function () {
  console.log('Loaded client javascript');

  let authorizationCode;

  let ws = new WebSocket('ws://localhost:5672');

  (function () {
    let pauseButton = document.getElementById('pause-btn');
    pauseButton.onclick = function () {
      ws.send(JSON.stringify({
        "namespace": "playback",
        "method": "playPause"
      }));
      console.log('clicked pause');
    };

    let backButton = document.getElementById('back-btn');
    backButton.onclick = function () {

    };

    let forwardButton = document.getElementById('forward-btn');
    forwardButton.onclick = function () {

    };
  })();

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
