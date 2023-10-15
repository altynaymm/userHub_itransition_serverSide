require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');

const app = express();

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// const Redis = require('ioredis');
// const RedisStore = require('connect-redis').default;

// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// redisClient.on("error", (err) => {
//   console.error("Ошибка в Redis", err);
// });

// const MAX_AGE = +process.env.MAX_AGE || 999999;

// const sessionConfig = {
//   name: 'ReactAuthentication',
//   store: new RedisStore({ client: redisClient, ttl: MAX_AGE }),
//   secret: process.env.SESSION_SECRET ?? 'Секретное слово',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: MAX_AGE * 1000,
//     httpOnly: true,
//     sameSite: 'none',
//     secure: true,
//   },
// };
// app.use(session(sessionConfig));

const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'Session',
  }),
  secret: process.env.SECRET_KEY_SESSION ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  },
}));

const { createProxyMiddleware } = require('http-proxy-middleware');

const API_SERVICE_URL = 'https://userhub-itransition-db40c4fa7fa7.herokuapp.com/';

app.use('/api', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

app.use(
  cors({
    origin: ['https://user-hub-itransition-client-side.vercel.app', 'https://user-hub-itransition-client-side.vercel.app/users'],
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    optionsSuccessStatus: 204,
  }),
);


const userRouter = require('./src/routes/user.router');

app.use('/api', userRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
