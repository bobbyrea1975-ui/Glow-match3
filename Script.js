const products = [
  {
    name: 'Gentle Barrier Cleanser',
    price: '$18',
    tags: ['dry', 'sensitive', 'barrier'],
    cautions: ['Avoid if you prefer a strong exfoliating wash'],
    ingredients: ['ceramides', 'glycerin', 'panthenol'],
    affiliates: [
      { label: 'Shop Sephora', url: 'https://www.sephora.com/' },
      { label: 'Shop Ulta', url: 'https://www.ulta.com/' }
    ],
    scoreBias: { sensitive: 3, dry: 2, barrier: 3, acne: 0, oil: -1, texture: 0, aging: 0, low: 2, medium: 1, high: 0 }
  },
  {
    name: 'Oil Control Serum',
    price: '$24',
    tags: ['oily', 'combo', 'acne'],
    cautions: ['Can be too drying for sensitive skin'],
    ingredients: ['niacinamide', 'zinc', 'salicylic acid'],
    affiliates: [
      { label: 'Shop Amazon', url: 'https://www.amazon.com/' },
      { label: 'Shop Sephora', url: 'https://www.sephora.com/' }
    ],
    scoreBias: { oily: 3, combo: 2, acne: 3, texture: 2, aging: -1, sensitive: -2, dry: -2, barrier: -1, low: 1, medium: 2, high: 3 }
  },
  {
    name: 'Dark Spot Fade Cream',
    price: '$28',
    tags: ['dark-spots', 'texture', 'normal'],
    cautions: ['Use sunscreen daily', 'May irritate very sensitive skin'],
    ingredients: ['azelaic acid', 'tranexamic acid', 'licorice root'],
    affiliates: [
      { label: 'Shop Ulta', url: 'https://www.ulta.com/' },
      { label: 'Shop Amazon', url: 'https://www.amazon.com/' }
    ],
    scoreBias: { 'dark-spots': 4, texture: 2, normal: 1, combo: 1, oily: 1, sensitive: -1, aging: 1, high: -1, medium: 1, low: 2 }
  },
  {
    name: 'Barrier Recovery Cream',
    price: '$22',
    tags: ['dry', 'sensitive', 'barrier'],
    cautions: ['May feel heavy on oily skin'],
    ingredients: ['ceramides', 'squalane', 'colloidal oat'],
    affiliates: [
      { label: 'Shop Sephora', url: 'https://www.sephora.com/' },
      { label: 'Shop Target', url: 'https://www.target.com/' }
    ],
    scoreBias: { dry: 4, sensitive: 3, barrier: 3, combo: 1, oily: -2, acne: -1, aging: 2, low: 3, medium: 2, high: 1 }
  },
  {
    name: 'Mineral SPF 30',
    price: '$26',
    tags: ['all', 'dark-spots', 'sensitive'],
    cautions: ['May leave a cast on deeper skin tones without tint'],
    ingredients: ['zinc oxide', 'titanium dioxide', 'silica'],
    affiliates: [
      { label: 'Shop Ulta', url: 'https://www.ulta.com/' },
      { label: 'Shop Amazon', url: 'https://www.amazon.com/' }
    ],
    scoreBias: { dry: 1, sensitive: 3, barrier: 1, acne: 1, oil: 1, texture: 1, aging: 2, 'dark-spots': 3, high: 2, medium: 2, low: 2 }
  },
  {
    name: 'Peptide Renewal Serum',
    price: '$34',
    tags: ['aging', 'texture', 'normal'],
    cautions: ['May be too much for very sensitive skin'],
    ingredients: ['peptides', 'hyaluronic acid', 'ceramides'],
    affiliates: [
      { label: 'Shop Sephora', url: 'https://www.sephora.com/' },
      { label: 'Shop Ulta', url: 'https://www.ulta.com/' }
    ],
    scoreBias: { aging: 4, texture: 3, normal: 2, dry: 1, combo: 1, barrier: 1, low: 1, medium: 2, high: -1 }
  }
];

const safetyRules = [
  ['Retinoids', 'Show a caution if pregnancy, nursing, or prescription treatment is selected. Keep this informational and prompt the user to confirm with a clinician.', 'bad'],
  ['Salicylic acid', 'Flag if the user has aspirin allergy, very dry skin, or high sensitivity. Mention that overuse can dry or irritate skin.', 'warn'],
  ['AHAs and exfoliating acids', 'Warn about increased sun sensitivity and irritation, especially if the user already reports sensitivity.', 'warn'],
  ['Fragrance and essential oils', 'Show an extra warning when the user selects allergies, eczema-prone skin, or fragrance sensitivity.', 'bad'],
  ['Benzoyl peroxide', 'Explain that it can bleach fabrics and may be too harsh when barrier repair is the goal.', 'warn'],
  ['Patch test and stop-use rule', 'Every recommendation should remind users to patch test and stop if irritation appears.', 'good']
];

const $ = (id) => document.getElementById(id);
const state = { premium: false, lastReminder: null };

function currentSelections() {
  return {
    skinType: $('skinType').value,
    concern: $('mainConcern').value,
    sensitivity: document.querySelector('input[name="sensitivity"]:checked').value,
    routine: $('routine').value,
    environment: $('environment').value,
    actives: $('actives').value,
    caution: $('caution').value,
  };
}

function formatDate(d) {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}

function saveState() {
  localStorage.setItem('glow-match-state', JSON.stringify({ premium: state.premium, lastReminder: state.lastReminder }));
}

function setPremium(next) {
  state.premium = next;
  $('lockCard').classList.toggle('hidden', next);
  $('deepContent').classList.toggle('blur', !next);
  $('joinBtn').textContent = next ? 'Glow Match Premium Active' : 'Join Glow Match Premium';
  $('joinFromLock').textContent = next ? 'Glow Match Premium Active' : 'Join Glow Match Premium for $9.99 / month';
  $('deepNotice').textContent = next
    ? 'Premium is active. The deeper quiz, ingredient caution flags, and buy-again reminder logic are now available.'
    : 'Premium users can access ingredient contraindication flags, more precise product ranking, and a buy-again reminder based on product use cycle.';
  saveState();
  renderResults();
}

function scoreProduct(product, selections, premium) {
  let score = 0;
  const fitTags = [];
  const cautions = [];

  [selections.skinType, selections.concern, selections.sensitivity, selections.actives].forEach((value) => {
    if (product.scoreBias[value]) score += product.scoreBias[value];
  });

  if (product.tags.includes(selections.skinType)) {
    score += 4;
    fitTags.push(`Matches ${selections.skinType} skin`);
  }
  if (product.tags.includes(selections.concern)) {
    score += 4;
    fitTags.push(`Targets ${selections.concern.replace('-', ' ')}`);
  }
  if (selections.concern === 'aging' && product.tags.includes('aging')) {
    score += 4;
    fitTags.push('Supports aging and fine lines');
  }
  if (selections.sensitivity === 'high' && product.name.includes('Serum')) {
    score -= 3;
    cautions.push('Could be a bit active for high sensitivity');
  }
  if (selections.skinType === 'dry' && product.name.includes('Oil')) {
    score -= 2;
    cautions.push('May feel drying');
  }

  if (premium) {
    if (selections.caution === 'pregnancy' && /salicylic acid|retinoid|acid/i.test(product.ingredients.join(' '))) {
      score -= 4;
      cautions.push('Ingredient caution for pregnancy / nursing');
    }
    if (selections.caution === 'allergies' && /fragrance|essential oils/i.test(product.ingredients.join(' '))) {
      score -= 3;
      cautions.push('Fragrance-sensitive users should review ingredients');
    }
    if (selections.caution === 'rx' && /acid|retinoid|benzoyl/i.test(product.ingredients.join(' '))) {
      score -= 3;
      cautions.push('Check with clinician if using prescriptions');
    }
    if (selections.environment === 'dry-climate' && product.name.includes('Oil')) score -= 1;
    if (selections.environment === 'humid-climate' && product.name.includes('Cream')) score -= 1;
    if (selections.routine === 'advanced' && product.name.includes('Serum')) score += 1;
    if (selections.routine === 'minimal' && product.name.includes('Cleanser')) score += 1;
  }

  return { score, fitTags, cautions };
}

function renderResults() {
  const selections = currentSelections();
  const list = products
    .map((product) => ({ product, ...scoreProduct(product, selections, state.premium) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, state.premium ? 4 : 3);

  $('results').innerHTML = list.map(({ product, score, fitTags, cautions }) => `
    <article class="result-card">
      <div>
        <div class="result-head">
          <div>
            <h4>${product.name}</h4>
            <div class="result-meta">
              <span class="price-chip">${product.price}</span>
              <span class="meta-chip">${product.ingredients.join(' Â· ')}</span>
            </div>
          </div>
        </div>
        <div class="tags">
          ${[...fitTags].map((item) => `<span class="tag">${item}</span>`).join('')}
        </div>
        <div class="spacer"></div>
        <div class="warns">
          ${[...cautions, ...product.cautions.slice(0, state.premium ? 2 : 1)]
            .map((item) => `<span class="warnchip ${/pregnancy|fragrance|clinician/i.test(item) ? 'bad' : ''}">${item}</span>`)
            .join('') || '<span class="warnchip">Low conflict for this profile</span>'}
        </div>
        <div class="affiliate-row">
          <span class="affiliate-label">Affiliate links:</span>
          ${product.affiliates.map((link) => `<a class="affiliate-link" href="${link.url}" target="_blank" rel="sponsored nofollow noopener noreferrer">${link.label}</a>`).join('')}
        </div>
      </div>
      <div class="score-badge">
        <strong>${Math.max(0, Math.min(99, score + 72))}</strong>
        <span>match</span>
      </div>
    </article>
  `).join('');

  if (state.premium) {
    const pick = list[0]?.product || products[0];
    $('productPick').value = pick.name;
    $('reminderOutput').innerHTML = `Premium match: <strong>${pick.name}</strong>. You can save a buy-again reminder below.`;
    $('saveReminder').disabled = false;
    $('calcReminder').disabled = false;
  } else {
    $('reminderOutput').innerHTML = 'Buy-again reminders are locked until membership is active.';
    $('saveReminder').disabled = true;
    $('calcReminder').disabled = true;
  }
}

function renderRules() {
  $('rules').innerHTML = safetyRules.map(([name, note, severity]) => `
    <div class="notice ${severity === 'bad' ? 'warn' : ''}">
      <strong>${name}</strong><br>${note}
    </div>
  `).join('');
}

function fillPicker() {
  $('productPick').innerHTML = products.map((product) => `<option value="${product.name}">${product.name}</option>`).join('');
}

function previewReminder() {
  if (!state.premium) {
    $('reminderOutput').innerHTML = 'Unlock premium to save reminders.';
    return;
  }
  const product = $('productPick').value || products[0].name;
  const cycle = Number($('cycle').value || 30);
  const start = $('startDate').value ? new Date($('startDate').value + 'T00:00:00') : new Date();
  const reminder = new Date(start);
  reminder.setDate(reminder.getDate() + cycle);
  state.lastReminder = { product, cycle, reminder: reminder.toISOString() };
  saveState();
  $('reminderOutput').innerHTML = `Reminder saved for <strong>${product}</strong> in <strong>${cycle} days</strong> on <strong>${formatDate(reminder)}</strong>.`;
}

const saved = localStorage.getItem('glow-match-state');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    state.premium = !!parsed.premium;
    state.lastReminder = parsed.lastReminder || null;
  } catch {}
}

$('basicBtn').onclick = renderResults;
$('deepBtn').onclick = () => {
  if (!state.premium) setPremium(true);
  else renderResults();
};
$('joinBtn').onclick = () => setPremium(!state.premium);
$('joinFromLock').onclick = () => setPremium(true);
$('unlockBtn').onclick = () => {
  setPremium(true);
  $('routine').focus();
};
$('calcReminder').onclick = previewReminder;
$('saveReminder').onclick = previewReminder;
$('resetBtn').onclick = () => {
  localStorage.removeItem('glow-match-state');
  state.premium = false;
  state.lastReminder = null;
  $('startDate').value = '';
  $('cycle').value = '30';
  setPremium(false);
  renderResults();
  $('reminderOutput').innerHTML = 'No reminder saved yet.';
};

fillPicker();
renderRules();
setPremium(state.premium);
renderResults();

if (state.lastReminder) {
  const d = new Date(state.lastReminder.reminder);
  $('reminderOutput').innerHTML = `Saved reminder: <strong>${state.lastReminder.product}</strong> on <strong>${formatDate(d)}</strong> (${state.lastReminder.cycle} day cycle).`;
}
