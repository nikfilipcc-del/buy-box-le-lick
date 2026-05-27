class ProductSubscription extends HTMLElement {
  constructor() {
    super();

    this.planIdEls = this.querySelectorAll('[name="selling_plan"]');
    this.planIdEls.forEach(planIdEl => {
      planIdEl.addEventListener('change', this.onChangePlanId.bind(this));
    })
  }

  onChangePlanId(e) {
    e.preventDefault();
    const price = e.currentTarget.dataset.price;
    const currentPrice = document.getElementById('subscription-price');
    if (currentPrice) {
      currentPrice.textContent = price;
    }
  }
}

if (!customElements.get('product-subscription')) {
  customElements.define('product-subscription', ProductSubscription);
}