require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ─────────────────────────────────────────────
   POST /rsvp  — recebe dados do formulário
──────────────────────────────────────────────── */
app.post("/rsvp", async (req, res) => {
  const dados = req.body;

  if (!dados.nome || !dados.presenca) {
    return res.status(400).json({ erro: "Nome e presença são obrigatórios." });
  }

  try {
    /* 1️⃣  Salva no Google Sheets via SheetDB */
    // Transforma os dados em múltiplas linhas
    const dataHora = new Date().toLocaleString('pt-BR');
    const telefoneStr = dados.telefone || "";
    const sheetRows = [];

    if (dados.presenca === 'Sim') {
      // Adiciona o Titular
      sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": dados.nome, "Identificacao": "Titular", "Telefone": telefoneStr });

      // Adiciona os Acompanhantes
      const acomp = Object.entries(dados)
        .filter(([k]) => k.startsWith("acompanhante_"))
        .map(([, v]) => v).filter(Boolean);
      acomp.forEach(c => sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": c, "Identificacao": "Acompanhante", "Telefone": telefoneStr }));

      // Adiciona as Crianças
      const crian = Object.entries(dados)
        .filter(([k]) => k.startsWith("crianca_"))
        .map(([, v]) => v).filter(Boolean);
      crian.forEach(c => sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": c, "Identificacao": "Criança", "Telefone": telefoneStr }));
    } else {
      // Caso não vá comparecer
      sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": dados.nome + " (Ausente)", "Identificacao": "Titular", "Telefone": telefoneStr });
    }

    const sheetRes = await fetch(process.env.SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: sheetRows }),
    });

    if (!sheetRes.ok) {
      const msg = await sheetRes.text();
      throw new Error("SheetDB: " + msg);
    }

    /* 2️⃣  Monta link WhatsApp para o organizador */
    const waLink = montarLinkWA(dados);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Confirmação salva com sucesso!",
      whatsappLink: waLink,
    });

  } catch (err) {
    console.error("Erro ao processar RSVP:", err.message);
    return res.status(500).json({ erro: "Não foi possível salvar. Tente novamente." });
  }
});

/* ─────────────────────────────────────────────
   GET /respostas  — lista todas as respostas
──────────────────────────────────────────────── */
app.get("/respostas", async (req, res) => {
  try {
    const r = await fetch(process.env.SHEETDB_URL);
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar respostas." });
  }
});

/* ─────────────────────────────────────────────
   GET /resumo  — totais rápidos
──────────────────────────────────────────────── */
app.get("/resumo", async (req, res) => {
  try {
    const r = await fetch(process.env.SHEETDB_URL);
    const rows = await r.json();

    const confirmados = rows.filter(r => r.presenca === "Sim");
    const recusados = rows.filter(r => r.presenca === "Não");
    const totalAdultos = confirmados.reduce((acc, r) => acc + (parseInt(r.adultos) || 0), 0);
    const totalCriancas = confirmados.reduce((acc, r) => acc + (parseInt(r.criancas) || 0), 0);

    return res.status(200).json({
      total: rows.length,
      confirmados: confirmados.length,
      recusados: recusados.length,
      totalAdultos,
      totalCriancas,
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao calcular resumo." });
  }
});

/* ─────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */
function montarLinkWA(d) {
  let msg = `✦ Confirmação de Presença ✦\n\n`;
  msg += `*Nome:* ${d.nome}\n`;
  msg += `*Presença:* ${d.presenca}\n`;

  if (d.presenca === "Sim") {
    msg += `*Adultos:* ${d.adultos || 1}\n`;

    const acomp = Object.entries(d)
      .filter(([k]) => k.startsWith("acompanhante_"))
      .map(([, v]) => v).filter(Boolean);
    if (acomp.length) msg += `*Acompanhantes:* ${acomp.join(", ")}\n`;

    const crian = Object.entries(d)
      .filter(([k]) => k.startsWith("crianca_"))
      .map(([, v]) => v).filter(Boolean);
    if (crian.length) msg += `*Crianças:* ${crian.join(", ")}\n`;
  }

  if (d.email) msg += `*E-mail:* ${d.email}\n`;
  if (d.telefone) msg += `*Telefone:* ${d.telefone}\n`;

  const numero = process.env.WHATSAPP_NUMBER || "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

/* ─────────────────────────────────────────────
   Start
──────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✦ Servidor rodando em http://localhost:${PORT}`);
});