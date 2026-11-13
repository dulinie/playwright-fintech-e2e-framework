import * as dotenv from 'dotenv';
dotenv.config();

export const EnvConfig = {
  baseUrl: process.env.BASE_URL || 'https://parabank.parasoft.com/parabank/index.htm',
  defaultPassword: process.env.DEFAULT_PASSWORD || 'SecurePassword123!',
};
