namespace Finnance.Api.Shared.Utils;

public static partial class Constants
{
    public enum ConstConfigEmailModel
    {
        // recover password
        REC_PWD,

        WELCOME,
        WELC_AD,

        // create qr code mfa
        QRC_MFA,

        // update password
        UPD_PWD
    }

    public enum ErrorType
    {
        E,
        I,
        D
    }

    public enum LogCategoryConst
    {
        GNRL
    }

    public enum LogSource
    {
        API,
        ROBO,
        SAP
    }
}