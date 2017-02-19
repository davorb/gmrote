let fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

let tokenFileName = 'token.conf';

app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/token', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  fs.readFile(tokenFileName, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(`Reading token as ${data}`);
    return res.send(data);
  });
});

app.post('/token', function (req, res) {
  let token = req.body.token;
  if (token) {
    fs.writeFile(tokenFileName, token, err => {
      return console.log(err);
    });
    console.log(`Saved token ${token}`);
  }
  res.end();
});

app.listen(4567, function () {
  console.log('Listening on port 4567');
});
