let fs = require('fs');
let express = require('express');
let app = express();

app.use(express.static('.'));

app.get('/token', function (req, res) {
  fs.readFile('token.conf', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(`Reading token as ${data}`);
    return res.send(data);
  });
});

app.post('/token', function (req, res) {
  console.log('-------');
  console.dir(req.params);
  res.end();
});

app.listen(4567, function () {
  console.log('Listening on port 4567');
});
