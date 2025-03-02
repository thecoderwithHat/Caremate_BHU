import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import getUser from './utils/login.js';
import prisma from "./utils/database.js";
import {hashPassword} from "./utils/tools.js";

const app = express();

app.use(cors({
  origin: '*',
  allowOptionsSuccessStatus: 200,
}));

app.use((req, res, next) => {
  console.log('[LOG]', req.method, req.url);
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Move the authorization middleware after the routes that don't need auth
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        password: hashPassword(password)
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        token
      }
    });
    return res.json({ success: true, data: { token, role: user.role } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if ([email, password, name, role].some(v => !v)) {
      return res.sendStatus(400);
    }

    if (["patient", "doctor", "hospital"].indexOf(role) === -1) {
      return res.sendStatus(400);
    }

    const token = jwt.sign({ email: email.toLowerCase() }, process.env.JWT_SECRET);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashPassword(password),
        name,
        role,
        token,
      }
    });
    return res.json({
      success: true,
      message: 'Signup successful.',
      data: {
        name: user.name,
        role: user.role,
        email: user.email,
        token
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.use(async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ success: false, message: 'No authorization header' });
  }

  const token = req.headers.authorization.split(' ')[1];
  req.user = null;

  if (token) {
    req.user = await getUser(token);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
  next();
});

// Protected routes go here

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
  });
}

export default app;