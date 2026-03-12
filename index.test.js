const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

test("step 1 keeps the quote inputs primary and de-emphasizes the address", () => {
  assert.match(html, /<h1 id="main-title" class="section-heading hero-title">Confronta la formula giusta per il tuo affitto<\/h1>/);
  assert.match(html, /Inserisci i dati essenziali e confronta subito le opzioni\./);
  assert.match(html, /<label for="property-type">Tipologia contratto<\/label>/);
  assert.match(html, /<label for="rent">Canone mensile<\/label>/);
  assert.match(html, /<label for="condo-fees">Spese condominiali mensili<\/label>/);
  assert.match(html, /class="field full field-secondary">/);
  assert.match(html, /Aggiungi immobile <span class="field-optional">\(facoltativo\)<\/span>/);
  assert.match(html, /<span id="cta-calculate">Confronta le opzioni<\/span>/);
});

test("step 2 compares outcomes in plain language and requires an explicit plan choice", () => {
  assert.match(html, /<span class="step-title">Copertura<\/span>/);
  assert.match(html, /<h2 class="section-heading">Chi vuoi che gestisca gli incassi\?<\/h2>/);
  assert.match(html, /La copertura resta la stessa: cambia il modo in cui ricevi i pagamenti e come vengono gestiti i ritardi\./);
  assert.match(html, /<h3 id="plan-start-title" class="option-title">Gestisci tu gli incassi<\/h3>/);
  assert.match(html, /<p id="plan-start-name" class="plan-product-name">START<\/p>/);
  assert.match(html, /<h3 id="plan-full-title" class="option-title">Domeo ti paga ogni mese<\/h3>/);
  assert.match(html, /<p id="plan-full-name" class="plan-product-name">FULL<\/p>/);
  assert.match(html, /<button type="button" id="btn-step2" class="primary-button" disabled>/);
  assert.match(html, /step2Button\.disabled = !plan;/);
});

test("top stepper uses buttons and keeps navigation stateful", () => {
  assert.match(html, /<button type="button" id="step-1" class="step-item is-active" aria-current="step" aria-label="Vai al passo 1: Immobile">/);
  assert.match(html, /<button type="button" id="step-4" class="step-item is-upcoming" aria-label="Vai al passo 4: Riepilogo">/);
  assert.match(html, /function navigateToStep\(step\)/);
  assert.match(html, /if \(step <= currentStep\) return true;/);
  assert.match(html, /Object\.entries\(progressSteps\)\.forEach\(\(\[stepKey, stepEl\]\) => {\s+stepEl\.addEventListener\("click", \(\) => navigateToStep\(Number\(stepKey\)\)\);\s+}\);/s);
  assert.doesNotMatch(html, /document\.getElementById\("btn-step2"\)\.addEventListener\("click", \(\) => {\s+resetPaymentSelection\(\);/s);
});

test("step 3 reframes pricing as a cost distribution comparison and auto-selects the recommendation", () => {
  assert.match(html, /<span class="step-title">Costo<\/span>/);
  assert.match(html, /<h2 class="section-heading">Come vuoi distribuire il costo\?<\/h2>/);
  assert.match(html, /id="payment-single-mode" class="payment-mode">Più all'inizio</);
  assert.match(html, /id="payment-monthly-title" class="option-title">Mese per mese</);
  assert.match(html, /<div class="payment-row"><span>Quota iniziale<\/span><strong id="payment-single-now">/);
  assert.match(html, /<div class="payment-row"><span>Quota mensile<\/span><strong id="payment-monthly-monthly">/);
  assert.match(html, /<div class="payment-row"><span>Totale stimato<\/span><strong id="payment-monthly-contract">/);
  assert.match(html, /if \(!selectedPayment\) {\s+selectPayment\(recommendedPayment\);/);
  assert.match(html, /<button type="button" id="btn-step3" class="primary-button" disabled>\s+Vedi riepilogo/);
});

test("step 4 becomes a soft summary and lead capture experience", () => {
  assert.match(html, /<span class="step-title">Riepilogo<\/span>/);
  assert.match(html, /<h2 class="section-heading">Ecco il riepilogo<\/h2>/);
  assert.match(html, /Nessun pagamento o impegno in questa fase\./);
  assert.match(html, /id="summary-status-label" class="summary-label">Formula consigliata</);
  assert.match(html, /id="btn-talk-operator" class="ghost-button">Parla con un operatore</);
  assert.match(html, /id="btn-download-quote" class="primary-button">Ricevi il riepilogo</);
  assert.doesNotMatch(html, /btn-activate-service/);
  assert.match(html, /id="lead-capture-title" class="lead-capture-title">Dove ti inviamo il riepilogo\?/);
  assert.match(html, /id="btn-lead-submit" class="primary-button">Invia riepilogo</);
  assert.match(html, /notifyHostEvent\("preventivatore:lead-submit", payload\)/);
});

test("public copy removes the old confusing terms", () => {
  assert.doesNotMatch(html, /fideiussione/i);
  assert.doesNotMatch(html, /attivazione/i);
  assert.doesNotMatch(html, /mensilizzata/i);
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
  assert.match(html, /const DEV_INITIAL_STEP = 1;/);
  assert.match(html, /<link rel="icon" href="data:,">/);
  assert.match(html, /function shouldLoadOptionalSdk\(\)/);
  assert.match(html, /async function loadScript\(src\)/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/element_sdk\.js"><\/script>/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/data_sdk\.js" type="text\/javascript"><\/script>/);
});
