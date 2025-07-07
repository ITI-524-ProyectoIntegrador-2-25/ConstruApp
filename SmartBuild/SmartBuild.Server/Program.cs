using DataAccessLogic;
using Microsoft.OpenApi.Models;
using Utils;

public class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var env = builder.Environment;
        builder.Configuration
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
            .AddEnvironmentVariables();

        EncryptService encryptService = new EncryptService();

        var connString = builder.Configuration.GetConnectionString("DefaultConnection");

        string passwordEncrypted = builder.Configuration.GetValue<string>("Database_Config:DB_PASSWORD_ENCRYPTED");
        string cryptoKey = builder.Configuration.GetValue<string>("Crypto:Key");
        string cryptoIV = builder.Configuration.GetValue<string>("Crypto:IV");

        string password = encryptService.DecryptString(passwordEncrypted, cryptoKey, cryptoIV);

        connString = connString?.Replace("${DB_SERVER}", builder.Configuration.GetValue<string>("Database_Config:DB_SERVER"));
        connString = connString?.Replace("${DB_NAME}", builder.Configuration.GetValue<string>("Database_Config:DB_NAME"));
        connString = connString?.Replace("${DB_USER}", builder.Configuration.GetValue<string>("Database_Config:DB_USER"));
        connString = connString?.Replace("${DB_PASSWORD}", password);

        builder.Configuration["ConnectionStrings:DefaultConnection"] = connString;

        // Configuracion de logging
        builder.Logging.ClearProviders();
        builder.Logging.SetMinimumLevel(LogLevel.Information);
        builder.Logging.AddConsole();

        // Agregar servicios a la aplicacion
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "API Gestión de proyectos",
                Version = "v1"
            });
        });

        // Inyeccion de dependencias (ajusta segun tu implementacion)
        builder.Services.AddScoped<ICRMConnectionDB, CRMConnectionDB>();

        var app = builder.Build();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
            });
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}