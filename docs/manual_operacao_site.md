# Manual de Operação do Site (Docker + Cloudflare)

Este documento é o seu guia rápido. Ele contém todos os comandos necessários para ligar, desligar e fazer a manutenção do seu site de casamento utilizando a estrutura profissional que montamos (Docker Compose + Nginx + Cloudflare Tunnel).

---

## 1. Ligar e Desligar o Site

Sempre que você reiniciar o computador ou precisar gerenciar o site, abra o **Terminal do VS Code** na pasta do projeto (`d:\projetos\casamento\casamento`) e use os seguintes comandos:

### ▶️ Ligar o site e o túnel
```bash
docker compose up -d
```
*O que isso faz? Liga o servidor Nginx (seu site) e o Cloudflare Tunnel. O `-d` significa que vai rodar em segundo plano, ou seja, você pode fechar o terminal e o site continuará online.*

### ⏹️ Desligar o site e o túnel
```bash
docker compose down
```
*O que isso faz? Desliga tudo. Seu site ficará offline e os links pararão de funcionar imediatamente.*

### 🔄 Reiniciar tudo (Caso algo trave)
```bash
docker compose restart
```

---

## 2. Editando o Site (Não precisa reiniciar!)

Como o nosso arquivo `docker-compose.yml` foi criado mapeando a pasta raiz do seu projeto (`volumes: - ./:/usr/share/nginx/html`), o Docker consegue enxergar suas alterações **em tempo real**.

- Se você mudar algo no `index.html`, no CSS ou no JavaScript e salvar o arquivo, **não é necessário reiniciar o Docker**.
- Basta ir no navegador e dar **F5 (Atualizar)** que a alteração já estará lá, tanto no seu `localhost:7000` quanto no site oficial da Cloudflare!

---

## 3. Comandos Úteis para Diagnóstico (Deu problema?)

Se o site sair do ar e você não souber o motivo, estes comandos ajudam a entender:

### 👀 Ver se os sistemas estão rodando
```bash
docker ps
```
*Deve listar dois contêineres rodando: um do `nginx:alpine` e outro do `cloudflared`.*

### 📋 Ver os logs (Erros) do Túnel
```bash
docker compose logs cloudflared
```
*Se você rodar isso e ver "Unauthorized: Invalid tunnel secret", significa que o seu Token expirou e precisa ser trocado no arquivo.*

---

## 4. Troca de Token da Cloudflare (Se necessário)

Caso o túnel pare de funcionar de vez, ou você recrie o túnel lá no painel da Cloudflare:
1. Vá no painel da Cloudflare (Zero Trust > Tunnels).
2. Pegue o comando de instalação do Docker e copie o novo **Token** gigante.
3. Abra o arquivo `docker-compose.yml`.
4. Substitua o token na linha 14:
   `command: tunnel --no-autoupdate run --token SEU_NOVO_TOKEN_GIGANTE`
5. Salve o arquivo e rode: `docker compose up -d` (Isso vai recriar o túnel com o código novo automaticamente).
