using System.Security.Cryptography;
using System.Text;

namespace Utils
{
    public class EncryptService
    {
        #region Encryption
        public string EncryptString(string text, string key, string iv)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(key);
            aes.IV = Encoding.UTF8.GetBytes(iv);

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
            using var sw = new StreamWriter(cs);
            sw.Write(text);
            sw.Close();

            return Convert.ToBase64String(ms.ToArray());
        }
        #endregion

        #region Desencrypt
        public string DecryptString(string textBase64, string key, string iv)
        {
            // Console.WriteLine($"textBase64: {textBase64}");
            var cipherText = Convert.FromBase64String(textBase64);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(key);
            aes.IV = Encoding.UTF8.GetBytes(iv);

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(cipherText);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }
        #endregion 
    }
}
