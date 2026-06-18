using System.Text;

namespace Finnance.Api.Shared.Utils;

public class RandomCodeGenerator
{
    private const string PasswordValidCharacters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    private readonly static Random RndGenerator = new(DateTime.Now.Millisecond);

    public static string Generate()
    {
        return RndGenerator.Next(999, int.MaxValue).ToString();
    }

    public static string CreateNewPassword()
    {
        const int size = 4;
        var maxValue = PasswordValidCharacters.Length;
        var password = new StringBuilder(size);

        for (var i = 0; i < size; i++)
            password.Append(PasswordValidCharacters[RndGenerator.Next(0, maxValue)]);

        return password.ToString();
    }
}