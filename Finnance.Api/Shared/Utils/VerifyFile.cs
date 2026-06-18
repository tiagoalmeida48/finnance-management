namespace Finnance.Api.Shared.Utils;

public static class VerifyFile
{
    public static bool IsLocked(string file)
    {
        try
        {
            using FileStream stream = new(file, FileMode.Open, FileAccess.Write, FileShare.Write);
            stream.Close();
        }
        catch (IOException)
        {
            return true;
        }

        return false;
    }
}