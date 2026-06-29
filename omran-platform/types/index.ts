export type Role = "user" | "admin";

export type ProjectStatus = "pending" | "approved" | "rejected";

export type ClientStatus = "pending" | "approved" | "rejected";

export type PackagePrice = 125 | 250 | 350;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  details: string;
  status: ProjectStatus;
  project_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Client {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string;
  package_price: PackagePrice;
  status: ClientStatus;
  payment_status: "pending" | "paid" | "verified";
  receipt_url: string | null;
  stripe_session_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  related_type: "project" | "client" | "chat" | null;
  related_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    role: Role;
  };
}

export interface PackageOption {
  price: PackagePrice;
  label: string;
  features: string[];
}
