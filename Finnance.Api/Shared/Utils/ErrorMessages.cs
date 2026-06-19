namespace Finnance.Api.Shared.Utils;

public static class ErrorMessages
{
    private static readonly Dictionary<GeneralErrorNumber, string> PtBr = new()
    {
        [GeneralErrorNumber.REQUIRED_FIELD] = "Campo obrigatório não informado.",
        [GeneralErrorNumber.EMPTY_PASSWORD] = "Senha é obrigatória.",
        [GeneralErrorNumber.NUMBER_MIN_CHARACTERS_PASSWORD] = "A senha deve ter ao menos 6 caracteres.",
        [GeneralErrorNumber.FIELD_ALREADY_EXISTS] = "E-mail já existe.",
        [GeneralErrorNumber.USER_NOT_FOUND] = "Usuário não encontrado.",
        [GeneralErrorNumber.USER_INVALID_PASSWORD] = "E-mail ou senha inválidos.",
        [GeneralErrorNumber.ERROR_AUTHORIZATION] = "Acesso negado.",
        [GeneralErrorNumber.ERROR_ACCESS] = "Acesso negado.",
        [GeneralErrorNumber.EXPIRED_TOKEN] = "Sessão expirada. Faça login novamente.",
    };

    public static string TranslatedMessage(this BusinessError err)
    {
        // Mensagem custom (BusinessError(string)) tem ErrorNumber == NONE e Message proprio.
        if (err.ErrorNumber == GeneralErrorNumber.NONE && !string.IsNullOrEmpty(err.Message))
            return err.Message;

        return PtBr.TryGetValue(err.ErrorNumber, out var msg) ? msg : err.Message;
    }
}
