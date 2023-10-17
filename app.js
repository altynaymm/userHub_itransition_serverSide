require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors(
    {
      origin: ['https://user-hub-itransition.vercel.app'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      optionsSuccessStatus: 204,
    },
  ),
);

const userRouter = require('./src/routes/user.router');

app.use('/', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
