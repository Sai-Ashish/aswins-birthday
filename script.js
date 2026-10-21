(() => {
  'use strict';
  const dialog = document.querySelector('#lightbox');
  const photo = document.querySelector('#lightbox-image');
  const counter = document.querySelector('#lightbox-counter');
  const caption = document.querySelector('#lightbox-caption');
  const photoButtons = [...document.querySelectorAll('[data-gallery]')];
  let index = 0;
  let opener = null;
  function showPhoto(nextIndex) {
    index = (nextIndex + photoButtons.length) % photoButtons.length;
    const button = photoButtons[index];
    const source = button.querySelector('img');
    photo.src = source.src;
    photo.alt = source.alt;
    counter.textContent = `Memory ${index + 1} of ${photoButtons.length}`;
    caption.textContent = button.closest('figure').querySelector('figcaption span').textContent;
  }
  photoButtons.forEach((button, i) => button.addEventListener('click', () => {
    opener = button;
    showPhoto(i);
    dialog.showModal();
    document.body.classList.add('modal-open');
    document.querySelector('#close-lightbox').focus();
  }));
  document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(index - 1));
  document.querySelector('#next-photo').addEventListener('click', () => showPhoto(index + 1));
  document.querySelector('#close-lightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (opener) opener.focus();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(index - 1); }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  let startX = 0;
  photo.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; }, {passive:true});
  photo.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 55) showPhoto(index + (delta < 0 ? 1 : -1));
  }, {passive:true});

  const motionButton = document.querySelector('#motion-toggle');
  const motionLabel = document.querySelector('#motion-label');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = false;
  try { motionPaused = localStorage.getItem('aswin-motion-paused') === 'true'; } catch (_) {}
  function updateMotion() {
    const paused = motionPaused || motionPreference.matches;
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.disabled = motionPreference.matches;
    motionLabel.textContent = motionPreference.matches ? 'Motion reduced' : (paused ? 'Resume motion' : 'Pause motion');
    motionButton.setAttribute('aria-label', motionPreference.matches ? 'Decorative animations reduced to match your device settings' : (paused ? 'Resume decorative animations' : 'Pause decorative animations'));
    motionButton.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  }
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem('aswin-motion-paused', String(motionPaused)); } catch (_) {}
    updateMotion();
  });
  motionPreference.addEventListener('change', updateMotion);
  updateMotion();
  const film = document.querySelector('#birthday-video');
  document.querySelector('#replay-film').addEventListener('click', () => {
    film.currentTime = 0;
    film.play().catch(() => {});
    film.scrollIntoView({behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'center'});
  });
  const powerButton = document.querySelector('#power-up');
  const battle = document.querySelector('#battle-scene');
  let powerTimer;
  powerButton.addEventListener('click', () => {
    document.querySelector('#battle-status').textContent = 'Fighting spirit: unstoppable. Believe it!';
    if (motionPreference.matches || document.body.classList.contains('motion-paused')) return;
    clearTimeout(powerTimer);
    battle.classList.remove('power-active');
    void battle.offsetWidth;
    battle.classList.add('power-active');
    powerTimer = setTimeout(() => battle.classList.remove('power-active'), 3500);
  });

  const celebrateButton = document.querySelector('#celebrate');
  const message = document.querySelector('#celebration-message');
  const canvas = document.querySelector('#confetti');
  const context = canvas.getContext('2d');
  let animation = null;
  celebrateButton.addEventListener('click', () => {
    message.textContent = 'Happy birthday, Aswin! Here’s to a wonderful year. ♥';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused') || !context) return;
    if (animation) cancelAnimationFrame(animation);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const colours = ['#f47d26', '#f6f0df', '#f4b84f', '#bb4935', '#52734d'];
    const pieces = Array.from({length:95}, () => ({
      x: width * (.15 + Math.random() * .7), y: -20 - Math.random() * height * .6,
      vx: (Math.random() - .5) * 2.4, vy: 1.8 + Math.random() * 2.7,
      size: 4 + Math.random() * 5, angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .1, colour: colours[Math.floor(Math.random() * colours.length)]
    }));
    const started = performance.now();
    let previous = started;
    function draw(now) {
      const frameScale = Math.min((now - previous) / 16.67, 3);
      previous = now;
      context.clearRect(0, 0, width, height);
      const opacity = Math.min(1, Math.max(0, (6200 - (now - started)) / 900));
      for (const piece of pieces) {
        piece.x += piece.vx * frameScale;
        piece.y += piece.vy * frameScale;
        piece.angle += piece.spin * frameScale;
        context.save();
        context.globalAlpha = opacity;
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.colour;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * .55);
        context.restore();
      }
      if (now - started < 6200) animation = requestAnimationFrame(draw);
      else { context.clearRect(0, 0, width, height); animation = null; }
    }
    animation = requestAnimationFrame(draw);
  });
})();
