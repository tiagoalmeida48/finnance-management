export const normalizeRpcError = (error: unknown) => {
    if (typeof error === 'object' && error && 'message' in error) {
        const message = (error as { message?: string }).message ?? '';
        if (message.toLowerCase().includes('could not find the function')) {
            return 'Função RPC de administração não encontrada no Supabase. Crie as funções admin_list_users/admin_create_user/admin_update_user/admin_update_user_password/admin_delete_user.';
        }
        return message || 'Não foi possível executar a operação.';
    }
    return 'Não foi possível executar a operação.';
};
