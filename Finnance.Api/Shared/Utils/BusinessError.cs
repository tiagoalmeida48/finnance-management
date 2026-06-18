namespace Finnance.Api.Shared.Utils;

public class BusinessError : Exception
{
    public BusinessError()
    {
    }
    public BusinessError(string message) : base(message)
    {
    }

    public BusinessError(string message, Exception innerException) : base(message, innerException)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber) : this(errorNumber, (FieldName[])null)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, long idLog) : this(errorNumber, null, idLog: idLog)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, string language) : this(errorNumber, null, language)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, string msgParam, string language = null) : this(errorNumber, null, language, msgParam: msgParam)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, FieldName fieldName, string language = null) : this(
        errorNumber, [fieldName], language)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, string[] msgParam) : this(errorNumber, null, null, null, msgParam)
    {
    }

    public BusinessError(GeneralErrorNumber errorNumber, FieldName[] fieldName, string language = null,
                         long? idLog = null, params string[] msgParam) : base(errorNumber.ToString())
    {
        ErrorNumber = errorNumber;
        Field = fieldName;
        Language = language;
        Log = idLog;
        MsgParam = msgParam;
    }

    public GeneralErrorNumber ErrorNumber { get; private set; }
    public FieldName[] Field { get; private set; }
    public string Language { get; set; }
    public long? Log { get; set; }
    public string[] MsgParam { get; set; }
}

public enum GeneralErrorNumber
{
    NONE = 0,
    USER_INVALID_PASSWORD = 1,
    USER_NOT_FOUND = 2,
    USER_INACTIVE = 3,
    USER_INVALID_INACTIVE = 4,
    NONE_CONFIG_EMAIL_REGISTERED = 5,
    NONE_MODEL_EMAIL_FOUND = 6,
    ERROR_SEND_EMAIL = 7,
    NUMBER_MAX_CHARACTERS = 8,
    ATTACHMENT_NOT_FOUND = 9,
    REQUIRED_FIELD = 10,
    REGISTER_NOT_FOUND = 11,
    FIELD_ALREADY_EXISTS = 12,
    AD_MANAGED_USER = 13,
    USER_NOT_FOUND_PARAMETER = 14,
    MULTIPLE_USERS_FOUND = 15,
    USER_INACTIVE_OR_NOT_FOUND = 16,
    CHANGE_ERROR = 17,
    EMPTY_PASSWORD = 18,
    LIMIT_UPLOAD_FILE = 19,
    ORDERING_COLUMN_NOT_FOUND = 20,
    COLUMN_NOT_FOUND = 21,
    OPERATOR_NOT_FOUND = 22,
    OPERATOR_LINK_NOT_FOUND = 23,
    ORDERING_FACTOR_NOT_FOUND = 24,
    INVALID_FIELD = 25,
    PENDING_REGISTRATION_ANOTHER_TABLE = 26,
    DIRECTORY_NOT_FOUND = 27,
    ERROR_NOT_EXPECTED = 28,
    MENU_CANNOT_BE_REGISTERED = 29,
    START_DATE_LESS_THAN_CURRENT = 30,
    START_FIELD_END_FIELD = 31,
    EXTENSION_INCOMPATIBLE_WITH_TYPE_ATTACHMENT = 32,
    FILE_MODIFIED = 33,
    NO_RESPONSE_MAIL_SERVER = 34,
    ASYNC_TASK_IN_PROGRESS = 35,

    GENERIC_ERROR = 36,
    CANNOT_SPECIAL_CHARACTER_IN_FIELD = 37,

    // = 38,
    ERROR_LOGIN_ERP = 39,
    ERROR_ERP = 40,

    // = 41,
    INVALID_SECRET_KEY = 42,

    // = 43,
    NUMBER_MIN_CHARACTERS_PASSWORD = 44,
    NUMBER_MAX_CHARACTERS_PASSWORD = 45,
    PASSWORD_ALPHANUMERIC = 46,
    PASSWORD_UPPERCASE = 47,
    PASSWORD_LOWERCASE = 48,
    WEAK_PASSWORD = 49,
    USER_BLOCKED_FOR_MINUTES = 50,
    CODE_MFA_INVALID = 51,
    ERROR_AUTHORIZATION = 52,
    ERROR_AUTHORIZATION_FIELD = 53,

    EXPIRED_TOKEN = 401,
    ERROR_ACCESS = 403,
    INTERNAL_ERROR = 500,
    DATABASE_ACCESS_ERROR = 600,
    INVALID_TOKEN = 998,
    EMPTY_TOKEN = 999
}

public enum FieldName
{
    NONE = 0,

    BODY_CONFIG_MODEL_EMAIL = 1,
    CONFIG_EMAIL_MODEL_PARAMS = 2,
    CITY_NAME = 3,
    SECURITY_POLICY = 4,
    COD_CATEGORY = 5,
    COD_CITY = 6,
    ID = 7,
    COD_CONFIG_EMAIL = 8,
    COD_CONFIG_MODEL_EMAIL = 9,
    COD_STATE = 10,
    COD_STATE_COUNTRY = 11,
    COD_GROUP = 12,
    PREFIX = 13,
    COD_MENU_CATEGORY = 14,
    COD_FIELD = 15,
    COD_IDIOM = 16,
    COD_LOG_CATEGORY = 17,
    COD_MESSAGE = 18,
    COD_MENU = 19,
    FOLDER = 20,
    COD_COUNTRY = 21,
    ICON = 22,
    COD_PROP_FIELD = 23,
    COD_USER = 24,
    ASYNC_TASK = 25,
    SUFFIX = 26,
    DATE_END = 27,
    DATE_START = 28,
    DESC_CATEGORY_MENU = 29,
    DESC_COUNTRY = 30,
    DESC_GROUP = 31,
    DESC_LOG_CATEGORY = 32,
    DESC_MENU = 33,
    GUID = 34,
    PORT = 35,
    EMAIL = 36,
    FIELD_NAME = 37,
    FIELD_SIZE = 38,
    GENERAL_MESSAGE = 39,
    GROUP_NAME = 40,
    COD_ACTIVITY = 41,
    LASTNAME = 42,
    LOGIN = 43,
    REGISTRY = 44,
    VALUE_OBJECT_AUTHORIZATION = 45,
    NAME = 46,
    COD_MENU_OBJECT = 47,
    PASSWORD = 48,
    SERVER = 49,
    STATE_NAME = 50,
    COD_NOTIFICATION = 51,
    DESC_SECURITY_POLICY = 52,
    PATH = 53,
    PHOTO_USER = 54,
    SUBJECT_CONFIG_MODEL_EMAIL = 55,
    USER = 56,
    DEFAULT_GROUP = 57,
    COD_SCHEDULER_CONFIG = 58,
    PLATFORM = 59,
    SECRET_KEY = 60,
    NUMBER_MIN_CHARACTER = 61,
    NUMBER_MAX_CHARACTER = 62,
    LOGIN_NUMBER_ATTEMPT = 63,
    LOGIN_LOCK_MIN = 64,
    RATE_LIMIT_MIN = 65,
    RATE_LIMIT_QUANTITY = 66,
    COD_OBJECT = 67,
    COD_OBJECT_FIELD = 68,
    COD_AUTH = 69,
    REF_TABLE = 70,
    STATUS = 71,
    COLOR = 72,
    DESC_STATUS = 73,
    COD_TEMPLATE = 74,
    TITLE = 75,
    MESSAGE = 76,
    COD_ATTACHMENT_CLASSIFICATION = 77,
    DESC_ATTACHMENT_CLASSIFICATION = 78,
    COD_ATTACH_CONFIG = 79,
    COD_ATTACH_TYPE = 80,
    COD_ATTACHMENT_CONFIG = 81,
    ALLOWED_EXTENSIONS = 82,
    DESC_ATTACHMENT_TYPE = 83,
    COD_ITEM_GUID = 84,
    COD_ATTACHMENT = 85,
    FULL_NAME_PATH_AND_FILE = 86,
    FILE_NAME = 87,
    DESC_FILE = 88,
    COD_CONFIG_EMAIL_VARIABLE = 89,
}