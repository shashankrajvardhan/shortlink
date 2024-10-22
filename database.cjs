const { Pool } = require('pg');
const redis = require('redis');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shortlink',
  password: '12345',
  port: '5432',
});

// initialize redis
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// connect redis
(async () => {
  await redisClient.connect();
  console.log('Connerctd to Redis');
})();

const createLoginTable = async() => {
  const query = `
  CREATE TABLE IF NOT EXISTS login (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
  );
`;

try {
  await pool.query(query);
  console.log('Login table created successfully');
} catch (error) {
  console.error('Error creating login table', error);
}
};

const createLogin = async (login) => {
  const {username, password} = login;
  const query = 'INSERT INTO login(username, password) VALUES ($1, $2) RETURNING *';
  const values = [username, password];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating Login:', error);
    throw error;
  }
};

const LoginID = async(id)=>{
  const query = 'SELECT * FROM login WHERE id =$1';
  const values = [id];
  try{
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch(error){
    console.error('Error getting username', error);
    throw error;
  }
};
// Create Urls Table

const createUrlTable = async()=> {
  const query = `
  CREATE TABLE IF NOT EXISTS urls (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   long_url TEXT NOT NULL,
   mobile_url TEXT,
   desktop_url TEXT,
   short_code VARCHAR(10) NOT NULL UNIQUE,
   created_by INTEGER REFERENCES login(id)  ON DELETE SET NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   og_title VARCHAR(255),
   og_description TEXT,
   og_image TEXT,
   user_agent TEXT
   );
 `;

 try {
  await pool.query(query);
  console.log('URLs table created successfully');
 } catch(error){
  console.error('Error creating URLs table:', error);
 }
};

// Click count Table
const createClicksTable = async() => {
  const query = `
  CREATE TABLE IF NOT EXISTS url_clicks (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(8) REFERENCES urls(short_code) ON DELETE CASCADE,
  user_agent TEXT,
  click_date DATE,
  year INT,
  month INT,
  day INT,
  click_count INT DEFAULT 1,
  UNIQUE(short_code, user_agent, year, month, day)
);
`;

  try {
    await pool.query(query);
    console.log('Clicks table created successfully');
  } catch (error) {
    console.error('Error creating Clicks table:', error);
  }
};

const logLinkClick = async (shortCode, userAgent, currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const query = `
  INSERT INTO url_clicks (short_code, user_agent, click_date, year, month, day, click_count)
  VALUES ($1, $2, $3, $4, $5, $6, 1)
  ON CONFLICT (short_code, user_agent, year, month, day)
  DO UPDATE SET click_count = url_clicks.click_count + 1;
  `;
  const values = [shortCode, userAgent, currentDate, year, month, day];
  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging link click:', error);
    throw error;
  }
};

const createUrl = async (name, mobileUrl, desktopUrl, longUrl, shortCode, createdBy, ogTitle, ogDescription, ogImage, userAgent) => {
  const query = `
  INSERT INTO urls (name, mobile_url, desktop_url, long_url, short_code, created_by, og_title, og_description, og_image, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
  `;

  const values = [name, mobileUrl, desktopUrl, longUrl, shortCode, createdBy, ogTitle, ogDescription, ogImage, userAgent];
  console.log('Values being inserted:', values);
  try {
    const result = await pool.query(query, values);
    await redisClient.del(`shortlink:${shortCode}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
};

const getUrlByShortCode = async(shortCode)=> {
  const redisKey = `shortlink:${shortCode}`;
  // Check Redis
  const cachedUrl = await redisClient.get(redisKey);
  if (cachedUrl) {
    console.log('Returning URL from Redis cache');
    return JSON.parse(cachedUrl);
  }
  
  // If not in Redis then...
  const query = `SELECT * FROM urls WHERE short_code = $1`;
  const values = [shortCode];

  try {
    const result = await pool.query(query, values);
    const urlData = result.rows[0];

    //Store values in Redis
    if (urlData) {
      await redisClient.set(redisKey, JSON.stringify(urlData));
    }
    return urlData;
  } catch (error){
    console.error('Error fetching URL by shortcode:', error);
    throw error;
  }
};

const initDatabase = async () => {
  await createLoginTable();
  await createUrlTable();
  await createClicksTable();
};

module.exports = {
  initDatabase,
  createLogin,
  LoginID,
  createUrl,
  logLinkClick,
  getUrlByShortCode
};
