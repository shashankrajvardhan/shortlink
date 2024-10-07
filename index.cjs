const express = require('express');
const cookieParser = require('cookie-parser');
const { initDatabase, createLogin, LoginID, logLinkClick} = require('./database.cjs');
const urlRoutes = require('./urlRoutes.cjs');
const redirectRoutes = require('./redirectRoutes.cjs');
const authenticateToken = require('./authMiddleware.cjs');
const jwt = require("jsonwebtoken");

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(cookieParser('cookie:'))
const JWT_SECRET = "secretkeyappearshere";

initDatabase().then(() => {
    console.log('Database initialized');
  }).catch((error) => {
    console.error('Failed to initialize database:', error);
  });

  app.post('/signup', async (req, res) => {
    try {
      const login = req.body;
      const validatedLogin = validateLogin(login);
      const newLogin = await createLogin(validatedLogin);
  
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newLogin.id,
          username: newLogin.username
        },
        JWT_SECRET,
        {
          expiresIn: '15m'
        }
      );
      console.log('Generated Token:', token);
      const cookie ={
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        signed: true
      }
      res.cookie('username', newLogin.username, cookie);
      res.setHeader('Username', newLogin.username);  
      res.status(201).json({
        success: true,
        data: {
          id: newLogin.id,
          username: newLogin.username,
          token: token
        }
      });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ error: 'Failed to sign up' });
    }
  });

app.get('/signup', (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  LoginID(id).then((login) => {
      if (!login) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(login);
      }
    }).catch((error) => {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    });
});

app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

function validateLogin(login) {
  const validFields = ['username', 'password'];
  const filteredLogin = Object.fromEntries(
    Object.entries(login).filter(([key]) => validFields.includes(key))
  );

  if (!filteredLogin.username || !filteredLogin.password) {
    throw new Error('Username and password are required');
  }
  return filteredLogin;
}
app.use(authenticateToken);
app.use('/url',urlRoutes);
app.use('/',redirectRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
