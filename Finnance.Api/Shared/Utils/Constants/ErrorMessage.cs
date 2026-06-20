namespace Finnance.Api.Shared.Utils;

public static partial class Constants
{
    public class ErrorMessage
    {
        public const string RequiredField = "Campo obrigatório não informado.";
        public const string EmptyPassword = "Senha é obrigatória.";
        public const string NumberMinCharactersPassword = "A senha deve ter ao menos 6 caracteres.";
        public const string FieldAlreadyExists = "E-mail já existe.";
        public const string UserNotFound = "Usuário não encontrado.";
        public const string UserInvalidPassword = "E-mail ou senha inválidos.";
        public const string RegisterNotFound = "Registro não encontrado.";
        public const string CannotDeleteSelf = "Você não pode excluir seu próprio usuário.";
        public const string CannotSpecialCharacterInField = "O campo não pode conter caracteres especiais.";
        public const string PendingRegistrationAnotherTable = "Existe um registro vinculado em outra tabela que impede esta operação.";
        public const string ErrorAuthorization = "Acesso negado.";
        public const string ErrorAccess = "Acesso negado.";
        public const string ExpiredToken = "Sessão expirada. Faça login novamente.";
        public const string ErrorNotExpected = "Ocorreu um erro inesperado. Tente novamente mais tarde.";
        public const string DatabaseAccessError = "Não foi possível acessar o banco de dados. Tente novamente mais tarde.";
        public const string ErrorLoginErp = "Falha na autenticação com o serviço externo.";
    }
}
