(function () {
  console.log('Loaded client javascript');

  let host = window.location.hostname,
      port = window.location.port;

  let authorizationCode;

  let ws = new WebSocket(`ws://${host}:5672`);

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
      setAuthCode(authorizationCode);
    }
  };

  function setSongInfo(title, artist, artURL) {
    document
      .getElementById('song')
      .textContent = title;
    document
      .getElementById('artist')
      .textContent = artist;
    document
      .getElementById('art')
      .setAttribute('src', artURL);
    document
      .getElementsByClassName('glass')[0]
      .style
      .backgroundImage = `url('${artURL}')`;
  }

  (function fetchAuthCode() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function () {
      if (!this.responseText) {
        // request auth code
        ws.send(JSON.stringify({
          "namespace": "connect",
          "method": "connect",
          "arguments": ["gmrote"]
        }));
      } else {
        console.log(`Reading token as ${this.responseText}`);
        authorizationCode = this.responseText;
      }
    });

    oReq.open("GET", `http://${host}:${port}/token`);
    oReq.send();
  })();

  function setAuthCode(code) {
    console.log(`trying to set auth code ${code}`);
    let oReq = new XMLHttpRequest();
    oReq.open('POST', `http://${host}:${port}/token`, true);
    oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    oReq.send(`token=${code}`);
  }
})();
