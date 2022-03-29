import * as mysql from "mysql2/promise";

const { DB_NAME, DB_HOST, DB_USERNAME, DB_PASSWORD } = process.env;

export default class DB {
    protected db_name: string;
    protected db_host: string;
    protected db_username: string;
    protected db_password: string;
    protected db_port: number;

    constructor(dbName?: string) {
        this.db_name = dbName ?? String(DB_NAME);
        this.db_host = String(DB_HOST);
        this.db_username = String(DB_USERNAME);
        this.db_password = String(DB_PASSWORD);
        this.db_port = 3306;
    }

    public getConnection = () => {
        const pool = this.createConnectionPool();
        return pool.getConnection();
    };

    private createConnectionPool = () => {
        return mysql.createPool({
            host: this.db_host,
            user: this.db_username,
            database: this.db_name,
            port: this.db_port,
            password: this.db_password,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0,
        });
    };
}
