require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);


const { createProxyMiddleware } = require('http-proxy-middleware');

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
    origin: 'https://user-hub-itransition-client-side-dfov-3dg75kfmi.vercel.app',
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    optionsSuccessStatus: 204,
  }),
);

app.use(
  '/api',
  createProxyMiddleware({
    target: ' https://userhub-itransition-db40c4fa7fa7.herokuapp.com/api',
    changeOrigin: true,
    pathRewrite: {
      '^api': '',
    },
  }),
);

const userRouter = require('./src/routes/user.router');

app.use('/api', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
