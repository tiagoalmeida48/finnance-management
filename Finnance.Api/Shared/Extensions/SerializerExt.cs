using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Reflection;

namespace Finnance.Api.Shared;

public static partial class Extensions
{
    public readonly static JsonSerializerSettings JsonStt = new()
    {
        Formatting = Formatting.None,
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        NullValueHandling = NullValueHandling.Ignore,
       // ContractResolver = new CamelCasePropertyNamesContractResolver(),
        Converters = { new ByteArrayConverter() }
    };

    public static TData Deserialize<TData>(this string jsonEnt)
    {
        if (jsonEnt.IsNotEmpty())
            return JsonConvert.DeserializeObject<TData>(jsonEnt, JsonStt);

        return default;
    }

    public static string Serialize(this object entityToSer)
    {
        if (entityToSer == null) return string.Empty;

        var res = JsonConvert.SerializeObject(entityToSer, JsonStt);
        return res;
    }

    public static T DeepCopy<T>(this T other)
    {
        var ss = other.Serialize();
        return ss.Deserialize<T>();
    }

    public static string ToBase64(this byte[] data)
    {
        if (data != null)
            return Convert.ToBase64String(data);

        return string.Empty;
    }

    public static TDestiny MapTo<TDestiny>(this object entity)
    {
        return entity.Serialize().Deserialize<TDestiny>();
    }

    public class ByteArrayConverter : JsonConverter<byte[]>
    {
        public override void WriteJson(JsonWriter writer, byte[] value, JsonSerializer serializer)
        {
            var base64String = CustomBase64Encode(value);
            writer.WriteValue(base64String);
        }

        public override byte[] ReadJson(JsonReader reader, Type objectType, byte[] existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            var base64String = reader.Value?.ToString();
            return CustomBase64Decode(base64String);
        }

        private static string CustomBase64Encode(byte[] data)
        {
            return Convert.ToBase64String(data);
        }

        private static byte[] CustomBase64Decode(string base64String)
        {
            return Convert.FromBase64String(base64String);
        }
    }

    public class IgnoreByteArrayResolver : DefaultContractResolver
    {
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            var property = base.CreateProperty(member, memberSerialization);
            if (property.PropertyType == typeof(byte[]))
                property.ShouldSerialize = _ => false;

            return property;
        }
    }
}