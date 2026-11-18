/* ==========================================================================
   Frontzek · Kit de aceite das propostas
   Calculadora de pagamento + calendário de datas livres + aceitar / recusar.

   Na proposta:
     <section class="wrap" id="aceite"></section>
     <script>window.ACEITE = { proposta:"004", cliente:"…", trabalho:"…", valor:2000, dias:1 }</script>
     <script src="../kit/config.js"></script>
     <script src="../kit/aceite.js"></script>
   ========================================================================== */
(function () {
  const C = Object.assign({
    api: window.ACEITE_API || '',
    proposta: '000', cliente: '', trabalho: 'Trabalho', valor: 0,
    dias: 1,                 // quantas datas o cliente escolhe (diárias)
    datas: [],               // datas já combinadas: mostra travadas, sem escolher
    semDomingo: false,
    prazos: [
      { id: 'dia',    nome: 'No dia',         sub: 'Pix ou transferência no dia da captação', dias: 0,  taxa: 0 },
      { id: 'semana', nome: 'Em até 7 dias',  sub: 'Até uma semana depois da captação',       dias: 7,  taxa: 0 },
      { id: '30',     nome: '30 dias',        sub: 'Faturado para 30 dias',                   dias: 30, taxa: 5 },
      { id: '60',     nome: '60 dias',        sub: 'Faturado para 60 dias',                   dias: 60, taxa: 10 }
    ],
    whatsapp: '5511952412611',
    numero: '(11) 95241-2611'
  }, window.ACEITE || {});

  const root = document.getElementById('aceite');
  if (!root) return;

  /* ---------- estilo (usa as variáveis da identidade, com reserva) ---------- */
  const css = `
  #aceite{--a-bg2:var(--bg2,#121212);--a-line:var(--line,#262624);--a-fg:var(--fg,#EFECE6);--a-soft:var(--soft,#B5B2AA);--a-mute:var(--mute,#8A877F);--a-acc:var(--acc,#E10600);--a-ok:var(--ok,#3DDC6A);--a-mono:var(--mono,'IBM Plex Mono',monospace)}
  #aceite .ac-grid{display:grid;grid-template-columns:7fr 5fr;gap:12px;align-items:start}
  #aceite .ac-box{background:var(--a-bg2);border:1px solid var(--a-line);border-radius:14px;padding:26px}
  #aceite .ac-lbl{font-family:var(--a-mono);font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--a-mute);display:block;margin-bottom:14px}
  #aceite .ac-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  #aceite .ac-opt{all:unset;cursor:pointer;border:1px solid var(--a-line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px;transition:border-color .25s,background .25s}
  #aceite .ac-opt:hover{border-color:#3a3936}
  #aceite .ac-opt b{font-weight:800;font-stretch:115%;font-size:17px}
  #aceite .ac-opt span{color:var(--a-soft);font-size:13px}
  #aceite .ac-opt i{font-style:normal;font-family:var(--a-mono);font-size:11px;color:var(--a-mute)}
  #aceite .ac-opt.on{border-color:var(--a-fg);background:rgba(255,255,255,.03)}
  #aceite .ac-opt.on i{color:var(--a-acc)}
  #aceite .ac-total{margin-top:22px;border-top:1px solid var(--a-line);padding-top:18px}
  #aceite .ac-row{display:flex;justify-content:space-between;gap:16px;padding:6px 0;font-size:14px;color:var(--a-soft)}
  #aceite .ac-row b{color:var(--a-fg);font-weight:600}
  #aceite .ac-big{font-weight:900;font-stretch:125%;letter-spacing:-.05em;line-height:1;font-size:clamp(44px,5.5vw,72px);margin:10px 0 2px}
  #aceite .ac-big small{font-family:var(--a-mono);font-size:12px;font-weight:400;letter-spacing:.03em;color:var(--a-mute)}
  #aceite .ac-cal-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  #aceite .ac-cal-h b{font-weight:800;font-stretch:115%;text-transform:uppercase;letter-spacing:-.02em;font-size:18px}
  #aceite .ac-nav{all:unset;cursor:pointer;width:34px;height:34px;border-radius:50%;border:1px solid var(--a-line);display:grid;place-items:center;color:var(--a-soft)}
  #aceite .ac-nav:hover{border-color:var(--a-fg);color:var(--a-fg)}
  #aceite .ac-nav[disabled]{opacity:.25;pointer-events:none}
  #aceite .ac-week,#aceite .ac-days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
  #aceite .ac-week span{font-family:var(--a-mono);font-size:10px;color:var(--a-mute);text-align:center;padding:4px 0}
  #aceite .ac-day{all:unset;box-sizing:border-box;aspect-ratio:1;border-radius:10px;display:grid;place-items:center;font-size:14px;font-weight:600;cursor:pointer;border:1px solid var(--a-line);transition:background .2s,border-color .2s,color .2s}
  #aceite .ac-day:hover{border-color:var(--a-fg)}
  #aceite .ac-day.x{cursor:default;color:#6b6a65;border-color:transparent;text-decoration:line-through;background:repeating-linear-gradient(135deg,#141413 0 5px,#1d1d1c 5px 10px)}
  #aceite .ac-day.past{cursor:default;color:#3a3936;border-color:transparent}
  #aceite .ac-day.on{background:var(--a-fg);color:#0A0A0A;border-color:var(--a-fg)}
  #aceite .ac-day.lock{background:var(--a-acc);color:#fff;border-color:var(--a-acc);cursor:default}
  #aceite .ac-day.blank{visibility:hidden}
  #aceite .ac-leg{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-family:var(--a-mono);font-size:11px;color:var(--a-mute);text-transform:uppercase}
  #aceite .ac-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1px solid var(--a-line)}
  #aceite .ac-status{margin-top:10px;font-size:13px;color:var(--a-mute);min-height:18px}
  #aceite .ac-form{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:22px}
  #aceite .ac-in{all:unset;box-sizing:border-box;border:1px solid var(--a-line);border-radius:12px;padding:14px 16px;font-size:15px;color:var(--a-fg);width:100%}
  #aceite .ac-in::placeholder{color:var(--a-mute)}
  #aceite .ac-in:focus{border-color:var(--a-fg)}
  #aceite textarea.ac-in{grid-column:1/-1;min-height:90px;white-space:pre-wrap}
  #aceite .ac-acts{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;align-items:center}
  #aceite .ac-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:15px 24px;border-radius:99px;background:var(--a-fg);color:#0A0A0A;transition:background .25s,color .25s,opacity .25s}
  #aceite .ac-btn:hover{background:var(--a-acc);color:#fff}
  #aceite .ac-btn.ghost{background:transparent;color:var(--a-fg);border:1px solid var(--a-line)}
  #aceite .ac-btn.ghost:hover{border-color:var(--a-fg);background:transparent}
  #aceite .ac-btn[aria-disabled=true]{opacity:.35;pointer-events:none}
  #aceite .ac-err{color:var(--a-acc);font-size:14px}
  #aceite .ac-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
  #aceite .ac-done{text-align:left;padding:40px 26px}
  #aceite .ac-done h3{font-weight:900;font-stretch:125%;text-transform:uppercase;letter-spacing:-.05em;line-height:.9;font-size:clamp(44px,7vw,96px);margin:12px 0 18px}
  #aceite .ac-done p{color:var(--a-soft);font-size:17px;max-width:46ch;margin-bottom:26px}
  @media (max-width:900px){#aceite .ac-grid,#aceite .ac-form{grid-template-columns:1fr}#aceite .ac-opts{grid-template-columns:1fr}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- utilidades ---------- */
  const brl = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const br = s => { const d = parse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const travado = C.datas && C.datas.length > 0;
  const S = {
    prazo: C.prazos[0].id,
    sel: travado ? C.datas.slice() : [],
    ocupado: new Set(), ate: null, carregou: false,
    mes: travado ? parse(C.datas[0]) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  };
  S.mes = new Date(S.mes.getFullYear(), S.mes.getMonth(), 1);

  const prazo = () => C.prazos.find(p => p.id === S.prazo);
  const final = () => Math.round(C.valor * (1 + prazo().taxa / 100) * 100) / 100;
  const caiEm = () => {
    if (!S.sel.length) return '';
    const ult = parse(S.sel.slice().sort().pop());
    ult.setDate(ult.getDate() + prazo().dias);
    return ymd(ult);
  };

  /* ---------- layout ---------- */
  root.innerHTML = `
    <div class="sec-head rv in"><h2 class="xl">Fechar<span class="dot">.</span></h2><span class="mono">Proposta Nº ${esc(C.proposta)}</span></div>
    <div id="acMain">
      <div class="ac-grid">
        <div class="ac-box">
          <span class="ac-lbl">(1) Forma de pagamento</span>
          <div class="ac-opts" id="acOpts"></div>
          <div class="ac-total">
            <div class="ac-row"><span>Valor do trabalho</span><b>R$ ${brl(C.valor)}</b></div>
            <div class="ac-row"><span>Acréscimo do prazo</span><b id="acTaxa"></b></div>
            <div class="ac-big"><small>R$ </small><span id="acFinal"></span></div>
            <div class="ac-row"><span>Pagamento em</span><b id="acCai">escolha a data ao lado</b></div>
          </div>
        </div>
        <div class="ac-box">
          <span class="ac-lbl">(2) ${travado ? 'Data combinada' : C.dias > 1 ? `Escolha ${C.dias} datas` : 'Escolha a data'}</span>
          <div class="ac-cal-h"><button class="ac-nav" id="acPrev" aria-label="Mês anterior">←</button><b id="acMes"></b><button class="ac-nav" id="acNext" aria-label="Próximo mês">→</button></div>
          <div class="ac-week">${['S','T','Q','Q','S','S','D'].map(d => `<span>${d}</span>`).join('')}</div>
          <div class="ac-days" id="acDays"></div>
          <div class="ac-leg"><span><i style="background:var(--a-fg)"></i>Escolhida</span><span><i></i>Livre</span><span><i style="border-color:transparent;background:repeating-linear-gradient(135deg,#141413 0 2px,#2a2a28 2px 4px)"></i>Ocupada</span></div>
          <div class="ac-status" id="acStatus">Carregando a agenda…</div>
        </div>
      </div>
      <div class="ac-box" style="margin-top:12px">
        <span class="ac-lbl">(3) Seus dados</span>
        <div class="ac-form">
          <input class="ac-in" id="acNome" placeholder="Seu nome" autocomplete="name">
          <input class="ac-in" id="acContato" placeholder="WhatsApp ou e-mail" autocomplete="tel">
          <textarea class="ac-in" id="acObs" placeholder="Observação (opcional): horário, endereço, quem é o contato no dia…"></textarea>
          <input class="ac-hp" id="acSite" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        <div class="ac-acts">
          <button class="ac-btn" id="acSim">Aceitar proposta →</button>
          <button class="ac-btn ghost" id="acNao">Não vou seguir</button>
          <span class="ac-err" id="acErr"></span>
        </div>
      </div>
    </div>`;
  const $ = id => document.getElementById(id);

  /* ---------- calculadora ---------- */
  function renderOpts() {
    $('acOpts').innerHTML = C.prazos.map(p => `
      <button class="ac-opt ${p.id === S.prazo ? 'on' : ''}" data-id="${p.id}">
        <i>${p.taxa ? '+' + p.taxa + '%' : 'sem acréscimo'}</i><b>${esc(p.nome)}</b><span>${esc(p.sub || '')}</span>
      </button>`).join('');
    const p = prazo();
    $('acTaxa').textContent = p.taxa ? `+${p.taxa}% · R$ ${brl(final() - C.valor)}` : 'sem acréscimo';
    const [int, dec] = brl(final()).split(','); $('acFinal').innerHTML = `${int}<small>,${dec}</small>`;
    $('acCai').textContent = caiEm() ? br(caiEm()) : 'escolha a data ao lado';
  }
  $('acOpts').addEventListener('click', e => {
    const b = e.target.closest('.ac-opt'); if (!b) return;
    S.prazo = b.dataset.id; renderOpts(); check();
  });

  /* ---------- calendário ---------- */
  function renderCal() {
    const y = S.mes.getFullYear(), m = S.mes.getMonth();
    $('acMes').textContent = `${MESES[m]} ${y}`;
    const ini = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    let h = '';
    for (let i = 0; i < ini; i++) h += '<span class="ac-day blank"></span>';
    for (let d = 1; d <= total; d++) {
      const dt = new Date(y, m, d), k = ymd(dt);
      let cls = 'ac-day', dis = false;
      if (travado) { cls += S.sel.includes(k) ? ' lock' : ' past'; dis = true; }
      else if (dt < hoje || (S.ate && k > S.ate)) { cls += ' past'; dis = true; }
      else if (S.ocupado.has(k) || (C.semDomingo && dt.getDay() === 0)) { cls += ' x'; dis = true; }
      else if (S.sel.includes(k)) cls += ' on';
      h += `<button class="${cls}" data-k="${k}" ${dis ? 'disabled' : ''} aria-label="${d} de ${MESES[m]}">${d}</button>`;
    }
    $('acDays').innerHTML = h;
    $('acPrev').disabled = new Date(y, m, 1) <= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const lim = S.ate ? parse(S.ate) : null;
    $('acNext').disabled = !!(lim && new Date(y, m + 1, 1) > lim);
  }
  $('acDays').addEventListener('click', e => {
    const b = e.target.closest('.ac-day'); if (!b || b.disabled) return;
    const k = b.dataset.k, i = S.sel.indexOf(k);
    if (i >= 0) S.sel.splice(i, 1);
    else { if (S.sel.length >= C.dias) S.sel.shift(); S.sel.push(k); }
    S.sel.sort(); renderCal(); renderOpts(); check();
  });
  $('acPrev').onclick = () => { S.mes = new Date(S.mes.getFullYear(), S.mes.getMonth() - 1, 1); renderCal(); };
  $('acNext').onclick = () => { S.mes = new Date(S.mes.getFullYear(), S.mes.getMonth() + 1, 1); renderCal(); };

  function status() {
    const n = S.sel.length;
    if (travado) $('acStatus').textContent = 'Data já combinada: ' + S.sel.map(br).join(', ');
    else if (!S.carregou) $('acStatus').textContent = 'Não consegui ler a agenda agora: escolha a data e eu confirmo pelo WhatsApp.';
    else $('acStatus').textContent = n ? `Escolhida: ${S.sel.map(br).join(', ')}` : 'Os dias riscados já estão ocupados.';
  }

  async function carregarAgenda() {
    if (!C.api) { status(); renderCal(); return; }
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 9000);
    try {
      const r = await fetch(C.api + '?acao=agenda', { signal: ctrl.signal });
      const j = await r.json();
      if (j.ok) { S.ocupado = new Set(j.ocupado); S.ate = j.ate; S.carregou = true; S.sel = travado ? S.sel : S.sel.filter(k => !S.ocupado.has(k)); }
    } catch (e) { /* segue sem agenda */ }
    clearTimeout(t); renderCal(); status(); check();
  }

  /* ---------- envio ---------- */
  function check() {
    const ok = S.sel.length === (travado ? S.sel.length : C.dias) && S.sel.length > 0;
    $('acSim').setAttribute('aria-disabled', ok ? 'false' : 'true');
    if (!travado) status();
    return ok;
  }
  const wa = t => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t)}`;

  async function enviar(resposta) {
    $('acErr').textContent = '';
    const nome = $('acNome').value.trim(), contato = $('acContato').value.trim();
    if (resposta === 'aceite' && !check()) { $('acErr').textContent = 'Escolha a data primeiro.'; return; }
    if (!nome) { $('acErr').textContent = 'Coloca seu nome pra eu saber quem é.'; $('acNome').focus(); return; }
    const p = prazo();
    const dados = {
      resposta, proposta: C.proposta, cliente: C.cliente ? `${C.cliente} · ${nome}` : nome, trabalho: C.trabalho,
      datas: resposta === 'aceite' ? S.sel : [], prazo: p.nome, valor_base: C.valor, acrescimo_pct: p.taxa,
      valor_final: final(), cai_em: resposta === 'aceite' ? caiEm() : '', contato, motivo: $('acObs').value.trim(),
      site: $('acSite').value
    };
    const btn = $(resposta === 'aceite' ? 'acSim' : 'acNao'); const txt = btn.textContent;
    btn.textContent = 'Enviando…'; btn.setAttribute('aria-disabled', 'true');
    let ok = !C.api, erro = '';
    if (C.api) {
      try {
        const r = await fetch(C.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(dados) });
        const j = await r.json(); ok = !!j.ok; erro = j.erro || '';
        if (erro === 'ocupado') { j.datas.forEach(d => S.ocupado.add(d)); S.sel = S.sel.filter(d => !S.ocupado.has(d)); renderCal(); }
      } catch (e) { ok = false; erro = 'rede'; }
    }
    btn.textContent = txt; btn.setAttribute('aria-disabled', 'false'); check();
    if (!ok && erro === 'ocupado') { $('acErr').textContent = 'Essa data acabou de ser reservada. Escolhe outra?'; return; }
    if (!ok) { $('acErr').innerHTML = `Não consegui registrar agora. <a href="${wa(msg(dados))}" target="_blank" rel="noopener" style="color:inherit">Me manda pelo WhatsApp →</a>`; return; }
    feito(dados);
  }
  function msg(d) {
    return d.resposta === 'aceite'
      ? `Oi, Ana! Aqui é ${d.cliente}. Aceitei a proposta ${d.proposta} (${d.trabalho}) para ${d.datas.map(br).join(', ')}, pagamento ${d.prazo.toLowerCase()} — R$ ${brl(d.valor_final)}.`
      : `Oi, Ana! Aqui é ${d.cliente}. Sobre a proposta ${d.proposta}: dessa vez não vamos seguir.${d.motivo ? ' ' + d.motivo : ''}`;
  }
  function feito(d) {
    const sim = d.resposta === 'aceite';
    $('acMain').innerHTML = `<div class="ac-box ac-done">
      <span class="ac-lbl" style="color:${sim ? 'var(--a-ok)' : 'var(--a-mute)'}">${sim ? '● Proposta aceita' : '○ Resposta enviada'}</span>
      <h3>${sim ? 'Fechado<span class="dot">.</span>' : 'Valeu pelo<br>retorno<span class="dot">.</span>'}</h3>
      <p>${sim
        ? `Reservei ${d.datas.map(br).join(', ')} na minha agenda. Pagamento ${esc(d.prazo.toLowerCase())}: <b style="color:var(--a-fg)">R$ ${brl(d.valor_final)}</b>${d.cai_em ? ' até ' + br(d.cai_em) : ''}, com nota fiscal. Te chamo pra alinhar os detalhes.`
        : 'Recebi sua resposta. Se mudar alguma coisa ou quiser ajustar a proposta, é só me chamar.'}</p>
      <a class="ac-btn" href="${wa(msg(d))}" target="_blank" rel="noopener">${sim ? 'Avisar no WhatsApp →' : 'Falar no WhatsApp →'}</a>
    </div>`;
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('acSim').onclick = () => enviar('aceite');
  $('acNao').onclick = () => {
    const obs = $('acObs');
    if (!$('acNao').dataset.confirma) {
      $('acNao').dataset.confirma = '1'; $('acNao').textContent = 'Enviar resposta';
      obs.placeholder = 'Se puder, conta o motivo (valor, data, escopo…). Isso me ajuda a ajustar.'; obs.focus(); return;
    }
    enviar('recusa');
  };

  renderOpts(); renderCal(); check(); carregarAgenda();
})();
