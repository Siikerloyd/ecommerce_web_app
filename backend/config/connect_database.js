//database connect
require('dotenv').config();
const { Pool } = require('pg');
//create the pool
const pool = new Pool();
//then expot the pool
module.exports = pool;