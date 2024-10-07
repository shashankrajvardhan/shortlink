const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shortlink',
  password: '12345',
  port: '5432',
});

const createLoginTable = async() => {
  const query = `
  CREATE TABLE IF NOT EXISTS login (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
  )
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

const createUrl = async (name, longUrl, shortCode, createdBy, ogTitle, ogDescription, ogImage, userAgent) => {
  const query = `
  INSERT INTO urls (name, long_url, short_code, created_by, og_title, og_description, og_image, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
  `;

  const values = [name, longUrl, shortCode, createdBy, ogTitle, ogDescription, ogImage, userAgent];
  console.log('Values being inserted:', values);
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
};

const getUrlByShortCode = async(shortCode)=> {
  const query = `SELECT * FROM urls WHERE short_code = $1`;
  const values = [shortCode];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error){
    console.error('Error fetching URL by shortcode:', error);
    throw error;
  }
};

const initDatabase = async () => {
  await createLoginTable();
  await createUrlTable();
};

module.exports = {
  initDatabase,
  createLogin,
  LoginID,
  createUrl,
  getUrlByShortCode
};
