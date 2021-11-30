const express = require('express');
const app = express();
const port = 3000;

const userRouter = require('./controllers/user');

app.use(express.json());
app.use('/users', userRouter);

app.listen(port, function () {
	console.log('server running💨💨');
});
