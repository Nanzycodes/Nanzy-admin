export type PayoutStatus = "PAID" | "FAILED" | "PENDING";

export interface Payout {
  id: string;
  name: string;
  user_id: string;
  amount: number;
  payment_method: string;
  requested_on: string;
  status: PayoutStatus;
  account_number: string;
  account_name: string;
  bank_name: string;
  role: "seller" | "influencer" | "delivery_partner";
}
