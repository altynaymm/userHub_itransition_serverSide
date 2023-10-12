/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionConfig = {
  name: 'ReactAuthentication',
  store: new FileStore(),
  secret: process.env.SESSION_SECRET ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 9999999,
    httpOnly: true,
  },
};

app.use(session(sessionConfig));

app.use(
  cors({
    origin: ['https://user-hub-itransition-client.vercel.app/'],
    credentials: true,
  }),
);

const path = require('path')

app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});


const userRouter = require('./src/routes/user.router');

app.use('/', userRouter);

const { PORT } = process.env || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
