/* ────────────────────────────────────────────
   DOM refs
──────────────────────────────────────────────── */
const form = document.getElementById('rsvp-form');
const presenceRadios = document.querySelectorAll('input[name="presenca"]');
const presenceFields = document.getElementById('presence-fields');
const absenceMsg = document.getElementById('absence-msg');
const adultsSelect = document.getElementById('adultos');
const childrenSelect = document.getElementById('criancas');
const companionsGroup = document.getElementById('companions-group');
const companionsBox = document.getElementById('companions-container');
const childrenGroup = document.getElementById('children-group');
const childrenBox = document.getElementById('children-container');
const btnSubmit = document.getElementById('btn-submit');
const successBox = document.getElementById('success-box');
const errorBox = document.getElementById('error-box');
const waConfirmLink = document.getElementById('wa-confirm-link');
const waFloatBtn = document.getElementById('wa-float-btn');

/* ── Botão flutuante ─── */
waFloatBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.waFloatMessage)}`;

/* ── Presença sim/não ─── */
presenceRadios.forEach(r => r.addEventListener('change', () => {
  const yes = document.querySelector('input[name="presenca"]:checked')?.value === 'Sim';
  presenceFields.style.display = yes ? '' : 'none';
  absenceMsg.style.display = yes ? 'none' : '';
  btnSubmit.textContent = yes ? 'Confirmar Presença' : 'Enviar Resposta';
}));

/* ── Nomes dinâmicos ─── */
function buildDynamicFields(container, count, prefix, placeholder) {
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'dynamic-name-input';
    wrap.innerHTML = `
      <span class="name-index">${String(i).padStart(2, '0')}</span>
      <input type="text" name="${prefix}_${i}" placeholder="${placeholder} ${i}" />
    `;
    container.appendChild(wrap);
  }
}

adultsSelect.addEventListener('change', () => {
  const total = parseInt(adultsSelect.value, 10);
  const companions = total - 1;
  if (companions > 0) {
    companionsGroup.style.display = '';
    buildDynamicFields(companionsBox, companions, 'acompanhante', 'Nome do acompanhante');
  } else {
    companionsGroup.style.display = 'none';
    companionsBox.innerHTML = '';
  }
});

childrenSelect.addEventListener('change', () => {
  const n = parseInt(childrenSelect.value, 10);
  if (n > 0) {
    childrenGroup.style.display = '';
    buildDynamicFields(childrenBox, n, 'crianca', 'Nome da criança');
  } else {
    childrenGroup.style.display = 'none';
    childrenBox.innerHTML = '';
  }
});

/* ── Submit ─── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validação mínima
  const nome = document.getElementById('nome').value.trim();
  const presenca = document.querySelector('input[name="presenca"]:checked')?.value;
  if (!nome || !presenca) {
    alert('Por favor, preencha seu nome e confirme sua presença.');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner"></span>Enviando…';

  // Coleta dados do formulário
  const fData = new FormData(form);
  const data = {};
  fData.forEach((v, k) => { data[k] = v; });

  // Monta lista de nomes para o WhatsApp e para o SheetDB
  const adultos = parseInt(data.adultos || '1', 10);
  const criancas = parseInt(data.criancas || '0', 10);
  const companions = [];
  const children = [];

  for (let i = 1; i < adultos; i++) {
    const n = (data[`acompanhante_${i}`] || '').trim();
    if (n) companions.push(n);
  }
  for (let i = 1; i <= criancas; i++) {
    const n = (data[`crianca_${i}`] || '').trim();
    if (n) children.push(n);
  }

  // Prepara as linhas separadas para o SheetDB
  const dataHora = new Date().toLocaleString('pt-BR');
  const telefoneStr = data.telefone || "";
  const sheetRows = [];

  if (presenca === 'Sim') {
    sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": nome, "Identificacao": "Titular", "Telefone": telefoneStr });
    companions.forEach(c => sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": c, "Identificacao": "Acompanhante", "Telefone": telefoneStr }));
    children.forEach(c => sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": c, "Identificacao": "Criança", "Telefone": telefoneStr }));
  } else {
    sheetRows.push({ "Data/Hora": dataHora, "Nome Completo": nome + " (Ausente)", "Identificacao": "Titular", "Telefone": telefoneStr });
  }

  // Envia para SheetDB / Formspree
  try {
    const isSheetDB = CONFIG.formEndpoint.includes('sheetdb.io');
    const body = isSheetDB ? JSON.stringify({ data: sheetRows }) : JSON.stringify(data);
    const contentType = 'application/json';

    const res = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': contentType, 'Accept': 'application/json' },
      body,
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    // Monta mensagem WhatsApp
    let waMsg = `✦ Confirmação de Presença ✦\n\n`;
    waMsg += `*Nome:* ${nome}\n`;
    waMsg += `*Presença:* ${presenca}\n`;

    if (presenca === 'Sim') {
      waMsg += `*Adultos:* ${adultos}\n`;
      if (companions.length) waMsg += `*Acompanhantes:* ${companions.join(', ')}\n`;
      if (children.length) waMsg += `*Crianças:* ${children.join(', ')}\n`;
    }

    if (data.email) waMsg += `*E-mail:* ${data.email}\n`;
    if (data.telefone) waMsg += `*Telefone:* ${data.telefone}\n`;

    waConfirmLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

    form.style.display = 'none';
    successBox.style.display = 'block';

  } catch (err) {
    console.error(err);
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Confirmar Presença';
    errorBox.style.display = 'block';
    setTimeout(() => { errorBox.style.display = 'none'; }, 6000);
  }
});
