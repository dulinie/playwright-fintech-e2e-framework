export interface PayeeDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  accountNumber: string;
}

export const UTILITY_PAYEE: PayeeDetails = {
  name: 'Pacific Gas & Electric',
  address: '77 Beale Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  phone: '415-973-1000',
  accountNumber: '9876543210',
};

export const BILL_PAYMENT_AMOUNT = '75.00';
