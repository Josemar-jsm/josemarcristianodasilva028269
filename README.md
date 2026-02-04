#  Inscrição: 16447  
#  Candidato: Josemar Cristiano da Silva

## PSS – Sistema de Gestão de Artistas e Álbuns (Tambor de Cururu )

Projeto desenvolvido como parte do processo seletivo para vaga de **Engenheiro da Computação - Sênior**.

O sistema consiste em uma API REST segura com autenticação JWT e um frontend SPA em Angular, responsável por gerenciar artistas e seus álbuns, incluindo upload de capas, paginação, notificações em tempo real e controle de acesso por perfil.

---

##  Candidato

- **Nome:** Josemar Cristiano da Silva 
- **Inscrição:** 16447 
- **Vaga:** Engenheiro da Computação - Sênior 
- **Stack Principal:** Java 21, Spring Boot, Angular, Docker, PostgreSQL, MinIO 

---

##  Arquitetura Geral

Arquitetura baseada em **Clean Architecture + Frontend SPA**:

[ Angular (Tailwind) ] 
→ [ Nginx Reverse Proxy ] 
→ [ Spring Boot API ] 
→ [ PostgreSQL ] [ MinIO ]

---

### Backend (API)
- Java 21 + Spring Boot 3
- Arquitetura em camadas:
  - `api` → Controllers / DTOs
  - `domain` → Entidades / Regras
  - `service` → Casos de uso
  - `repository` → Persistência
- Segurança:
  - JWT
  - RBAC (ROLE_USER / ROLE_ADMIN)
- WebSocket (STOMP)
- Rate Limit por usuário
- Health Check (Liveness / Readiness)
- Migrations com Flyway

---

### Frontend
- Angular Standalone Components
- TailwindCSS
- Facade Pattern
- BehaviorSubject (gestão de estado)
- Guards de rota
- Interceptor JWT
- WebSocket client

---

##  Autenticação e Perfis

| Perfil | Permissões |
|--------|------------|
| USER   | Visualizar artistas e álbuns |
| ADMIN  | CRUD completo + uploads |

**Fluxo:**
1. Login → JWT
2. Token salvo em LocalStorage
3. Interceptor injeta Authorization header
4. Guards protegem rotas

---

##  Funcionalidades Implementadas

### Obrigatórios
- [x] Login com JWT
- [x] RBAC por endpoint
- [x] Health Checks
- [x] Testes unitários
- [x] WebSocket
- [x] Rate Limit
- [x] Sincronização externa (Regionais)

### Frontend
- [x] Listagem de artistas
- [x] Detalhe do artista
- [x] Listagem de álbuns
- [x] Paginação
- [x] Busca
- [x] Upload de capas
- [x] Notificação em tempo real

---

##  Estrutura de Dados (Banco)

### Tabela: artists
```sql
id          BIGSERIAL PK
name        VARCHAR(150) NOT NULL
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Tabela: albums
```sql
id          BIGSERIAL PK
title       VARCHAR(150) NOT NULL
cover_key   VARCHAR(255)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Tabela: artist_album
```sql
artist_id BIGINT FK → artists.id
album_id  BIGINT FK → albums.id
```

### Tabela: users
```sql
id        BIGSERIAL PK
username  VARCHAR(50)
password  VARCHAR(255)
```

### Tabela: user_roles
```sql
user_id BIGINT
role    VARCHAR(50)
```

### Tabela: regional
```sql
id     INTEGER PK
nome   VARCHAR(200)
ativo  BOOLEAN
```

---

##  Storage (MinIO)

Utilizado para armazenar capas de álbuns 
**Bucket:** albums 
**Retorno:** via URL

---

##  WebSocket

- **Endpoint:** `/ws`
- **Tópico:** `/topic/albums` 
- Evento disparado sempre que um novo álbum é cadastrado.

---

##  Health Checks

| Tipo     | Endpoint                        |
|----------|---------------------------------|
| Health   | `/actuator/health`              |
| Liveness | `/actuator/health/liveness`     |
| Readiness| `/actuator/health/readiness`    |

*Readiness valida: banco de dados e MinIO*


# Health Check Geral - {"status":"UP
curl -i -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:8080/actuator/health

# Liveness Probe - {"status":"UP
curl -i -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:8080/actuator/health/liveness

# Readiness Probe - {"status":"UP
curl -i -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:8080/actuator/health/readiness"} 

---

##  Como executar

---
**Clonando o Projeto**

Para executar o sistema corretamente, primeiro você deve clonar o repositório do projeto:

```bash
git clone https://github.com/Josemar-jsm/josemarcristianodasilva028269.git
cd josemarcristianodasilva028269
git checkout main
```
------
**Requisitos:**
- Docker
- Docker Compose
Se estiver usando Windows ou Mac, garanta que o Docker esteja com suporte a volumes e networking habilitado corretamente (ex.: WSL2 no Windows).


**Configurações necessáris (hosts)**

Para visualizar corretamente as imagens no frontend, inclua no seu arquivo /etc/hosts (Linux/macOS) ou C:\Windows\System32\drivers\etc\hosts (Windows):

127.0.0.1 storage-pss-dev-v1


**Subir tudo:**
```bash
docker compose up --build
```

**Acessos:**

| Serviço   | URL                       |
|-----------|---------------------------|
| Frontend  | http://localhost:4200     |
| API       | http://localhost:8080     |
| Swagger   | http://localhost:8080/swagger-ui/index.html |
| MinIO     | http://localhost:9001     |

---


##  Usuário inicial

Seed automático:

```txt
user: admin
password: admin123
roles: ROLE_ADMIN
```

---

##  Testes

**Backend:**
```bash
./mvnw test
```

---

##  Decisões de Arquitetura

**Por que Facade + BehaviorSubject?**
- Separação de estado da view
- Facilita testes
- Evita lógica em componentes

**Por que Clean Architecture?**
- Baixo acoplamento
- Facilidade de manutenção
- Padrão de mercado (empresas enterprise)

**Por que MinIO?**
- Simula S3 real
- Funciona local e produção
- Compatível com cloud providers

---

##  Status do Projeto

Projeto finalizado e aderente a todos os requisitos do edital para  FULL STACK SÊNIOR - JAVA + ANGULAR.

---

