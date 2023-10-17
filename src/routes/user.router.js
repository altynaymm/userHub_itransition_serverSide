/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const userRouter = express.Router();
const { User } = require('../../db/models');

userRouter.get('/check-user', (req, res) => {
  const token = req.headers.authorization;
  const parts = token.split('Bearer ');
  const jwtToken = parts[1];
  console.log(jwtToken);

  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  jwt.verify(jwtToken, 'YOUR_SECRET_KEY', async (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to authenticate token.' });
    }

    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  });
});

userRouter.post('/sign-up', async (req, res) => {
  try {
    const {
      email, password, firstName, lastName,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      lastLoginDate: new Date(),
    });
    const user = await User.findOne({ where: { email } });

    const token = jwt.sign({ userId: user.id, email: user.email }, 'YOUR_SECRET_KEY', {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({ error: 'This email is already registered.' });
    } else {
      res.status(500).send({
        error: 'Registration failed. Please, enter valid email address.',
      });
    }
  }
});

userRouter.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;
 
  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      if (user.status === 'blocked') {
        return res.json({ error: 'User is blocked' });
      }

      const checkPass = await bcrypt.compare(password, user.password);

      if (checkPass) {
        user.lastLoginDate = new Date();
        await user.save();
        const token = jwt.sign({ userId: user.id, email: user.email }, 'YOUR_SECRET_KEY', {
          expiresIn: '1h',
        });
        res.json({ token, user });
      } else {
        res.json({ error: 'Wrong password' });
      }
    } else {
      res.json({ error: 'User does not exist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Oops, something went wrong' });
  }
});

userRouter.get('/users', async (req, res) => {
  try {
    const usersList = await User.findAll();
    res.json(usersList);
  } catch (error) {
    res.status(500).json({ error: 'Cannot get users list' });
  }
});

userRouter.delete('/delete-user', async (req, res) => {
  const userIds = req.body.usersId;
  try {
    await User.destroy({
      where: {
        id: userIds,
      },
    });

    res.json(userIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

userRouter.patch('/block-user', async (req, res) => {
  const userIds = req.body.usersId;
  try {
    await User.update(
      {
        status: 'blocked',
      },
      {
        where: {
          id: {
            [Op.in]: userIds,
          },
        },
      },
    );

    res.json(userIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update users status' });
  }
});

userRouter.patch('/unblock-user', async (req, res) => {
  const userIds = req.body.usersId;
  try {
    await User.update(
      {
        status: 'active',
      },
      {
        where: {
          id: {
            [Op.in]: userIds,
          },
        },
      },
    );

    res.json(userIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update users status' });
  }
});

module.exports = userRouter;
