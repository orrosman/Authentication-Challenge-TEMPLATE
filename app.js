const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.get('/', (req, res) => {
	res.send('test server');
});

app.listen(port, function () {
	console.log('server running💨💨');
});
