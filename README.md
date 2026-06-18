# ProjectBase - API Clean Architecture

## Introdução

O ProjectBase é um sistema robusto desenvolvido em **C# .NET 9** seguindo os princípios da **Clean Architecture**. Este projeto oferece uma base sólida para desenvolvimento de APIs corporativas, implementando padrões arquiteturais modernos, flexibilidade de escolha de banco de dados (PostgreSQL ou SQL Server) e um sistema completo de autenticação e autorização.

## Diagrama da Arquitetura

```
ProjectBase (Clean Architecture)
│
├── 1️⃣ Domain (Núcleo do Negócio)
│   └── ProjectBase.Domain/
│       ├── Entities/BaseSystem/        # Entidades com regras de negócio
│       ├── Interfaces/                 # Contratos de repositório  
│       └── Vo/                        # Value Objects
│
├── 2️⃣ Application (Casos de Uso)
│   └── ProjectBase.Application/
│       ├── Interfaces/                 # Contratos de serviços
│       ├── Records/                    # DTOs tipados
│       └── Services/                   # Implementação dos casos de uso
│
├── 3️⃣ Infrastructure (Escolha uma opção)
│   ├── ProjectBase.Repository.PostgreSql/    # Opção PostgreSQL
│   │   ├── BaseRepository/
│   │   ├── Models/
│   │   └── Repositories/
│   │
│   ├── ProjectBase.Repository.SqlServer/     # Opção SQL Server  
│   │    ├── BaseRepository/
│   │    ├── Models/
│   │    └── Repositories/
│   │ 
│   └── 🛠️ Shared (Cross-Cutting)
│       └── ProjectBase.Shared/
│           ├── BaseClass/                  # Classes base
│           ├── Extensions/                 # Métodos de extensão
│           └── Utils/                      # Utilitários diversos
└── 4️⃣ Presentation (API)
    └── ProjectBase.WebApi/
        ├── Controllers/                # Endpoints REST
        ├── GraphQL/                    # Endpoints GraphQl
        ├── Configuration/              # Configurações
        ├── Security/                   # Autenticação/Autorização
        └── Program.cs                  # Entry Point
```

### Objetivos do Projeto

- Fornecer uma arquitetura limpa e escalável para APIs corporativas
- Implementar padrões de design consolidados na indústria
- Oferecer flexibilidade de escolha entre PostgreSQL ou SQL Server
- Disponibilizar um sistema robusto de autenticação com Active Directory
- Facilitar manutenção e evolução através de separação clara de responsabilidades

## Arquitetura do Sistema

### Estrutura de Camadas

O projeto segue rigorosamente os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

#### 🏗️ **1. Domain (Núcleo)**
- **Entidades**: Modelos de domínio ricos com regras de negócio incorporadas
- **Interfaces de Repositório**: Contratos que definem operações de acesso a dados
- **Value Objects**: Objetos imutáveis representando conceitos do domínio

```
ProjectBase.Domain/
├── Entities/BaseSystem/     # Entidades do sistema base
├── Interfaces/              # Contratos de repositório
└── Vo/                     # Value Objects
```

#### 🔧 **2. Application (Casos de Uso)**
- **Services**: Implementação dos casos de uso da aplicação
- **Interfaces**: Contratos dos serviços de aplicação
- **Records**: DTOs tipados para transferência de dados
- **Padrões de Comando**: Separação clara entre operações de leitura e escrita

```
ProjectBase.Application/
├── Interfaces/              # Contratos de serviços
├── Records/                 # DTOs tipados
└── Services/               # Implementação dos casos de uso
```

#### 💾 **3. Infrastructure (Repositórios)**
- **Flexible Database Support**: Escolha entre PostgreSQL ou SQL Server
- **Dapper ORM**: Performance otimizada para acesso a dados
- **Models**: Mapeamento objeto-relacional
- **Base Repository**: Implementação comum para operações CRUD
##### Shared (Componentes Compartilhados)**
- **Extensions**: Métodos de extensão utilitários
- **Utils**: Utilitários diversos (JWT, Hashing, etc.)
- **Base Classes**: Classes base para herança
- **Constants**: Constantes do sistema

```
ProjectBase.External/                  # Classes de consumo externo, como o SAP
ProjectBase.Repository.PostgreSql/     # Opção PostgreSQL
ProjectBase.Repository.SqlServer/      # Opção SQL Server
├── BaseRepository/                    # Funcionalidades base
├── Models/                            # Modelos de dados
└── Repositories/                      # Implementações específicas
ProjectBase.Shared/                    # Componentes compartilhados
```

#### 🌐 **4. Presentation (API)**
- **Controllers**: Endpoints da API REST
- **GraphQL**: Endpoints da API GraphQl
- **Middleware**: Interceptadores de requisições
- **Configuration**: Configurações de injeção de dependência
- **Security**: Sistema de autenticação e autorização

```
ProjectBase.WebApi/
├── Controllers/             # Endpoints da API REST
├── GraphQl/                 # Endpoints da API GraphQl
├── Configuration/           # Configurações do sistema
└── Security/                # Autenticação e autorização
```

## Pontos Fortes da Arquitetura

### ✅ **Clean Architecture**
- **Inversão de Dependência**: Camadas externas dependem das internas
- **Flexibilidade**: Fácil substituição de componentes
- **Manutenibilidade**: Código organizado e fácil de evoluir
- **Escalabilidade**: Arquitetura preparada para crescimento

### ✅ **Flexibilidade de Banco de Dados**
- Escolha entre PostgreSQL ou SQL Server conforme necessidade
- Implementação DRY com base classes compartilhadas
- Flexibilidade para escolha do provedor por ambiente
- Fácil migração entre provedores

### ✅ **Sistema de Autenticação Avançado**
- **JWT Tokens**: Autenticação stateless
- **Active Directory Integration**: Integração com AD corporativo
- **Multi-Platform Support**: Suporte a diferentes plataformas

### ✅ **Sistema de Autorização com objetos**
    Nessa etapa são definidos as autorizações do sistema 
- **Object Field**: Relação de campos por objeto
- **Object Menu**: Relação de menus por objeto
- **Object Group**: Relação de grupo, objeto, campo e valor. 

### ✅ **Padrões de Design Modernos**
- **Repository Pattern**: Abstração de acesso a dados
- **Service Pattern**: Encapsulamento da lógica de negócio
- **Record Types**: DTOs imutáveis e tipados
- **Validation Pattern**: Validações incorporadas nas entidades

### ✅ **Performance Otimizada**
- **Dapper ORM**: Micro-ORM de alta performance
- **Connection Pooling**: Gestão eficiente de conexões
- **Lazy Loading**: Carregamento otimizado de dados
- **Transaction Scope**: Controle transacional robusto

### ✅ **Observabilidade**
- **Swagger/OpenAPI**: Documentação automática da API
- **Scalar UI**: Interface moderna para documentação
- **Logging Estruturado**: Sistema de logs corporativo
- **Error Handling**: Tratamento centralizado de erros

### ✅ **Background Processing**
- **Hangfire Integration**: Processamento de tarefas em background
- **Scheduler Support**: Agendamento de tarefas
- **Queue Management**: Gestão de filas de processamento

## Tecnologias Utilizadas

### Core Framework
- **.NET 9.0**: Versão mais recente do .NET
- **C# 13.0**: Recursos mais modernos da linguagem
- **ASP.NET Core**: Framework web moderno

### Banco de Dados
- **PostgreSQL**: Banco relacional open-source
- **SQL Server**: Banco de dados Microsoft
- **Dapper**: Micro-ORM de alta performance

### Segurança
- **JWT Bearer**: Autenticação via tokens
- **Active Directory**: Integração corporativa
- **HTTPS**: Comunicação segura

### Background Jobs
- **Hangfire**: Processamento background
- **Hangfire.PostgreSql**: Armazenamento PostgreSQL
- **Hangfire.SqlServer**: Armazenamento SQL Server

### Documentação
- **Swashbuckle**: Geração Swagger/OpenAPI
- **Scalar**: Interface moderna de documentação

### Utilitários
- **QRCoder**: Geração de códigos QR
- **Newtonsoft.Json**: Serialização JSON
- **Refit**: Cliente HTTP tipado

## Primeiros Passos

### Pré-requisitos
- .NET 9.0 SDK
- PostgreSQL ou SQL Server
- Visual Studio 2022 ou VS Code

### Configuração

#### 1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd base-project-api-clean
```

#### 2. Escolha e configure o provedor de banco de dados

**Para PostgreSQL:**
- Mantenha apenas o projeto `ProjectBase.Repository.PostgreSql`
- Remova o projeto `ProjectBase.Repository.SqlServer`
- Configure a connection string PostgreSQL e Database: "PostgreSql" em `appsettings.json`

**Para SQL Server:**
- Mantenha apenas o projeto `ProjectBase.Repository.SqlServer`
- Remova o projeto `ProjectBase.Repository.PostgreSql`
- Configure a connection string SQL Server e Database: "SqlServer" em `appsettings.json`

#### 3. Configure as dependências
```bash
dotnet restore
dotnet build
```

#### 4. Execute o projeto
```bash
dotnet run --project ProjectBase.WebApi
```

### Estrutura de Configuração
- `appsettings.json`: Configurações base
- `appsettings.Development.json`: Configurações de desenvolvimento
- `launchSettings.json`: Configurações de execução

## Contribuição

Este projeto segue padrões rigorosos de desenvolvimento:

- **Code Style**: Seguir convenções do C#/.NET
- **Clean Code**: Código limpo e legível  
- **SOLID Principles**: Aplicação dos princípios SOLID
- **Documentation**: Documentação clara e atualizada

### Fluxo de Desenvolvimento
1. Fork do repositório
2. Desenvolver seguindo os padrões estabelecidos
3. Fazer commit das alterações

---