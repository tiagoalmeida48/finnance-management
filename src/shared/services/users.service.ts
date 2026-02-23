import { supabase } from "@/lib/supabase/client";
import type { ManagedUser } from "@/shared/interfaces/user-management.interface";
import { normalizeRpcError } from "@/shared/utils/rpcErrors";

export const usersService = {
  async listUsers(): Promise<ManagedUser[]> {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) throw new Error(normalizeRpcError(error));
    return (data ?? []) as ManagedUser[];
  },

  async createUser(
    email: string,
    password?: string,
    fullName?: string | null,
    isAdmin?: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_create_user", {
      p_email: email,
      p_password: password || "",
      p_full_name: fullName || null,
      p_is_admin: isAdmin || false,
    });
    if (error) throw new Error(normalizeRpcError(error));
  },

  async updateUser(
    userId: string,
    email: string,
    fullName?: string | null,
    isAdmin?: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_update_user", {
      p_user_id: userId,
      p_email: email,
      p_full_name: fullName || null,
      p_is_admin: isAdmin || false,
    });
    if (error) throw new Error(normalizeRpcError(error));
  },

  async updatePassword(userId: string, password?: string): Promise<void> {
    const { error } = await supabase.rpc("admin_update_user_password", {
      p_user_id: userId,
      p_password: password || "",
    });
    if (error) throw new Error(normalizeRpcError(error));
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.rpc("admin_delete_user", {
      p_user_id: userId,
    });
    if (error) throw new Error(normalizeRpcError(error));
  },
};
