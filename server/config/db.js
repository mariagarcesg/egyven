const mysql = require('mysql2');
require('dotenv').config();

// Crear el pool de conexiones usando las variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

// Probar la conexión al iniciar
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos de EGYVEN:', err.message);
    } else {
        console.log('Conexión exitosa a MySQL (egyven_bd)');
        connection.release();
    }
});

module.exports = promisePool;