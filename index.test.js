const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

test("step 2 reframes the plan choice around delegation", () => {
  assert.match(html, /<h2 class="section-heading">Che tipo di affitto garantito vuoi attivare\?<\/h2>/);
  assert.match(html, /Entrambe le formule coprono fino a 12 mensilità e includono assistenza legale\./);
  assert.match(html, /Affitto Garantito simile a fideiussione assicurativa\./);
  assert.match(html, /Gestisci tu i pagamenti e ci attiviamo quando l'inquilino è in ritardo\./);
  assert.match(html, /Affitto Garantito con pagamento puntuale\./);
  assert.match(html, /Zero pensieri, pensiamo a tutto noi\./);
});

test("step 3 reframes payment as a live cost comparison", () => {
  assert.match(html, /<h2 class="section-heading">Modalità di pagamento<\/h2>/);
  assert.match(html, /id="payment-section-text" class="section-text">La scelta dipende dalle tue preferenze: pagamento unico iniziale oppure rate mensili costanti\./);
  assert.match(html, /id="payment-overview-title">Confronto sulla durata selezionata</);
  assert.match(html, /id="payment-single-mode" class="payment-mode">Una tantum</);
  assert.match(html, /id="payment-single-badge" class="option-badge hidden">Più conveniente</);
  assert.match(html, /id="payment-single-point-1">Paghi una mensilità completa una sola volta all'inizio\./);
  assert.match(html, /id="payment-monthly-title" class="option-title">MENSILIZZATA</);
  assert.match(html, /id="payment-monthly-contract">&euro;0,00</);
  assert.match(html, /function getPaymentContent\(singleQuote, monthlyQuote\)/);
  assert.match(html, /function updatePaymentComparison\(\)/);
});

test("step 4 becomes a final activation summary", () => {
  assert.match(html, /<h2 class="section-heading">Il tuo preventivo è pronto<\/h2>/);
  assert.match(html, /puoi scaricare il preventivo, richiedere l'attivazione o parlare con un operatore Domeo\./);
  assert.match(html, /id="summary-selection" class="final-title">/);
  assert.match(html, /id="summary-status-label" class="summary-label">Scelta ottimale</);
  assert.match(html, /id="summary-plan-compact" class="summary-value">FULL</);
  assert.match(html, /id="btn-talk-operator" class="ghost-button">Parla con un operatore</);
  assert.match(html, /id="btn-download-quote" class="ghost-button">Scarica preventivo</);
  assert.match(html, /id="btn-activate-service" class="primary-button">Attiva servizio</);
  assert.match(html, /function updateQuoteSummary\(quote\)/);
});

test("step 4 gates download and activation behind email capture", () => {
  assert.match(html, /<form id="lead-capture" class="lead-capture hidden">/);
  assert.match(html, /<label for="lead-email">Email<\/label>/);
  assert.match(html, /<input type="email" id="lead-email" placeholder="nome@azienda\.it" autocomplete="email" required>/);
  assert.match(html, /id="lead-capture-title" class="lead-capture-title">Dove vuoi ricevere il preventivo\?/);
  assert.match(html, /Inserisci la tua email per ricevere subito una copia del preventivo e scaricarla immediatamente\./);
  assert.match(html, /id="btn-lead-submit" class="primary-button">Invia e scarica il preventivo</);
  assert.match(html, /function openLeadCapture\(intent\)/);
  assert.match(html, /function handleLeadCapture\(event\)/);
  assert.match(html, /function escapeHtml\(value\)/);
  assert.match(html, /function downloadQuote\(email\)/);
  assert.match(html, /link\.download = "preventivo-domeo\.html"/);
  assert.match(html, /function notifyHostEvent\(type, detail\)/);
  assert.match(html, /notifyHostEvent\("preventivatore:lead-submit", payload\)/);
});

test("selectable cards stay keyboard accessible", () => {
  assert.match(
    html,
    /id="plan-start" class="option-card plan-card" role="button" tabindex="0" aria-pressed="false" aria-labelledby=/
  );
  assert.match(
    html,
    /id="payment-single" class="option-card payment-card" role="button" tabindex="0" aria-pressed="false" aria-labelledby=/
  );
  assert.match(html, /function bindSelectableCard\(element, onSelect\)/);
});

test("local runs keep the configured bootstrap step and load host sdk optionally", () => {
  assert.match(html, /const DEV_INITIAL_STEP = 4;/);
  assert.match(html, /<link rel="icon" href="data:,">/);
  assert.match(html, /function shouldLoadOptionalSdk\(\)/);
  assert.match(html, /async function loadScript\(src\)/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/element_sdk\.js"><\/script>/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/data_sdk\.js" type="text\/javascript"><\/script>/);
});
