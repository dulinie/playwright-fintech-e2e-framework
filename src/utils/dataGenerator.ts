import { randomUUID } from 'crypto';

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
}

export function generateUniqueCustomer(): CustomerProfile {
  // Takes the first 8 characters of a cryptographically unique ID (e.g., qa_lead_a1b2c3d4)
  const uniqueId = randomUUID().split('-')[0];
  
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    address: '100 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '415-555-0199',
    ssn: '123-45-6789',
    username: `qa_lead_${uniqueId}`,
  };
}
