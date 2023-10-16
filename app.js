require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
 const session = require('express-session');

const app = express();

const redis = require('redis');

const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient('rediss://:p536fc1785e20d20d557cffe22a21413d9b099018b88a3805d96f5a793d466567@ec2-52-49-83-27.eu-west-1.compute.amazonaws.com:24130', {
  legacyMode: true,
  tls: {
    rejectUnauthorized: false,
  },
});
redisClient.connect().catch(console.error);

const MAX_AGE = +process.env.MAX_AGE || 999999;

const sessionConfig = {
  name: 'ReactAuthentication',
  store: new RedisStore({ client: redisClient, ttl: MAX_AGE, disableTouch: true }),
  secret: process.env.SESSION_SECRET ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: MAX_AGE * 1000,
    sameSite: 'none',
    httpOnly: false,
    secure: true,
  },
};
app.use(session(sessionConfig));

// const PgSession = require('connect-pg-simple')(session);
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// app.use(session({
//   store: new PgSession({
//     pool,
//     tableName: 'session',
//   }),
//   secret: process.env.SECRET_KEY_SESSION ?? 'Секретное слово',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//     sameSite: 'none',
//     secure: true,
//   },
// }));

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


// const { createProxyMiddleware } = require('http-proxy-middleware');

// const API_SERVICE_URL = 'https://userhub-itransition-db40c4fa7fa7.herokuapp.com/';

// app.use('/api', createProxyMiddleware({
//   target: API_SERVICE_URL,
//   changeOrigin: true,
//   pathRewrite: {
//     '^/api': '',
//   },
// }));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
