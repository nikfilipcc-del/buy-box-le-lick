import { Component } from '@theme/component';
import { QuantitySelectorUpdateEvent } from '@theme/events';

window.variantQuantities = window.variantQuantities || {};
window.skioRules = null;
class QuantitySelectorComponent extends Component {

  increaseQuantity(event) {
    event.preventDefault();
    this.refs.quantityInput.stepUp();
    this.#onQuantityChange();
  }

  decreaseQuantity(event) {
    event.preventDefault();
    this.refs.quantityInput.stepDown();
    this.#onQuantityChange();
  }

  selectInputValue() {
    if (document.activeElement === this.refs.quantityInput) {
      this.refs.quantityInput.select();
    }
  }

  setQuantity(event) {
    if (event.target instanceof HTMLInputElement) {
      this.refs.quantityInput.value = event.target.value;
    }
    this.#onQuantityChange();
  }

  async #onQuantityChange() {

    if (window.isRestoringQuantity) return;
    const { quantityInput } = this.refs;

    this.#checkQuantityRules();

    const newValue = parseInt(quantityInput.value) || 0;
    const variantId = quantityInput.dataset.variantId;

    if (variantId) {
      const quantities = JSON.parse(sessionStorage.getItem('variantQuantities') || '{}');
      quantities[variantId] = newValue;
      sessionStorage.setItem('variantQuantities', JSON.stringify(quantities));
      const totalQuantity = Object.values(quantities)
        .reduce((sum, q) => sum + Number(q || 0), 0);

      updateBoxUI(totalQuantity);
      await updatePrice(totalQuantity);
    }
    quantityInput.dispatchEvent(
      new QuantitySelectorUpdateEvent(newValue, Number(quantityInput.dataset.cartLine))
    );
    updateVariantUI();
  }

  #checkQuantityRules() {
    const { quantityInput } = this.refs;
    const { min, max, value } = quantityInput;
    if (value < min && min) quantityInput.value = min;
    if (value > max && max) quantityInput.value = max;
  }

  get quantityInput() {
    if (!this.refs.quantityInput) {
      throw new Error('Missing <input ref="quantityInput" />');
    }
    return this.refs.quantityInput;
  }
}
/**
 * Fetch Skio Rules (cached)
 */
async function fetchRules() {
  if (window.skioRules) return window.skioRules;
  const stored = sessionStorage.getItem('skio-discount-rules');
  if (stored) {
    window.skioRules = JSON.parse(stored);
    return window.skioRules;
  }
  const response = await fetch(
    `https://api.skio.com/storefront-http/get-rules-by-domain-or-hostname?domain=${window?.Shopify?.shop}`
  );
  const data = await response.json();
  const rules = data.rules
    .filter(rule => rule.type !== 'surpriseDelight')
    .sort((a, b) => a.minQuantityToDiscount - b.minQuantityToDiscount);

  sessionStorage.setItem('skio-discount-rules', JSON.stringify(rules));

  window.skioRules = rules;
  return rules;
}

/**
 * Update progress box UI
 */
function updateBoxUI(totalQuantity) {

  document.querySelectorAll('[data-box-number]').forEach((liEle) => {
    const boxNumber = Number(liEle.dataset.boxNumber);
    if (totalQuantity === boxNumber) {
      liEle.classList.add('is-active', 'half-active');
      liEle.previousElementSibling?.classList.add('before-active');
    } else {
      liEle.classList.remove('is-active', 'half-active');
      liEle.previousElementSibling?.classList.remove('before-active');
    }
    if (totalQuantity === 0) {
      liEle.classList.add('init');
    } else {
      liEle.classList.remove('init');
    }
  });
}
/**
 * Update price
 */
window.updatePrice = async function(totalQuantity) {

  const addToCartText = document.querySelector('add-to-cart-component .add-to-cart-text__content');
  const quantityInit = document.querySelector('add-to-cart-component .quantity-init');

  if (totalQuantity === 0) {
    addToCartText?.style.setProperty('display', 'none');
    quantityInit?.classList.add('quantity-init--style');
  } else {
    addToCartText?.style.removeProperty('display');
    quantityInit?.classList.remove('quantity-init--style');
  }
  const rules = await fetchRules();
  const rule = rules.find(
    rule => rule.minQuantityToDiscount === totalQuantity
  );
  const discountPerItem =
  totalQuantity > 3
    ? 9
    : (rule ? rule.discountAmount / rule.minQuantityToDiscount : 0);
    const skioPlanPicker = document.querySelector('skio-plan-picker');
    if (!skioPlanPicker) return;
    const shadow = skioPlanPicker.shadowRoot;
    const priceElements = shadow?.querySelectorAll('.skio-price--amount');
    priceElements?.forEach((ele) => {
      const basePrice = Number(ele.dataset.basePrice?.replace('$', '') || 0);
      const finalPrice = basePrice - discountPerItem;
    ele.textContent = `$${finalPrice}`;
  });

  //adjust addtocart
  const selectedPlanText = shadow
  ?.querySelector('.group-container--selected .skio-price--amount')
  ?.textContent
  ?.trim();

  const selectedPlan = Number(selectedPlanText?.replace(/[^0-9.]/g, '') || 0);  const totalSelectedPlan = selectedPlan * totalQuantity;
  if (selectedPlan) {
    const totalPriceEle = document.querySelector('.total_price');
    if (totalPriceEle) {
      totalPriceEle.textContent = `$${totalSelectedPlan}`;
    }
  }
  const selectedComparePlanText = shadow
  ?.querySelector(
    '.group-container--selected .skio-price-compare--amount')
  ?.textContent
  ?.trim();
  const selectedComparePlan = Number(selectedComparePlanText?.replace(/[^0-9.]/g, '') || 0);  const totalSelecteComparedPlan = selectedComparePlan * totalQuantity;

  if (selectedComparePlan) {
    const totalComparePriceEle = document.querySelector('.total-compare_price');
    if (totalComparePriceEle) {
      totalComparePriceEle.textContent = `$${totalSelecteComparedPlan}`;
    }
  }
};
/**
 * Restore saved quantities
 */
window.restoreVariantQuantity = function () {
  window.isRestoringQuantity = true;
  const storedQuantities = JSON.parse(
    sessionStorage.getItem('variantQuantities') || '{}'
  );
  document
    .querySelectorAll('.variant-option__button-label-property')
    .forEach((variantBlock) => {
      const variantInput = variantBlock.querySelector(
        'input[type="radio"][data-variant-id]'
      );
      const quantityInput = variantBlock.querySelector(
        'quantity-selector-component input[type="number"]'
      );
      if (!variantInput || !quantityInput) return;
      const variantId = variantInput.dataset.variantId;
      quantityInput.value = storedQuantities[variantId] ?? 0;
    });
  window.isRestoringQuantity = false;
};

/**
 * Update variant UI
 */
window.updateVariantUI = function () {

  document
    .querySelectorAll('quantity-selector-component input[type="number"]')
    .forEach((input) => {

      const variantBlock = input.closest('.variant-option__button-label-property');

      if (!variantBlock) return;

      const quantity = Number(input.value);

      variantBlock.classList.toggle('has-quantity', quantity > 0);
    });
};

/**
 * Register component
 */
if (!customElements.get('quantity-selector-component')) {
  customElements.define('quantity-selector-component', QuantitySelectorComponent);
}

/**
 * Init
 */
document.addEventListener('DOMContentLoaded', async function () {
  restoreVariantQuantity();
  updateVariantUI();
  const quantities = JSON.parse(sessionStorage.getItem('variantQuantities') || '{}');
  const totalQuantity = Object.values(quantities)
    .reduce((sum, q) => sum + Number(q || 0), 0);
  updateBoxUI(totalQuantity);
  await updatePrice(totalQuantity);

});