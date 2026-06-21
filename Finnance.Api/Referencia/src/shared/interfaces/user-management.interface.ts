export interface ManagedUser {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at?: string | null;
}
