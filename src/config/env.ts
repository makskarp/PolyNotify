import dotenv from 'dotenv';

dotenv.config();

interface Config {
    DATABASE_URL: string;
    BOT_TOKEN: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const config: Config = {
    DATABASE_URL: getEnv('DATABASE_URL'),
    BOT_TOKEN: getEnv('BOT_TOKEN'),
    NODE_ENV: (process.env.NODE_ENV as Config['NODE_ENV']) || 'development',
};
