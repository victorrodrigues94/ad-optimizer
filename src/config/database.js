import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const maxRetries = 5;
const retryDelay = 5000; // 5 seconds

const connectWithRetry = async (retries = maxRetries) => {
    try {
        const sequelize = new Sequelize({
            dialect: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'ad_optimizer',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            retry: {
                match: [
                    /SequelizeConnectionError/,
                    /SequelizeConnectionRefusedError/,
                    /SequelizeHostNotFoundError/,
                    /SequelizeHostNotReachableError/,
                    /SequelizeInvalidConnectionError/,
                    /SequelizeConnectionTimedOutError/,
                    /TimeoutError/
                ],
                max: 3
            }
        });

        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        return sequelize;
    } catch (error) {
        console.error(`Failed to connect to database (attempt ${maxRetries - retries + 1}/${maxRetries}):`, error.message);
        
        if (retries > 0) {
            console.log(`Retrying in ${retryDelay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return connectWithRetry(retries - 1);
        }
        
        throw error;
    }
};

const sequelize = await connectWithRetry();

export { sequelize }; 