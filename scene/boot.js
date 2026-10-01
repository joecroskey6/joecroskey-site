import { initAquarium } from './aquarium.js';

const container = document.getElementById('boot');
const canvas = document.getElementById('aq-canvas');
const pauseButton = document.getElementById('aq-motion');
const pauseLabel = document.getElementById('aq-motion-label');

// The welcome and Enter button work independently of the optional WebGL scene.
if (container && canvas && !container.classList.contains('exit')) {
  try {
    const scene = initAquarium({ canvas, container });
    container.classList.add('aq-ready');
    container.dataset.aquarium = 'ready';
    let paused = false;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncControls = () => { pauseButton.hidden = preference.matches; };
    syncControls();
    preference.addEventListener('change', syncControls);
    const togglePause = () => {
      paused = !paused;
      scene.setPaused(paused);
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseLabel.textContent = paused ? 'Resume scene' : 'Pause scene';
      container.querySelector('.aq-surface').style.animationPlayState = paused ? 'paused' : 'running';
    };
    pauseButton.addEventListener('click', togglePause);
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      scene.dispose();
      pauseButton.removeEventListener('click', togglePause);
      preference.removeEventListener('change', syncControls);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      container.removeEventListener('aquarium:error', onSceneError);
      container.removeEventListener('aquarium:leave', onLeave);
      container.dataset.aquarium = 'disposed';
    };
    const onPageHide = (event) => {
      if (event.persisted) scene.setPaused(true);
      else dispose();
    };
    const onPageShow = () => { if (!disposed) scene.setPaused(paused); };
    const onLeave = () => { scene.setPaused(true); };
    const onSceneError = () => {
      dispose();
      container.classList.remove('aq-ready');
      container.dataset.aquarium = 'fallback';
      pauseButton.hidden = true;
    };
    container.addEventListener('aquarium:error', onSceneError);
    container.addEventListener('aquarium:leave', onLeave, { once: true });
    container.addEventListener('aquarium:exit', dispose, { once: true });
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
  } catch (error) {
    container.dataset.aquarium = 'fallback';
    console.warn('The aquarium is unavailable; the welcome screen remains usable.', error);
  }
}
