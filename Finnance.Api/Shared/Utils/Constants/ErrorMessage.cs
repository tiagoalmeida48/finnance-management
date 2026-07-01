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
        public const string InvalidRequestBody = "Requisição inválida. Verifique os dados enviados.";
        public const string DatabaseAccessError = "Não foi possível acessar o banco de dados. Tente novamente mais tarde.";
        public const string ErrorLoginErp = "Falha na autenticação com o serviço externo.";
        public const string InvalidAmount = "O valor deve ser maior que zero.";
        public const string InvalidTransactionType = "Tipo de transação inválido.";
        public const string TransactionTypeNotFound = "Tipo de transação não encontrado.";
        public const string InvalidPaymentMethod = "Forma de pagamento inválida.";
        public const string PaymentMethodNotFound = "Forma de pagamento não encontrada.";
        public const string AccountRequiredForCard = "Informe a conta vinculada ao cartão.";
        public const string ToAccountOnlyForTransfer = "Conta de destino só é permitida em transferências.";
        public const string ToAccountRequiredForTransfer = "Informe a conta de destino da transferência.";
        public const string InvalidInstallment = "Número da parcela inválido.";
        public const string AccountNotFound = "Conta não encontrada.";
        public const string CategoryNotFound = "Categoria não encontrada.";
        public const string CardNotFound = "Cartão não encontrado.";
        public const string InvoiceNotFound = "Fatura não encontrada.";
        public const string TransactionNotFound = "Transação não encontrada.";
        public const string StatementCycleNotFound = "Vigência do cartão não encontrada.";
        public const string NoOpenStatementCycle = "Não existe vigência aberta para este cartão.";
        public const string CycleNoRegistered = "Não existe vigência cadastrada para este cartão.";
        public const string CycleStartBeforeFirst = "A data de início não pode ser anterior à primeira vigência.";
        public const string CycleStartNotContained = "Não existe vigência que contenha a data informada.";
        public const string CycleStartMustBeGreater = "A data de início deve ser maior que o início da vigência atual.";
        public const string CycleCannotSplit = "Não foi possível dividir a vigência atual com a data informada.";
        public const string CycleCannotDeleteOnly = "Não é possível excluir a única vigência do cartão.";
        public const string CycleOverlap = "A vigência informada sobrepõe outro período já existente para o cartão.";
        public const string InvalidStatementDay = "O dia de fechamento e de vencimento deve estar entre 1 e 31.";
        public const string SalaryPeriodOverlap = "Já existe um período de salário que se sobrepõe ao informado.";
        public const string SalaryOpenNotFound = "Não existe período de salário em aberto.";
        public const string SalaryPreviousNotFound = "Não existe vigência anterior para restaurar.";
        public const string InvalidGroupType = "Tipo de grupo inválido.";
        public const string TransactionNotInstallment = "A transação não pertence a um grupo de parcelamento.";
        public const string CategoryAlreadyExists = "Já existe uma categoria com este nome para o tipo informado.";
        public const string AccessDeniedResource = "Você não tem acesso a este recurso.";
        public const string SystemConfigNotFound = "Configuração do sistema não encontrada.";
        public const string CardPaymentViaInvoice = "Lançamentos de cartão são pagos pela fatura, não diretamente.";
        public const string UserInactive = "Usuário inativo.";
        public const string InvalidToken = "Token inválido ou expirado.";
        public const string EmailNotVerified = "Confirme seu e-mail antes de entrar.";
    }
}
