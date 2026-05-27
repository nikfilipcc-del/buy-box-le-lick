class EmblaSlider extends HTMLElement {
  constructor() {
    super();
    this.autoplay = this.getAttribute('data-autoplay') === 'true';
    this.loop = this.getAttribute('data-loop') === 'true';
    this.autoplaySpeed =
      Number(this.getAttribute('data-autoplay-speed')) || 4000;
    const options = {
      loop: this.loop,
      speed: 10,
      align: 'start',
    };
    const plugins = [];
    if (this.autoplay) {
      plugins.push(EmblaCarouselAutoplay({ delay: this.autoplaySpeed }));
    }
    this.embla = EmblaCarousel(
      this.querySelector('.embla__viewport'),
      options,
      plugins,
    );

    this.slides = this.querySelectorAll('.embla__slide');

    this.prevBtns = this.querySelectorAll('.embla__arrow--prev');
    this.nextBtns = this.querySelectorAll('.embla__arrow--next');
    this.prevBtns.forEach((btn) =>
      btn.addEventListener('click', () => this.embla.scrollPrev()),
    );
    this.nextBtns.forEach((btn) =>
      btn.addEventListener('click', () => this.embla.scrollNext()),
    );

    this.dots = this.querySelectorAll('.embla__dot');
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.embla.scrollTo(i));
    });

    this.embla.on('select', () => {
      this.selectDot();
      this.updateArrows();
    });
    this.selectDot();
    this.updateArrows();
  }

  updateArrows() {
    if (!this.loop) {
      this.prevBtns.forEach((btn) => {
        btn.disabled = !this.embla.canScrollPrev();
        btn.classList.toggle('is-disabled', !this.embla.canScrollPrev());
      });
      this.nextBtns.forEach((btn) => {
        btn.disabled = !this.embla.canScrollNext();
        btn.classList.toggle('is-disabled', !this.embla.canScrollNext());
      });
    }
  }

  selectDot() {
    const selectedIndex = this.embla.selectedScrollSnap();
     const slideCount = this.slides.length;

    this.dots.forEach((dot, i) => {
      dot.classList.toggle(
        'is-selected',
        i === this.embla.selectedScrollSnap(),
      );
    });

    this.slides.forEach((slide) => {
      slide.removeAttribute('data-selected');
      slide.removeAttribute('data-next');
    });

    // Mark the selected slide
    const selectedSlide = this.slides[selectedIndex];
    selectedSlide.setAttribute('data-selected', 'true');

    // Mark the NEXT visible slide (wrap using modulo)
    const nextIndex = (selectedIndex + 1) % slideCount;
    const nextSlide = this.slides[nextIndex];
    nextSlide.setAttribute('data-next', 'true');
  }
}

if (!customElements.get('embla-slider')) {
  customElements.define('embla-slider', EmblaSlider);
}