# Análise de Requisitos: Site de Confirmação de Presença (RSVP)

Após a análise do arquivo `casamento.html`, identifiquei que se trata de uma aplicação front-end "single-page" (HTML, CSS e JavaScript consolidados no mesmo arquivo). O site já possui toda a interface e lógica de interatividade prontas.

Para que o site funcione corretamente e esteja pronto para o uso dos convidados, é necessário realizar os seguintes ajustes:

## 1. Configuração da API e Contato (Urgente)
No final do arquivo, na linha 605, há o objeto `CONFIG` que controla o destino das informações do formulário e o número do WhatsApp.

*   **`formEndpoint`**: O link atual (`https://sheetdb.io/api/v1/n9hdghp2xfvt5`) provavelmente é de teste.
    *   **O que fazer**: Você precisa criar uma planilha no Google Sheets, integrá-la ao **SheetDB** (ou usar o **Formspree**) e substituir esse link pela URL gerada para a sua planilha. Se isso não for feito, as confirmações de presença não serão salvas na sua planilha.
*   **`whatsappNumber`**: Está configurado com `5511999999999`.
    *   **O que fazer**: Substituir pelo número real de WhatsApp que receberá as mensagens (código do país + DDD + número).

## 2. Personalização dos Textos
Os textos atuais do site são exemplos (thaynara e Francismar). Procure no arquivo HTML por esses trechos e substitua com os dados reais do evento:

*   **Nomes**: Linha 6 (`<title>`), linha 460 (`<h1 class="hero-names">`), linha 591 (Rodapé), linha 615 (`waFloatMessage`).
*   **Data e Local**: Linha 458 (`<p class="label-date">14 de Março de 2026 · São Paulo</p>`).
*   **Prazo de Confirmação**: Linha 467 (`até <strong>28 de Fevereiro</strong>`).

## 3. Hospedagem (Publicação do Site)
Atualmente, o site está salvo localmente no seu computador. Para que os convidados possam acessá-lo pelo celular, ele precisa estar na internet.

*   **O que fazer**: Hospedar o arquivo `casamento.html` em um servidor.
*   **Opções recomendadas (gratuitas e fáceis)**:
    *   **Vercel** ou **Netlify**: Basta arrastar a pasta do projeto para esses sites que eles geram um link na hora.
    *   **GitHub Pages**: Ótimo se você for manter o controle de versão do projeto.

## 4. Observação sobre a Arquitetura
O arquivo `casamento.html` está configurado para salvar os dados diretamente na planilha via SheetDB de forma autônoma. 
Caso o seu objetivo final seja ter uma API local própria (como sugerido em conversas anteriores do seu projeto) rodando com Node.js para disparar as mensagens do WhatsApp por um robô, a URL do `formEndpoint` deverá apontar para o seu servidor local (ex: `http://localhost:3000/api/confirmar`) e não para o SheetDB. Se o intuito for usar a versão simplificada que apenas abre o app do WhatsApp no celular do convidado, a estrutura atual já está perfeita, precisando apenas da revisão dos links do passo 1.
