const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

test("step 1 keeps the quote inputs primary and de-emphasizes the address", () => {
  assert.match(html, /<h1 id="main-title" class="section-heading hero-title">Confronta la formula giusta per il tuo affitto<\/h1>/);
  assert.match(html, /Inserisci i dati essenziali e confronta subito le opzioni\./);
  assert.match(html, /<p id="property-category-label" class="field-label">Categoria contratto<\/p>/);
  assert.match(html, /<div id="property-category" class="choice-grid" role="radiogroup" aria-labelledby="property-category-label"><\/div>/);
  assert.match(html, /<p id="property-type-label" class="field-label">Tipologia contratto<\/p>/);
  assert.match(html, /id="property-type-field" class="field full hidden"/);
  assert.match(html, /<div id="property-type" class="choice-grid" role="radiogroup" aria-labelledby="property-type-label"><\/div>/);
  assert.match(html, /<label for="rent">Canone mensile<\/label>/);
  assert.match(html, /<label for="condo-fees">Spese condominiali mensili<\/label>/);
  assert.match(html, /class="field full field-secondary">/);
  assert.match(html, /Aggiungi immobile <span class="field-optional">\(facoltativo\)<\/span>/);
  assert.match(html, /<span id="cta-calculate">Confronta le opzioni<\/span>/);
  assert.doesNotMatch(html, /<select id="property-category"/);
  assert.doesNotMatch(html, /<select id="property-type"/);
});

test("step 1 filters contract types by category and keeps variable durations unselected", () => {
  assert.match(html, /function syncChoiceGroupSelection\(groupName\)/);
  assert.match(html, /function getCheckedRadioValue\(groupName\)/);
  assert.match(html, /function setCheckedRadioValue\(groupName, value\)/);
  assert.match(html, /function renderRadioGroup\(groupId, options, selectedValue = ""\)/);
  assert.match(html, /function populateContractCategories\(\)/);
  assert.match(html, /function syncContractTypeField\(\)/);
  assert.match(html, /renderRadioGroup\("property-category", CONTRACT_CATEGORIES\);/);
  assert.match(html, /getContractTypesByCategory\(propertyCategory\)/);
  assert.match(html, /renderRadioGroup\(\s+"property-type",\s+contractTypes,\s+contractTypes\.some\(\(\{ value \}\) => value === currentType\) \? currentType : ""\s+\);/s);
  assert.match(html, /document\.getElementById\("property-category"\)\.addEventListener\("change", \(\) => {\s+syncChoiceGroupSelection\("property-category"\);\s+syncContractTypeField\(\);\s+}\);/s);
  assert.match(html, /'<option value="">Seleziona durata contratto\.\.\.<\/option>'/);
  assert.match(html, /durationSelect\.value = durationOptions\.some\(\(\{ value \}\) => value === currentDuration\)\s+\? String\(currentDuration\)\s+: "";/);
  assert.match(html, /if \(requiresDurationSelection\(contractTypeValue\) && !durationValue\) {\s+showToast\("Seleziona la durata del contratto", "error"\);/s);
});

test("step 2 compares outcomes in plain language and requires an explicit plan choice", () => {
  assert.match(html, /<p class="section-kicker">Copertura<\/p>/);
  assert.match(html, /<h2 class="section-heading">Chi vuoi che gestisca gli incassi\?<\/h2>/);
  assert.match(html, /La copertura resta la stessa: cambia il modo in cui ricevi i pagamenti e come vengono gestiti i ritardi\./);
  assert.match(html, /Fino a 12 mensilità coperte e assistenza legale incluse\./);
  assert.match(html, /id="plan-start" class="option-card plan-card plan-card--start"/);
  assert.match(html, /<div class="plan-card-copy">\s*<p id="plan-start-ownership" class="plan-ownership">Gestiti da te direttamente<\/p>\s*<h3 id="plan-start-title" class="option-title">Ricevi tu i canoni<\/h3>/s);
  assert.match(html, /<h3 id="plan-start-title" class="option-title">Ricevi tu i canoni<\/h3>/);
  assert.match(html, /Gestiti da te direttamente/);
  assert.doesNotMatch(html, /id="plan-start-name"/);
  assert.match(html, /<div class="plan-fact"><span>Pagamenti<\/span><span class="plan-owner is-user">A recupero<\/span><\/div>/);
  assert.match(html, /id="plan-full" class="option-card plan-card plan-card--full"/);
  assert.match(html, /<div class="plan-card-copy">\s*<p id="plan-full-ownership" class="plan-ownership">Gestiti tramite Domeo<\/p>\s*<h3 id="plan-full-title" class="option-title">Domeo gestisce i pagamenti<\/h3>/s);
  assert.match(html, /<h3 id="plan-full-title" class="option-title">Domeo gestisce i pagamenti<\/h3>/);
  assert.match(html, /Gestiti tramite Domeo/);
  assert.doesNotMatch(html, /id="plan-full-name"/);
  assert.match(html, /<span class="option-badge">Più popolare<\/span>/);
  assert.match(html, /\.step-2-body {\s+gap: 22px;/s);
  assert.match(html, /\.plan-facts {\s+display: flex;\s+flex-direction: column;\s+width: calc\(100% \+ 44px\);[\s\S]*border-top: 1px solid var\(--border-color\);[\s\S]*border-radius: 0 0 15px 15px;\s+background: #f8fafc;/s);
  assert.match(html, /\.step-2-note {\s+display: flex;\s+flex-direction: column;\s+gap: 4px;/s);
  assert.match(html, /\.step-2-actions {\s+border-top: 0;\s+padding-top: 10px;\s+margin-top: 0;/s);
  assert.doesNotMatch(html, /\.plan-fact \+ \.plan-fact {\s+border-top:/s);
  assert.match(html, /<div class="plan-fact"><span>Pagamenti<\/span><span class="plan-owner is-user">A recupero<\/span><\/div>/);
  assert.match(html, /\.plan-owner {\s+min-width: 0;\s+min-height: 0;\s+padding: 0;\s+border-radius: 0;\s+background: none;\s+font-size: 16px;\s+line-height: 1\.3;\s+font-weight: 700;\s+text-align: right;\s+}/s);
  assert.match(html, /\.plan-owner\.is-domeo {\s+color: var\(--primary-color\);\s+}/s);
  assert.match(html, /\.plan-owner\.is-user {\s+color: #374151;\s+}/s);
  assert.doesNotMatch(html, /\.plan-card--full \.plan-card-header {\s+position: relative;/s);
  assert.match(html, /\.plan-card--full \.option-badge {\s+position: absolute;\s+top: -10px;\s+right: -15px;[\s\S]*box-shadow: 0 2px 8px rgba\(37,99,235,0.14\);/s);
  assert.match(html, /\.plan-card--full \.option-check {\s+top: 26px;\s+right: 18px;\s+}/s);
  assert.match(html, /<div class="step-2-note">[\s\S]*<strong class="decision-note-title">Fino a 12 mensilità coperte e assistenza legale incluse\.<\/strong>[\s\S]*<p class="decision-note-text">Scegli solo se vuoi gestire tu gli incassi o delegarli a Domeo\.<\/p>[\s\S]*<\/div>/);
  assert.match(html, /<div class="action-row step-2-actions">/);
  assert.doesNotMatch(html, /decision-banner/);
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
  assert.match(html, /<p class="section-kicker">Costo<\/p>/);
  assert.match(html, /<h2 class="section-heading">Come vuoi distribuire il costo\?<\/h2>/);
  assert.match(html, /Scegli solo come preferisci pagare il servizio\./);
  assert.match(html, /id="payment-single-mode" class="payment-mode">Una tantum</);
  assert.match(html, /id="payment-monthly-title" class="option-title">Ogni mese</);
  assert.match(html, /id="payment-monthly-caption" class="payment-caption">Canone gestione pagamenti</);
  assert.match(html, /id="payment-monthly-badge" class="option-badge">Più popolare</);
  assert.match(html, /<div class="payment-row"><span>All'inizio<\/span><strong id="payment-single-now">/);
  assert.match(html, /<div class="payment-row"><span>Ogni mese<\/span><strong id="payment-monthly-monthly">/);
  assert.match(html, /Prima dell'attivazione serve la verifica Domeo/);
  assert.match(html, /function setPaymentDisplay\(prefix, display\)/);
  assert.doesNotMatch(html, /payment-overview-title|payment-overview-amount|comparison-banner/);
  assert.doesNotMatch(html, /shouldAutoSelectRecommendedPayment/);
  assert.match(html, /<button type="button" id="btn-step3" class="primary-button" disabled>\s+Vedi riepilogo/);
});

test("step 4 becomes a soft summary and lead capture experience", () => {
  assert.match(html, /<p class="section-kicker">Riepilogo<\/p>/);
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
    /id="plan-start" class="option-card plan-card plan-card--start" role="button" tabindex="0" aria-pressed="false" aria-labelledby="plan-start-title plan-start-ownership"/
  );
  assert.match(
    html,
    /id="payment-single" class="option-card payment-card" role="button" tabindex="0" aria-pressed="false" aria-labelledby=/
  );
  assert.match(html, /function bindSelectableCard\(element, onSelect\)/);
});

test("local runs keep the configured bootstrap step and load host sdk optionally", () => {
  assert.match(html, /const DEV_INITIAL_STEP = window\.formDevUtils\.normalizeInitialStep\(/);
  assert.match(html, /new URLSearchParams\(window\.location\.search\)\.get\("step"\) \?\? 2/);
  assert.match(html, /<link rel="icon" href="data:,">/);
  assert.match(html, /const captureScript = document\.createElement\("script"\);/);
  assert.match(html, /captureScript\.src = "https:\/\/mcp\.figma\.com\/mcp\/html-to-design\/capture\.js";/);
  assert.match(html, /function shouldLoadOptionalSdk\(\)/);
  assert.match(html, /async function loadScript\(src, options = \{\}\)/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/element_sdk\.js"><\/script>/);
  assert.doesNotMatch(html, /<script src="\/_sdk\/data_sdk\.js" type="text\/javascript"><\/script>/);
});
