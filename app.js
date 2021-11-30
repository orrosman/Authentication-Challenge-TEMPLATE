const express = require('express');
const app = express();

const userRouter = require('./controllers/user');

app.use(express.json());
app.use('/', userRouter);

module.exports = app;
