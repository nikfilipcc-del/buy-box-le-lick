window.addEventListener('load', function() {
    const videos = document.querySelectorAll('video[data-src]');
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const video = entry.target;
            const src = video.dataset.src;
            if (!src) return;

            video.src = src;
            video.removeAttribute('data-src');
            video.dataset.loaded = 'true';
            video.load();

            if (video.hasAttribute('autoplay')) {
                video.play().catch(err => console.warn(err));
            }

            obs.unobserve(video);
        });
    }, { rootMargin: '200px 0px', threshold: 0.01 });

    videos.forEach(video => observer.observe(video));
});