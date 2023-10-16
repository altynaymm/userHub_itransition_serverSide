require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');

const app = express();

const { createClient } = require('redis');

const RedisStore = require('connect-redis').default;

const redisClient = createClient({
  legacyMode: false,
  url: process.env.REDIS_URL,
  tls: {
    rejectUnauthorized: false,
  },
});
redisClient.connect().catch(console.error);

const MAX_AGE = +process.env.MAX_AGE || 999999;

const sessionConfig = {
  name: 'ReactAuthentication',
  store: new RedisStore({ client: redisClient, ttl: MAX_AGE }),
  secret: process.env.SESSION_SECRET ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: MAX_AGE * 1000,
    sameSite: 'none',
    httpOnly: false,
    secure: false,
  },
};
app.use(session(sessionConfig));

app.use(
  cors(
    {
      origin: 'https://user-hub-itransition.vercel.app',
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      optionsSuccessStatus: 204,
    },
  ),
);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRouter = require('./src/routes/user.router');

app.use('/', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
