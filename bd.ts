import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Connected to PostgresSQL'))
  .catch((err) => console.error('Connexion with PostgresSQL error:', err));

export default sequelize;
