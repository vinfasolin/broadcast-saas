# Broadcast SaaS

Projeto prático **Full Stack SaaS** desenvolvido com **React**, **TypeScript**, **Vite**, **Firebase Auth**, **Cloud Firestore**, **Cloud Functions v2**, **Firebase Hosting**, **Material UI** e **TailwindCSS**.

O objetivo do projeto é demonstrar uma aplicação SaaS multiusuário para gerenciamento de conexões, contatos e mensagens, com isolamento de dados por cliente, autenticação real, CRUDs operacionais, Firestore em tempo real, mensagens agendadas processadas por Cloud Functions e integrações externas protegidas por backend.

Além dos requisitos obrigatórios do desafio, o projeto recebeu funcionalidades extras importantes, incluindo login com Google, login real por telefone/SMS, tela de completar perfil, validação server-side contra e-mail/telefone duplicados, exclusão completa de conta, envio real de e-mail via API PHP e envio real de WhatsApp via mini API Node.js com Baileys.

---

## Sumário

- [Visão geral](#visão-geral)
- [Link publicado](#link-publicado)
- [Aderência à vaga](#aderência-à-vaga)
- [Stack utilizada](#stack-utilizada)
- [Arquitetura geral](#arquitetura-geral)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Funcionalidades entregues](#funcionalidades-entregues)
- [Frontend](#frontend)
- [Firebase Auth](#firebase-auth)
- [Cloud Firestore](#cloud-firestore)
- [Firestore Rules](#firestore-rules)
- [Cloud Functions](#cloud-functions)
- [Mensagens e agendamento](#mensagens-e-agendamento)
- [Envio real de e-mail](#envio-real-de-e-mail)
- [Envio real de WhatsApp com Baileys](#envio-real-de-whatsapp-com-baileys)
- [Validação contra e-mail e telefone duplicados](#validação-contra-e-mail-e-telefone-duplicados)
- [Exclusão completa de conta](#exclusão-completa-de-conta)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Build](#build)
- [Deploy](#deploy)
- [Testes manuais recomendados](#testes-manuais-recomendados)
- [Logs e diagnóstico](#logs-e-diagnóstico)
- [Coleções Firestore](#coleções-firestore)
- [Decisões técnicas](#decisões-técnicas)
- [Segurança](#segurança)
- [Estado atual](#estado-atual)

---

## Visão geral

O **Broadcast SaaS** é uma aplicação web para gerenciamento de:

- conexões;
- contatos;
- mensagens;
- envios imediatos;
- mensagens agendadas;
- integrações opcionais de e-mail e WhatsApp.

Cada usuário autenticado possui sua própria área dentro do sistema. Os dados são isolados pelo campo `ownerId`, garantindo que um cliente não consiga acessar conexões, contatos ou mensagens de outro cliente.

O projeto usa o Firebase como backend principal:

- **Firebase Auth** para autenticação;
- **Cloud Firestore** para banco em tempo real;
- **Cloud Functions v2** para regras server-side e processamento assíncrono;
- **Firebase Hosting** para publicação do frontend.

---

## Link publicado

Aplicação publicada no Firebase Hosting:

```txt
https://broadcast-saas-d82ee.web.app
```

URL alternativa:

```txt
https://broadcast-saas-d82ee.firebaseapp.com
```

Projeto Firebase:

```txt
broadcast-saas-d82ee
```

Região das Cloud Functions:

```txt
southamerica-east1
```

---

## Aderência à vaga

### Requisitos técnicos da vaga

| Requisito | Status | Implementação |
|---|---:|---|
| React | ✅ | Frontend em React |
| TypeScript | ✅ | Frontend e Functions em TypeScript |
| Vite | ✅ | Projeto criado com Vite, sem React Scripts |
| Node.js | ✅ | Cloud Functions e mini API Baileys em Node.js |
| Firebase Auth | ✅ | E-mail/senha, Google e telefone/SMS |
| Firestore | ✅ | Banco principal em tempo real |
| Cloud Functions | ✅ | Callable Functions e Function agendada |
| Firebase Hosting | ✅ | Projeto publicado |
| Material UI | ✅ | Componentes principais da interface |
| TailwindCSS | ✅ | Estilização utilitária e layout |
| SaaS multiusuário | ✅ | Isolamento por `ownerId` |
| Firestore realtime | ✅ | Uso de `onSnapshot` |
| Sem subcoleções | ✅ | Coleções planas |
| Paradigma funcional | ✅ | Hooks, services, functions e modules |
| Git/versionamento | ✅ | Projeto preparado para versionamento |
| Baileys/WhatsApp | ✅ | Integração real via mini API Baileys |

### Requisitos do projeto prático

| Funcionalidade solicitada | Status |
|---|---:|
| Login/cadastro com Firebase Auth | ✅ |
| CRUD de conexões | ✅ |
| Conexão com apenas nome | ✅ |
| CRUD de contatos | ✅ |
| Contato com nome e telefone | ✅ |
| E-mail opcional em contato | ✅ Plus |
| Tela de mensagens | ✅ |
| Selecionar contatos específicos | ✅ |
| Envio fake | ✅ |
| Agendamento de mensagens | ✅ |
| Filtro de enviadas/agendadas | ✅ |
| Mensagens agendadas mudam para enviadas via Function | ✅ |
| CRUD de mensagens | ✅ |
| SaaS com isolamento por cliente | ✅ |
| Firestore sem subcoleções | ✅ |
| Deploy no Firebase Hosting | ✅ |

---

## Stack utilizada

### Frontend

- React
- TypeScript
- Vite
- Material UI
- TailwindCSS
- React Router DOM
- React Hook Form
- Zod
- Firebase Web SDK

### Backend / Serverless

- Firebase Auth
- Cloud Firestore
- Firebase Cloud Functions v2
- Firebase Admin SDK
- Firebase Hosting
- Cloud Scheduler
- Node.js 22 nas Functions

### Integrações externas

- API PHP externa para envio real de e-mail;
- mini API Node.js/Fastify/Baileys para envio real de WhatsApp;
- Firebase Functions como camada segura entre frontend e APIs externas.

---

## Arquitetura geral

```txt
Usuário
  |
  |-- React + Vite + TypeScript
  |     |
  |     |-- Firebase Auth
  |     |-- Firestore realtime com onSnapshot
  |     |-- Callable Functions
  |
  |-- Cloud Functions v2
        |
        |-- Firebase Admin SDK
        |-- Firestore Admin
        |-- Auth Admin
        |-- API PHP de e-mail
        |-- API Node.js Baileys para WhatsApp
```

O frontend não acessa diretamente credenciais sensíveis nem serviços internos. Operações críticas são intermediadas por Cloud Functions.

Responsabilidades server-side:

- validação de duplicidade de e-mail e telefone;
- exclusão completa de conta;
- processamento de mensagens agendadas;
- envio real de e-mail;
- envio real de WhatsApp via Baileys;
- acesso a variáveis sensíveis de ambiente.

---

## Estrutura de pastas

```txt
broadcast-saas/
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
├── README.md
├── web/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── .env.example
│   ├── .env.local
│   └── src/
│       ├── app/
│       ├── config/
│       ├── features/
│       │   ├── auth/
│       │   ├── connections/
│       │   ├── contacts/
│       │   └── messages/
│       └── shared/
└── functions/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.dev.json
    ├── .eslintrc.js
    ├── .env
    └── src/
        ├── auth/
        ├── config/
        ├── email/
        ├── messages/
        ├── whatsapp/
        └── shared/
```

---

## Funcionalidades entregues

### Autenticação

- Cadastro com e-mail e senha.
- Login com e-mail e senha.
- Login com Google.
- Login real com telefone/SMS.
- reCAPTCHA configurado para autenticação por telefone.
- Tela de completar perfil após login/cadastro.
- Controle de perfil completo/incompleto.
- Logout.
- Tela/modal **Minha conta**.
- Alteração de nome, e-mail de perfil, telefone e empresa.
- Alteração de senha para contas e-mail/senha.
- Tratamento específico para contas Google e telefone, onde senha não é alterada pelo painel.

### Dashboard

- Tela inicial autenticada.
- Layout principal com menu.
- Identificação do usuário logado.
- Acesso à área de conta.
- Navegação entre conexões, contatos e mensagens.

### Conexões

- Criar conexão.
- Listar conexões em tempo real.
- Editar conexão.
- Excluir conexão.
- Validação de nome.
- Proteção por `ownerId`.

### Contatos

- Criar contato.
- Listar contatos em tempo real.
- Editar contato.
- Excluir contato.
- Nome obrigatório.
- Telefone obrigatório.
- E-mail opcional como plus.
- Vínculo com conexão.
- Filtro por conexão.
- Proteção por `ownerId`.

### Mensagens

- Criar mensagem.
- Editar mensagem.
- Excluir mensagem.
- Selecionar conexão.
- Selecionar contatos específicos.
- Enviar agora.
- Agendar envio.
- Filtrar por enviadas e agendadas.
- Mensagens com status `sent` e `scheduled`.
- Listagem em tempo real.
- Mensagens agendadas processadas por Function.
- Plus de envio real por e-mail.
- Plus de envio real por WhatsApp/Baileys.

---

## Frontend

O frontend fica em:

```txt
web/
```

Principais responsabilidades:

- autenticação do usuário;
- exibição do dashboard;
- CRUDs de conexões, contatos e mensagens;
- chamadas para Firebase Functions;
- leitura em tempo real com Firestore;
- interface com Material UI e TailwindCSS.

Principais módulos:

```txt
web/src/features/auth
web/src/features/connections
web/src/features/contacts
web/src/features/messages
```

Componentes compartilhados:

```txt
web/src/shared/components
web/src/shared/layouts
web/src/shared/hooks
web/src/shared/services
web/src/shared/utils
```

---

## Firebase Auth

Provedores usados:

```txt
password
google.com
phone
```

### E-mail e senha

- Cadastro.
- Login.
- Alteração de senha.
- Alteração de e-mail de acesso com reautenticação.

### Google

- Login com popup Google.
- Usuários Google passam pela tela de completar perfil quando necessário.
- Senha não é alterada pelo painel, pois pertence ao provedor externo.

### Telefone/SMS

- Login real por telefone.
- Uso de reCAPTCHA.
- Usuários autenticados por telefone também passam pelo fluxo de completar perfil quando necessário.

---

## Cloud Firestore

O projeto usa Firestore sem subcoleções.

Coleções principais:

```txt
users
connections
contacts
messages
user_unique_fields
```

Padrão de isolamento:

```txt
ownerId = request.auth.uid
```

Esse padrão garante que cada cliente veja apenas os próprios registros.

Exemplo conceitual:

```json
{
  "id": "documentId",
  "ownerId": "firebaseAuthUid",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

---

## Firestore Rules

As regras foram configuradas para:

- exigir autenticação;
- permitir leitura apenas dos próprios documentos;
- permitir CRUD apenas quando `ownerId` pertence ao usuário autenticado;
- validar campos permitidos por coleção;
- validar tipos básicos;
- bloquear acesso direto a dados sensíveis;
- impedir manipulação direta da coleção `user_unique_fields`;
- permitir os novos campos de WhatsApp nas mensagens:
  - `contactPhones`;
  - `sendWhatsappCopy`.

Coleção bloqueada ao cliente:

```txt
user_unique_fields
```

Regra conceitual:

```js
allow read, write: if false;
```

---

## Cloud Functions

As Functions ficam em:

```txt
functions/src/
```

Functions publicadas:

```txt
processScheduledMessages
sendEmailNotification
sendWhatsappNotification
updateUserProfile
deleteUserAccount
```

### `processScheduledMessages`

Function agendada que roda periodicamente para processar mensagens com:

```txt
status = scheduled
scheduledAt <= agora
```

Quando encontra mensagens vencidas:

- muda status para `sent`;
- define `sentAt`;
- envia cópia real por e-mail, se `sendEmailCopy = true`;
- envia mensagem real por WhatsApp/Baileys, se `sendWhatsappCopy = true`.

Logs principais:

```txt
scheduled_messages_started
scheduled_messages_none_due
scheduled_messages_processed
scheduled_message_email_copy_failed
scheduled_message_whatsapp_copy_failed
```

### `sendEmailNotification`

Callable Function usada para envio real de e-mail.

Fluxo:

```txt
Frontend
  -> sendEmailNotification
      -> API PHP de e-mail
```

### `sendWhatsappNotification`

Callable Function usada para envio real de WhatsApp.

Fluxo:

```txt
Frontend
  -> sendWhatsappNotification
      -> Mini API Node.js Baileys
          -> WhatsApp
```

### `updateUserProfile`

Callable Function responsável por atualizar perfil do usuário com validação server-side de:

- nome;
- e-mail;
- telefone;
- empresa;
- e-mail duplicado;
- telefone duplicado.

### `deleteUserAccount`

Callable Function responsável por excluir:

- usuário do Firebase Auth;
- documento em `users`;
- conexões do usuário;
- contatos do usuário;
- mensagens do usuário;
- reservas em `user_unique_fields`.

---

## Mensagens e agendamento

### Envio fake imediato

Quando o usuário seleciona **Enviar agora**, o sistema cria uma mensagem com:

```txt
status = sent
sentAt = serverTimestamp()
```

Esse fluxo atende ao requisito original do teste prático, que não exige disparo real.

### Agendamento

Quando o usuário seleciona **Agendar**, o sistema cria uma mensagem com:

```txt
status = scheduled
scheduledAt = data/hora escolhida
sentAt = null
```

A Function `processScheduledMessages` roda a cada minuto e processa mensagens vencidas.

### Filtros

A tela permite filtrar mensagens por:

```txt
todas
enviadas
agendadas
```

### CRUD

O CRUD de mensagens inclui:

- criar;
- listar em tempo real;
- editar;
- excluir.

---

## Envio real de e-mail

Como plus, o projeto integra envio real de e-mail por meio de uma API PHP externa.

O frontend nunca chama a API PHP diretamente.

Fluxo:

```txt
Frontend React
  -> Firebase Function sendEmailNotification
      -> API PHP de e-mail
```

Variáveis usadas nas Functions:

```env
MAIL_API_URL=https://sitequalquer.com.br/api-email/send
MAIL_API_KEY=
MAIL_FROM_NAME=Broadcast SaaS
MAIL_CONFIG_VERSION=2026-05-13-01
```

Campos usados nas mensagens:

```txt
sendEmailCopy
contactEmails
```

Quando `sendEmailCopy = true`, os contatos selecionados que possuem e-mail recebem uma cópia real da mensagem.

---

## Envio real de WhatsApp com Baileys

Como diferencial principal para a vaga, o projeto integra envio real de WhatsApp usando uma mini API Node.js com Baileys.

A integração segue o mesmo padrão seguro do envio de e-mail: o frontend não chama a API Baileys diretamente. A chamada passa por uma Firebase Function.

Fluxo:

```txt
Frontend React
  -> Firebase Function sendWhatsappNotification
      -> Mini API Node.js/Fastify/Baileys
          -> WhatsApp
```

Endpoint consumido pela Function:

```txt
POST https://sitequalquer.com.br/whatsapp-baileys-api/api/internal/whatsapp/send-message
```

Headers esperados pela mini API:

```http
Content-Type: application/json
x-api-token: TOKEN_INTERNO
```

Payload enviado pela Function:

```json
{
  "to": "5541999999999",
  "text": "Mensagem enviada pelo Broadcast SaaS",
  "externalId": "id-da-mensagem-no-firestore"
}
```

Resposta esperada da mini API:

```json
{
  "ok": true,
  "channel": "whatsapp",
  "provider": "baileys",
  "externalId": "id-da-mensagem-no-firestore",
  "message": "Mensagem enviada com sucesso.",
  "to": "5541999999999@s.whatsapp.net",
  "messageId": "...",
  "sentAt": "...",
  "timestamp": "..."
}
```

Campos usados nas mensagens:

```txt
sendWhatsappCopy
contactPhones
```

Quando `sendWhatsappCopy = true`, os contatos selecionados que possuem telefone recebem a mensagem via WhatsApp.

### Envio imediato por WhatsApp

Ao criar uma mensagem com:

```txt
status = sent
sendWhatsappCopy = true
```

O frontend salva a mensagem no Firestore e chama a callable Function `sendWhatsappNotification`.

Se o envio falhar, a mensagem continua salva no Firestore e a interface mostra aviso amigável.

### Envio agendado por WhatsApp

Ao criar uma mensagem com:

```txt
status = scheduled
sendWhatsappCopy = true
```

A Function `processScheduledMessages` processa a mensagem no horário agendado e chama a mini API Baileys.

### Mini API Baileys

A mini API Baileys roda separada do Firebase, em servidor próprio, com:

- Node.js;
- TypeScript;
- Fastify;
- Baileys;
- PM2;
- Apache reverse proxy HTTPS;
- endpoint protegido por `x-api-token`;
- sessão persistida;
- auto reconnect ao iniciar.

A porta interna da API não fica pública. O acesso externo ocorre apenas por HTTPS via reverse proxy.

### Observação importante

Baileys não é a API oficial da Meta. Para produção comercial em larga escala, o caminho oficial seria WhatsApp Cloud API. Neste projeto, a integração com Baileys foi usada como diferencial técnico e demonstração prática de automação de mensagens, conforme aderência à vaga.

---

## Validação contra e-mail e telefone duplicados

Foi implementada validação profissional para impedir duplicidade de:

- e-mail;
- telefone.

Essa validação funciona em:

- tela de completar perfil;
- tela Minha conta.

A validação é feita por Function, e não apenas no frontend.

Camadas de validação:

1. coleção `user_unique_fields`;
2. coleção `users` para compatibilidade com usuários antigos.

Campos verificados:

```txt
email
emailUniqueValue
phone
phoneUniqueValue
```

Telefones são normalizados para evitar duplicidades em formatos diferentes:

```txt
11999999999
5511999999999
+5511999999999
(11) 99999-9999
```

### `user_unique_fields`

Coleção interna para reserva de dados únicos.

Exemplo conceitual:

```json
{
  "type": "email",
  "userId": "uid",
  "ownerId": "uid",
  "valueHash": "sha256",
  "maskedValue": "us***@email.com",
  "createdAt": "...",
  "updatedAt": "..."
}
```

IDs conceituais:

```txt
email_<sha256(email_normalizado)>
phone_<sha256(phone_normalizado)>
```

Comportamento validado:

- não permite cadastro com e-mail já usado;
- não permite cadastro com telefone já usado;
- não permite alterar para e-mail de outro usuário;
- não permite alterar para telefone de outro usuário;
- ao excluir uma conta, as reservas são removidas;
- depois da exclusão, e-mail/telefone podem ser reutilizados.

---

## Exclusão completa de conta

A tela **Minha conta** possui uma área de perigo com a opção **Excluir minha conta**.

Fluxo:

1. usuário abre Minha conta;
2. clica em Excluir minha conta;
3. confirma a exclusão definitiva;
4. a Function remove o usuário do Firebase Auth;
5. a Function remove os dados vinculados no Firestore;
6. o frontend faz logout e redireciona o usuário.

Dados removidos:

```txt
Firebase Auth user
users/{uid}
connections com ownerId = uid
contacts com ownerId = uid
messages com ownerId = uid
user_unique_fields vinculados ao uid
```

Permissão IAM necessária para a service account das Functions:

```txt
Firebase Authentication Admin
```

Service account usada pelo projeto:

```txt
64861294341-compute@developer.gserviceaccount.com
```

---

## Variáveis de ambiente

### Frontend

Arquivo local:

```txt
web/.env.local
```

Exemplo:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=broadcast-saas-d82ee
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_DISABLE_PHONE_RECAPTCHA_FOR_TESTING=false
VITE_USE_FIREBASE_EMULATORS=false
```

Para login real por telefone/SMS:

```env
VITE_DISABLE_PHONE_RECAPTCHA_FOR_TESTING=false
```

### Functions

Arquivo local:

```txt
functions/.env
```

Exemplo sem segredos reais:

```env
MAIL_API_URL=https://armazenamentoarquivos.com.br/api-email/send
MAIL_API_KEY=
MAIL_FROM_NAME=Broadcast SaaS
MAIL_CONFIG_VERSION=2026-05-13-01

WHATSAPP_API_URL=https://sistemasphp.com.br/whatsapp-baileys-api/api/internal/whatsapp/send-message
WHATSAPP_API_TOKEN=troque-este-token
WHATSAPP_PROVIDER=baileys
WHATSAPP_CONFIG_VERSION=2026-05-14-01

FIRESTORE_DATABASE_ID=default
```

Nunca commitar arquivos `.env` reais.

---

## Como rodar localmente

### Instalar dependências do frontend

```bash
cd web
npm install
```

### Rodar frontend

```bash
npm run dev
```

URL comum do Vite:

```txt
http://localhost:5173
```

### Instalar dependências das Functions

```bash
cd functions
npm install
```

### Rodar lint das Functions

```bash
npm run lint
```

### Rodar build das Functions

```bash
npm run build
```

---

## Build

### Frontend

```bash
cd web
npm run build
```

### Functions

```bash
cd functions
npm run lint
npm run build
```

Observação: no Windows, se o lint acusar `CRLF` em arquivos das Functions, converter os arquivos para `LF`.

Exemplo PowerShell:

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas\functions

$files = Get-ChildItem -Path src -Recurse -Include *.ts,*.js

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $content = $content -replace "`r`n", "`n"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
}
```

---

## Deploy

### Deploy apenas do Hosting

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas\web
npm run build

cd C:\Users\vinic\Desktop\react\broadcast-saas
npx firebase-tools@latest deploy --only hosting
```

### Deploy apenas das Functions

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas\functions
npm run lint
npm run build

cd C:\Users\vinic\Desktop\react\broadcast-saas
$env:FUNCTIONS_DISCOVERY_TIMEOUT="120"
npx firebase-tools@latest deploy --only functions
```

### Deploy apenas das Firestore Rules

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas
npx firebase-tools@latest deploy --only firestore:rules
```

### Deploy completo recomendado

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas\functions
npm run lint
npm run build

cd C:\Users\vinic\Desktop\react\broadcast-saas\web
npm run build

cd C:\Users\vinic\Desktop\react\broadcast-saas
$env:FUNCTIONS_DISCOVERY_TIMEOUT="120"
npx firebase-tools@latest deploy --only firestore:rules,firestore:indexes,functions,hosting
```

Último deploy validado incluiu:

- Firestore Rules;
- Functions;
- Hosting;
- criação da Function `sendWhatsappNotification`;
- atualização da Function `processScheduledMessages`.

---

## Testes manuais recomendados

### Autenticação

- Criar conta com e-mail/senha.
- Fazer login com e-mail/senha.
- Fazer login com Google.
- Fazer login com telefone/SMS.
- Fazer logout.

### Complete Profile

- Entrar com Google ou telefone.
- Preencher perfil.
- Confirmar redirecionamento para dashboard.
- Tentar usar e-mail já cadastrado.
- Tentar usar telefone já cadastrado.

### Minha conta

- Alterar nome.
- Alterar e-mail de perfil.
- Alterar telefone.
- Alterar empresa.
- Alterar senha em conta e-mail/senha.
- Confirmar senha desabilitada em contas Google/telefone.
- Tentar alterar para e-mail duplicado.
- Tentar alterar para telefone duplicado.
- Confirmar modal central de erro.
- Confirmar foco no campo relacionado.
- Confirmar modal central de sucesso.

### Conexões

- Criar conexão.
- Editar conexão.
- Excluir conexão.
- Confirmar listagem em tempo real.

### Contatos

- Criar contato.
- Editar contato.
- Excluir contato.
- Confirmar vínculo com conexão.
- Confirmar filtro por conexão.

### Mensagens fake

- Criar mensagem enviada agora.
- Criar mensagem agendada.
- Editar mensagem.
- Excluir mensagem.
- Filtrar mensagens enviadas.
- Filtrar mensagens agendadas.
- Confirmar atualização em tempo real.

### Envio real de e-mail

- Criar contato com e-mail.
- Criar mensagem enviada agora com `Plus e-mail` marcado.
- Confirmar chamada da Function.
- Confirmar envio pela API PHP.

### Envio real de WhatsApp

- Criar contato com telefone válido.
- Criar mensagem enviada agora.
- Marcar `Plus WhatsApp`.
- Confirmar criação da mensagem.
- Confirmar recebimento no WhatsApp.
- Consultar logs da Function `sendWhatsappNotification`.

### Agendamento com WhatsApp

- Criar contato com telefone válido.
- Criar mensagem agendada para alguns minutos à frente.
- Marcar `Plus WhatsApp`.
- Aguardar a Function `processScheduledMessages`.
- Confirmar mudança para `sent`.
- Confirmar recebimento no WhatsApp.

### Exclusão de conta

- Criar conta.
- Criar conexão.
- Criar contato.
- Criar mensagem.
- Abrir Minha conta.
- Excluir a conta.
- Confirmar remoção do Auth.
- Confirmar remoção dos documentos no Firestore.
- Confirmar que e-mail/telefone podem ser reutilizados.

---

## Logs e diagnóstico

### Logs da exclusão de conta

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas
npx firebase-tools@latest functions:log --only deleteUserAccount --lines 100
```

### Logs do envio de WhatsApp

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas
npx firebase-tools@latest functions:log --only sendWhatsappNotification --lines 100
```

### Logs do processamento agendado

```powershell
cd C:\Users\vinic\Desktop\react\broadcast-saas
npx firebase-tools@latest functions:log --only processScheduledMessages --lines 100
```

Logs esperados quando não há mensagens vencidas:

```txt
scheduled_messages_started
scheduled_messages_none_due
```

### Verificar mini API Baileys

```powershell
curl.exe -s `
  -H "x-api-token: SEU_TOKEN" `
  "https://sistemasphp.com.br/whatsapp-baileys-api/api/whatsapp/status"
```

Resposta esperada:

```json
{
  "ok": true,
  "status": {
    "state": "connected",
    "connected": true
  }
}
```

---

## Coleções Firestore

### `users`

Armazena dados do perfil.

Campos principais:

```txt
id
ownerId
name
email
phone
companyName
profileCompleted
authProviders
emailUniqueValue
phoneUniqueValue
createdAt
updatedAt
```

### `connections`

Armazena conexões do usuário.

Campos principais:

```txt
id
ownerId
name
createdAt
updatedAt
```

### `contacts`

Armazena contatos vinculados a conexões.

Campos principais:

```txt
id
ownerId
connectionId
name
phone
email
createdAt
updatedAt
```

### `messages`

Armazena mensagens.

Campos principais:

```txt
id
ownerId
connectionId
contactIds
contactEmails
contactPhones
content
status
scheduledAt
sentAt
sendEmailCopy
sendWhatsappCopy
createdAt
updatedAt
```

Status possíveis:

```txt
scheduled
sent
```

### `user_unique_fields`

Controla reservas únicas de e-mail e telefone.

Campos principais:

```txt
type
userId
ownerId
valueHash
maskedValue
createdAt
updatedAt
```

Essa coleção não deve ser acessada diretamente pelo frontend.

---

## Decisões técnicas

### Sem subcoleções

O projeto foi implementado sem subcoleções para atender ao requisito do desafio e manter um modelo de dados simples e direto.

### Isolamento por `ownerId`

Todas as entidades operacionais usam `ownerId`, garantindo isolamento por cliente.

### Firestore em tempo real

As listagens usam `onSnapshot`, entregando atualização em tempo real sem recarregar a página.

### Validação crítica no backend

Regras sensíveis, como unicidade de e-mail e telefone, são feitas por Cloud Functions, não apenas no frontend.

### Functions como camada segura

Integrações externas são chamadas por Functions para evitar exposição de tokens ou URLs sensíveis no navegador.

### Paradigma funcional

A aplicação foi estruturada com:

- funções;
- hooks;
- services;
- schemas;
- components;
- tipos explícitos.

Não foi usada orientação a objeto como base da arquitetura.

### Material UI + TailwindCSS

Material UI foi usado para componentes visuais consistentes, enquanto TailwindCSS foi usado para layout, espaçamento e ajustes rápidos de interface.

---

## Segurança

Cuidados aplicados:

- dados isolados por `ownerId`;
- Firestore Rules validando permissões;
- `user_unique_fields` bloqueada ao frontend;
- tokens externos somente nas Functions;
- mini API Baileys protegida por `x-api-token`;
- frontend não acessa token do WhatsApp;
- exclusão de conta feita por Admin SDK;
- validação de duplicidade no backend;
- `.env` real não deve ser commitado;
- token exposto durante testes deve ser rotacionado.

Arquivos que não devem ir para o repositório:

```txt
web/.env.local
functions/.env
node_modules/
dist/
```

---

## Estado atual

Estado final validado:

- Firebase Hosting publicado.
- Login com e-mail/senha funcionando.
- Login com Google funcionando.
- Login com telefone/SMS funcionando.
- Complete Profile funcionando.
- Dashboard funcionando.
- CRUD de conexões funcionando.
- CRUD de contatos funcionando.
- CRUD de mensagens funcionando.
- Firestore em tempo real funcionando.
- Mensagens agendadas funcionando.
- Function `processScheduledMessages` ativa e rodando a cada minuto.
- Envio real de e-mail integrado por Function.
- Envio real de WhatsApp via Baileys integrado por Function.
- Function `sendWhatsappNotification` criada e publicada.
- Mini API Baileys validada em produção.
- Firestore Rules atualizadas para `contactPhones` e `sendWhatsappCopy`.
- Validação de e-mail duplicado funcionando.
- Validação de telefone duplicado funcionando.
- Exclusão completa de conta funcionando.
- Deploy completo validado com Functions, Rules e Hosting.

---

## Observação final

O projeto atende integralmente ao escopo do desafio prático e ainda inclui diferenciais relevantes para uma vaga Full Stack com foco em Firebase, React, TypeScript, SaaS e integrações com WhatsApp/Baileys.

O fluxo principal exigido pela vaga está implementado: autenticação, CRUDs, isolamento multiusuário, Firestore realtime, mensagens fake, mensagens agendadas e publicação no Firebase Hosting.

Como plus técnico, o projeto também demonstra integração real com serviços externos usando Cloud Functions como camada segura, incluindo e-mail real e WhatsApp real via Baileys.
