require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();

const userRouter = require('./src/routes/user.router');

app.use(
  cors({
    origin: 'https://user-hub-itransition-client-side.vercel.app',
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    optionsSuccessStatus: 204,
  }),
);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const fileStoreOptions = {
  path: process.env.SESSION_PATH || './sessions',
};
const MAX_AGE = +process.env.MAX_AGE || 999999

const sessionConfig = {
  name: 'ReactAuthentication',
  store: new FileStore(fileStoreOptions),
  secret: process.env.SESSION_SECRET ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: MAX_AGE,
    httpOnly: false,
    sameSite: 'none',
  },
};

app.use(session(sessionConfig));

app.use('/', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
