export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}