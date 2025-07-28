# Teste Violet - Sistema de Gerenciamento de Agricultores


## Tecnologias Utilizadas

### Backend
- **NestJS** 
- **MongoDB** 
- **Mongoose** 
- **TypeScript** 
- **Class Validator** 
- **Class Transformer** 

### Frontend
- **Next.js 15** 
- **React 19** 
- **TypeScript** 
- **Tailwind CSS** 
- **React Toastify** 
- **Date-fns**  

## Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (versão 10.2.4 ou superior)
- **MongoDB** (versão 6 ou superior)
- **Git**

## 🛠️ Instalação e Configuração

```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências dos workspaces (backend e frontend)
cd app
npm install
```



### 4. Configure as variáveis de ambiente

# Copie o arquivo de exemplo
cp app/backend/.env.example app/backend/.env

Edite o arquivo `app/backend/.env`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/teste-violet

# Application Configuration
PORT=3002
NODE_ENV=development
```

### 5. Execute o projeto

```bash
# Na raiz do projeto
cd app
npm run dev
```

Isso iniciará:
- **Backend**: http://localhost:3002
- **Frontend**: http://localhost:3000

## 📁 Estrutura do Projeto

```
teste-violet/
├── app/
│   ├── backend/          # API NestJS
│   │   ├── src/
│   │   │   ├── farmers/  # Módulo de agricultores
│   │   │   ├── schemas/  # Schemas do MongoDB
│   │   │   └── common/   # Utilitários comuns
│   │   ├── .env          # Variáveis de ambiente
│   │   └── package.json
│   ├── frontend/         # Aplicação Next.js
│   │   ├── src/
│   │   │   ├── app/      # App Router do Next.js
│   │   │   └── components/
│   │   └── package.json
│   ├── package.json      # Configuração do workspace
│   └── turbo.json        # Configuração do Turborepo
└── README.md
```

## 🔌 API Documentation

### Base URL
```
http://localhost:3002
```

### Endpoints

#### 🧑‍🌾 Farmers (Agricultores)

##### `POST /farmers`
Cria um novo agricultor.

**Request Body:**
```json
{
  "cpf": "12345678901",
  "fullName": "João Silva",
  "birthDate": "1985-03-15",
  "phone": "11999887766"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "cpf": "12345678901",
  "fullName": "João Silva",
  "birthDate": "1985-03-15T00:00:00.000Z",
  "phone": "11999887766",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

##### `GET /farmers`
Lista todos os agricultores.

**Query Parameters:**
- `includeInactive` (optional): `true` para incluir agricultores inativos

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "cpf": "12345678901",
    "fullName": "João Silva",
    "birthDate": "1985-03-15T00:00:00.000Z",
    "phone": "11999887766",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

##### `GET /farmers/search`
Busca agricultores por nome ou CPF.

**Query Parameters:**
- `q` (required): Termo de busca
- `status` (optional): `active` ou `inactive`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "João Silva",
    "cpf": "12345678901",
    "phone": "11999887766"
  }
]
```



##### `GET /farmers/:id`
Busca um agricultor por ID.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "cpf": "12345678901",
  "fullName": "João Silva",
  "birthDate": "1985-03-15T00:00:00.000Z",
  "phone": "11999887766",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

##### `PUT /farmers/:id`
Atualiza um agricultor.

**Request Body:**
```json
{
  "fullName": "João Silva Santos",
  "birthDate": "1985-03-15",
  "phone": "11988776655"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "cpf": "12345678901",
  "fullName": "João Silva Santos",
  "birthDate": "1985-03-15T00:00:00.000Z",
  "phone": "11988776655",
  "isActive": true,
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

##### `DELETE /farmers/:id`
Exclui (desativa) um agricultor.

**Response (200):**
```json
{
  "message": "Farmer deactivated successfully",
  "farmerId": "507f1f77bcf86cd799439011"
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Recurso não encontrado
- `409` - Conflito (CPF já cadastrado)
- `500` - Erro interno do servidor





