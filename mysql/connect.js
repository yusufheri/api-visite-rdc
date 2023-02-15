import mysql from 'mysql';

const DBConnection = () => {
    const connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        multipleStatements: true
    });

    connection.connect((error) => {
        if (error) throw error;
        console.log('Connect to MySQL Server !');
    })
}

export default DBConnection;
