const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

test("step 1 keeps the quote inputs primary and de-emphasizes the address", () => {
  assert.match(html, /<h1 id="main-title" class="section-heading hero-title">Confronta la formula giusta per il tuo affitto<\/h1>/);
  assert.match(html, /Inserisci i dati essenziali e confronta subito le opzioni\./);
  assert.match(html, /<label for="property-category">Categoria contratto<\/label>/);
  assert.match(html, /<label for="property-type">Tipologia contratto<\/label>/);
  assert.match(html, /id="property-type-field" class="field full hidden"/);
  assert.match(html, /<label for="rent">Canone mensile<\/label>/);
  assert.match(html, /<label for="condo-fees">Spese condominiali mensili<\/label>/);
  assert.match(html, /class="field full field-secondary">/);
  assert.match(html, /Aggiungi immobile <span class="field-optional">\(facoltativo\)<\/span>/);
  assert.match(html, /<span id="cta-calculate">Confronta le opzioni<\/span>/);
});

test("step 1 filters contract types by category and keeps variable durations unselected", () => {
  assert.match(html, /function populateContractCategories\(\)/);
  assert.match(html, /function syncContractTypeField\(\)/);
  assert.match(html, /getContractTypesByCategory\(propertyCategory\)/);
  assert.match(html, /propertyType\.innerHTML = '<option value="">Seleziona tipologia contratto\.\.\.<\/option>';/);
  assert.match(html, /document\.getElementById\("property-category"\)\.addEventListener\("change", syncContractTypeField\);/);
  assert.match(html, /'<option value="">Seleziona durata contratto\.\.\.<\/option>'/);
  assert.match(html, /durationSelect\.value = durationOptions\.some\(\(\{ value \}\) => value === currentDuration\)\s+\? String\(currentDuration\)\s+: "";/);
  assert.match(html, /if \(requiresDurationSelection\(contractTypeValue\) && !durationValue\) {\s+showToast\("Seleziona la durata del contratto", "error"\);/s);
});

test("step 2 compares outcomes in plain language and requires an explicit plan choice", () => {
  assert.match(html, /<span class="step-title">Copertura<\/span>/);
  assert.match(html, /<h2 class="section-heading">Chi vuoi che gestisca gli incassi\?<\/h2>/);
  assert.match(html, /La copertura resta la stessa: cambia il modo in cui ricevi i pagamenti e come vengono gestiti i ritardi\./);
  assert.match(html, /Fino a 12 mensilità coperte e assistenza legale incluse\./);
  assert.match(html, /<h3 id="plan-start-title" class="option-title">Ricevi tu i canoni<\/h3>/);
  assert.match(html, /Gestiti da te direttamente/);
  assert.match(html, /<p id="plan-start-name" class="plan-product-name">START<\/p>/);
  assert.match(html, /<h3 id="plan-full-title" class="option-title">Domeo gestisce i pagamenti<\/h3>/);
  assert.match(html, /Gestiti tramite Domeo/);
  assert.match(html, /<p id="plan-full-name" class="plan-product-name">FULL<\/p>/);
  assert.match(html, /\.plan-facts {\s+display: flex;\s+flex-direction: column;/s);
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

test("step 3 stays neutral, highlights importo protetto, and keeps mese per mese as the popular option", () => {
  assert.match(html, /<span class="step-title">Costo<\/span>/);
  assert.match(html, /<h2 class="section-heading">Come vuoi distribuire il costo\?<\/h2>/);
  assert.match(html, /Scegli solo come preferisci pagare il servizio\./);
  assert.match(html, /id="payment-single-mode" class="payment-mode">All'inizio</);
  assert.match(html, /id="payment-monthly-title" class="option-title">Ogni mese</);
  assert.match(html, /id="payment-overview-amount" class="comparison-banner-amount">/);
  assert.match(html, /id="payment-monthly-badge" class="option-badge">Più popolare</);
  assert.match(html, /<div class="payment-row"><span>All'inizio<\/span><strong id="payment-single-now">/);
  assert.match(html, /<div class="payment-row"><span>Ogni mese<\/span><strong id="payment-monthly-monthly">/);
  assert.match(html, /Prima dell'attivazione serve la verifica Domeo/);
  assert.match(html, /function setPaymentDisplay\(prefix, display\)/);
  assert.doesNotMatch(html, /shouldAutoSelectRecommendedPayment/);
  assert.match(html, /<button type="button" id="btn-step3" class="primary-button" disabled>\s+Vedi riepilogo/);
});

test("step 4 becomes a soft summary and lead capture experience", () => {
  assert.match(html, /<span class="step-title">Riepilogo<\/span>/);
  assert.match(html, /<h2 class="section-heading">Ecco il riepilogo<\/h2>/);
  assert.match(html, /Rivedi i dati essenziali e scegli il prossimo passo\./);
  assert.match(html, /id="btn-talk-operator" class="ghost-button">Apri la chat</);
  assert.match(html, /id="btn-download-quote" class="ghost-button">Ricevi il riepilogo</);
  assert.match(html, /id="btn-activate-service" class="primary-button">Avvia la verifica</);
  assert.doesNotMatch(html, /summary-status/);
  assert.match(html, /id="lead-capture-title" class="lead-capture-title">Dove ti inviamo il riepilogo\?/);
  assert.match(html, /id="btn-lead-submit" class="primary-button">Ricevi il riepilogo</);
  assert.match(html, /notifyHostEvent\("preventivatore:lead-submit", payload\)/);
  assert.match(html, /notifyHostEvent\("preventivatore:activation-request", payload\)/);
  assert.match(html, /notifyHostEvent\("preventivatore:chat-request", payload\)/);
});

test("public copy removes the old confusing terms", () => {
  assert.doesNotMatch(html, /fideiussione/i);
  assert.doesNotMatch(html, /mensilizzata/i);
  assert.doesNotMatch(html, /Formula consigliata/);
  assert.doesNotMatch(html, /Consigliata/);
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
