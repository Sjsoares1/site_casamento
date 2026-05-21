# Guia: Colocando o Site Online com Docker e Cloudflare Tunnel

Este documento explica os passos exatos para rodar o seu site de casamento utilizando o **Docker** em conjunto com o **Cloudflare Tunnel**, o que garantirá que o seu site fique online e acessível para todos os convidados pela internet.

---

## Entendendo o problema do "localhost"

Como você configurou um túnel do Cloudflare para rodar através do Docker, existe um detalhe técnico importante: **dentro de um contêiner Docker, a palavra `localhost` significa o próprio contêiner**, e não o seu computador físico onde o site está rodando.

Por causa disso, se o Cloudflare tentar acessar `http://localhost:8080`, ele não vai achar o seu site. Temos duas formas excelentes de resolver isso:

---

## Opção 1: Tudo dentro do Docker (ALTAMENTE RECOMENDADO ⭐)

Esta é a abordagem mais profissional. Nós criaremos um único arquivo que instrui o Docker a rodar **dois** sistemas simultaneamente:
1. Um servidor de internet levíssimo (Nginx) para rodar o seu site HTML.
2. O túnel da Cloudflare que você criou.

### Passo 1: Ajuste no Painel da Cloudflare
Vá no painel da Cloudflare onde você configurou a "URL do serviço" e troque de `http://localhost:8080` para:
> **`http://web:80`**

*(Ao usar o nome `web`, os contêineres do Docker conseguem se comunicar entre si de forma mágica e segura).*

### Passo 2: Criar o arquivo `docker-compose.yml`
Abra o seu VS Code, e na pasta principal do projeto (`d:\projetos\casamento\casamento\`), crie um novo arquivo chamado exatamente **`docker-compose.yml`**.

Cole o seguinte código dentro dele:

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    volumes:
      - ./:/usr/share/nginx/html
    ports:
      - "8080:80"

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token eyJhIjoiZDcyMTg2N2E2YjhhYWM0ZjI0ZDRjN2ZmOTc2ZTY3ZDIiLCJ0IjoiOTkwZjliNDEtZTIxOS00NjlkLTljMmUtMDM2NTY4NjAxNDNiIiwicyI6Ik9HSmtaVFptWldZdE5USm1ZeTAwTUdFMExUbGpNek10WlRObU9UTXdNamN4TlRreSJ9
    restart: unless-stopped
    depends_on:
      - web
```

### Passo 3: Colocar o site no ar
No terminal do seu projeto, apenas rode o comando:
```bash
docker compose up -d
```
Pronto! Seu site está online e roteado pela Cloudflare. O `-d` significa que ele vai rodar em segundo plano e você pode fechar o terminal.

*(Para desligar no futuro, basta usar o comando: `docker compose down`)*

---

## Opção 2: Site no Windows (http-server) + Túnel no Docker

Se você preferir manter o esquema de usar o comando `http-server` que aprendemos agora pouco, e rodar o túnel da Cloudflare separado, você precisará usar um "truque" de rede do Docker.

### Passo 1: Ajuste no Painel da Cloudflare
Vá no painel da Cloudflare e troque a URL do serviço de `http://localhost:8080` para:
> **`http://host.docker.internal:8080`**

*(Esse endereço `host.docker.internal` é a forma que o Docker tem para se comunicar com o sistema Windows de fora do contêiner).*

### Passo 2: Rodar o Site Local
Abra um terminal na pasta do projeto e ligue o seu site:
```bash
http-server
```

### Passo 3: Ligar o Túnel (em outro terminal)
Abra um **NOVO** terminal (sem fechar o primeiro) e cole o comando exato que a Cloudflare te deu:
```bash
docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJhIjoiZDcyMTg2N2E2YjhhYWM0ZjI0ZDRjN2ZmOTc2ZTY3ZDIiLCJ0IjoiOTkwZjliNDEtZTIxOS00NjlkLTljMmUtMDM2NTY4NjAxNDNiIiwicyI6Ik9HSmtaVFptWldZdE5USm1ZeTAwTUdFMExUbGpNek10WlRObU9UTXdNamN4TlRreSJ9
```

Pronto! Agora o túnel no Docker consegue "enxergar" o `http-server` rodando no seu Windows.

---

### Qual eu escolho?
Definitivamente a **Opção 1**. Com o arquivo `docker-compose.yml`, você nunca mais precisa abrir múltiplos terminais e o seu site será servido pelo Nginx (um dos servidores mais estáveis e rápidos do mundo).
