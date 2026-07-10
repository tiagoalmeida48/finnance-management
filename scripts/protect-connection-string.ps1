param(
    [string]$EncryptionKey
)

$secureConnection = Read-Host "Connection string" -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnection)

try {
    $connectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $key = if ([string]::IsNullOrWhiteSpace($EncryptionKey)) {
        [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    } else {
        [Convert]::FromBase64String($EncryptionKey)
    }

    if ($key.Length -ne 32) {
        throw "A chave deve possuir 32 bytes em Base64."
    }

    $nonce = [Security.Cryptography.RandomNumberGenerator]::GetBytes(12)
    $plaintext = [Text.Encoding]::UTF8.GetBytes($connectionString)
    $ciphertext = [byte[]]::new($plaintext.Length)
    $tag = [byte[]]::new(16)
    $aes = [Security.Cryptography.AesGcm]::new($key, 16)

    try {
        $aes.Encrypt($nonce, $plaintext, $ciphertext, $tag)
    } finally {
        $aes.Dispose()
    }

    $payload = [byte[]]::new($nonce.Length + $tag.Length + $ciphertext.Length)
    [Buffer]::BlockCopy($nonce, 0, $payload, 0, $nonce.Length)
    [Buffer]::BlockCopy($tag, 0, $payload, $nonce.Length, $tag.Length)
    [Buffer]::BlockCopy($ciphertext, 0, $payload, $nonce.Length + $tag.Length, $ciphertext.Length)

    "ConnectionStrings__DefaultConnection=$([Convert]::ToBase64String($payload))"
    "ConnectionStrings__EncryptionKey=$([Convert]::ToBase64String($key))"
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}
