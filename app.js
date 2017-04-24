var express = require('express')
var request = require('request')
var app = express()

var key = "your-api-key"
var api =  "https://api.embed.rocks/api/"


app.use(express.static('public'))

app.get('/', function (req, res) {
  res.send('app.html')
})

app.get('/api', function (req, res) {
	var url = `${api}?key=${key}&url=${req.query.url}`;
	console.log(`getting ${url}`);
	request.get(url).pipe(res);
})

app.listen(3000, function () {
  console.log('Listening on http://127.0.0.1:3000')
})
