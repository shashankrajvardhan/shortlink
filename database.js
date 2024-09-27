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

const initDatabase = async () => {
  await createLoginTable();
};

module.exports = {
  initDatabase,
  createLogin,
  LoginID,
};
