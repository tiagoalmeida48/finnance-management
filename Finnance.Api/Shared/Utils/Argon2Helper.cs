using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

namespace Finnance.Api.Shared.Utils;

public static class Argon2Helper
{

    public static string GenerateHashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[Argon2Config.SaltSize];
        rng.GetBytes(salt);

        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = Argon2Config.Parallelism,
            Iterations = Argon2Config.Iterations,
            MemorySize = Argon2Config.MemorySize
        };

        var hash = argon2.GetBytes(Argon2Config.HashSize);
        var result = new byte[salt.Length + hash.Length];
        Array.Copy(salt, 0, result, 0, salt.Length);
        Array.Copy(hash, 0, result, salt.Length, hash.Length);

        return Convert.ToBase64String(result);
    }

    public static bool VerifyPassword(string password, string hashPassword)
    {
        try
        {
            var hashBytes = Convert.FromBase64String(hashPassword);
            var salt = hashBytes[..Argon2Config.SaltSize];
            var storedHash = hashBytes[Argon2Config.SaltSize..];

            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = salt;
            argon2.DegreeOfParallelism = Argon2Config.Parallelism;
            argon2.MemorySize = Argon2Config.MemorySize;
            argon2.Iterations = Argon2Config.Iterations;

            var computedHash = argon2.GetBytes(Argon2Config.HashSize);
            return CryptographicOperations.FixedTimeEquals(storedHash, computedHash);
        }
        catch
        {
            return false;
        }
    }

    public class Argon2Config
    {
        public static int SaltSize => 32;
        public static int Parallelism => 1;
        public static int Iterations => 4;
        public static int MemorySize => 65536;
        public static int HashSize => 32;
    }
}