# Backend — RSVP Casamento ✦

API simples em Node.js + Express para receber confirmações de presença,
salvar no Google Sheets via SheetDB e gerar link de notificação no WhatsApp.

---

## Rotas

| Método | Rota         | Descrição                          |
|--------|--------------|------------------------------------|
| POST   | `/rsvp`      | Recebe e salva uma confirmação     |
| GET    | `/respostas` | Lista todas as respostas           |
| GET    | `/resumo`    | Totais: confirmados, adultos, etc. |

---

## Instalação local

```bash
# 1. Instale as dependências
npm install

# 2. Copie e preencha as variáveis de ambiente
cp .env.example .env
# → edite .env com sua SHEETDB_URL e WHATSAPP_NUMBER

# 3. Inicie o servidor
npm start
# ou, com hot-reload (Node 18+):
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Variáveis de Ambiente (`.env`)

| Variável           | Descrição                                    |
|--------------------|----------------------------------------------|
| `SHEETDB_URL`      | URL da API SheetDB da sua planilha           |
| `WHATSAPP_NUMBER`  | Número do organizador com DDI (ex: 5511...) |
| `PORT`             | Porta do servidor (padrão: 3000)             |

---

## Deploy gratuito no Render

1. Crie uma conta em [render.com](https://render.com)
2. **New → Web Service → Connect seu repositório GitHub**
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Em **Environment**, adicione as variáveis do `.env`
5. Deploy! A URL gerada substitui `http://localhost:3000` no frontend.

---

## Conectar ao Frontend

No arquivo `rsvp-casamento.html`, atualize o `CONFIG`:

```js
const CONFIG = {
  formEndpoint: "https://SEU-APP.onrender.com/rsvp", // ← URL do backend
  whatsappNumber: "5511999999999",
  waFloatMessage: "Olá! Tenho uma dúvida sobre o casamento.",
};
```

---

## Exemplo de requisição

```bash
curl -X POST http://localhost:3000/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Lima",
    "presenca": "Sim",
    "adultos": "2",
    "acompanhante_1": "Carlos Lima",
    "criancas": "1",
    "crianca_1": "Pedro Lima",
    "email": "ana@email.com",
    "telefone": "11999999999"
  }'
```

Resposta:
```json
{
  "sucesso": true,
  "mensagem": "Confirmação salva com sucesso!",
  "whatsappLink": "https://wa.me/5511999999999?text=..."
}
```
