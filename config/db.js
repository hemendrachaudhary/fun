const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '12345',
    database : 'funfluential',
    debug    :  false
});
module.exports= pool;