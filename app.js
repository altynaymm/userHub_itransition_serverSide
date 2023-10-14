require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');

const app = express();

// app.use(
//   cors({
//     origin: ['https://user-hub-itransition-client-side.vercel.app', 'https://user-hub-itransition-client-side.vercel.app/users'],
//     credentials: true,
//     methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
//     optionsSuccessStatus: 204,
//   }),
// );

app.use(cors({
  origin: true,
  credentials: true,
}));


app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const redis = require('redis');
const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient({
  legacyMode: true,
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

(async () => {
  await redisClient.connect();
})();

const MAX_AGE = +process.env.MAX_AGE || 999999;

const sessionConfig = {
  name: 'ReactAuthentication',
  store: new RedisStore({ client: redisClient, ttl: MAX_AGE }),
  secret: process.env.SESSION_SECRET ?? 'Секретное слово',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: MAX_AGE * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  },
};
app.use(session(sessionConfig));

const userRouter = require('./src/routes/user.router');

app.use('/', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
