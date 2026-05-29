(() => {
  'use strict';

  const MIN_IMAGE_SIZE = 80;
  const INLINE_MIN_ZOOM = 1;
  const INLINE_MAX_ZOOM = 5;
  const OVERLAY_MIN_ZOOM = 1;
  const OVERLAY_MAX_ZOOM = 8;
  const ZOOM_STEP = 0.25;

  const inlineZoom = new WeakMap();
  let overlayState = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundZoom(value) {
    return Math.round(value * 100) / 100;
  }

  function getImageSource(image) {
    return image.currentSrc || image.src || '';
  }

  function parseSrcsetCandidate(candidate) {
    const parts = candidate.trim().split(/\s+/);
    const url = parts[0] || '';
    const descriptor = parts[1] || '1x';

    if (!url) return null;

    if (/^\d+w$/.test(descriptor)) {
      return {
        url,
        type: 'width',
        value: Number.parseInt(descriptor, 10)
      };
    }

    if (/^(\d+|\d*\.\d+)x$/.test(descriptor)) {
      return {
        url,
        type: 'density',
        value: Number.parseFloat(descriptor)
      };
    }

    return {
      url,
      type: 'density',
      value: 1
    };
  }

  function getBestSrcsetSource(srcset) {
    const candidates = String(srcset || '')
      .split(',')
      .map(parseSrcsetCandidate)
      .filter(Boolean);

    if (candidates.length === 0) return '';

    const widthCandidates = candidates.filter((candidate) => candidate.type === 'width');
    const usefulCandidates = widthCandidates.length > 0 ? widthCandidates : candidates;

    return usefulCandidates.reduce((best, candidate) => {
      return candidate.value > best.value ? candidate : best;
    }).url;
  }

  function getBestImageSource(image) {
    return getBestSrcsetSource(image.srcset) || getImageSource(image);
  }

  function isUsefulImage(target) {
    if (!(target instanceof HTMLImageElement)) return false;
    if (!getImageSource(target)) return false;

    const rect = target.getBoundingClientRect();
    const renderedWidth = rect.width;
    const renderedHeight = rect.height;
    const naturalWidth = target.naturalWidth;
    const naturalHeight = target.naturalHeight;

    return (
      renderedWidth >= MIN_IMAGE_SIZE &&
      renderedHeight >= MIN_IMAGE_SIZE &&
      naturalWidth >= MIN_IMAGE_SIZE &&
      naturalHeight >= MIN_IMAGE_SIZE
    );
  }

  function getInlineZoom(image) {
    return inlineZoom.get(image) || INLINE_MIN_ZOOM;
  }

  function setInlineZoom(image, zoom, originX, originY) {
    const nextZoom = roundZoom(clamp(zoom, INLINE_MIN_ZOOM, INLINE_MAX_ZOOM));

    if (nextZoom <= INLINE_MIN_ZOOM) {
      inlineZoom.delete(image);
      image.classList.remove('iz-inline-zoomed');
      image.style.removeProperty('transform');
      image.style.removeProperty('transform-origin');
      return;
    }

    inlineZoom.set(image, nextZoom);
    image.classList.add('iz-inline-zoomed');
    image.style.transformOrigin = `${originX}% ${originY}%`;
    image.style.transform = `scale(${nextZoom})`;
  }

  function getPointerOrigin(event, image) {
    const rect = image.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100)
    };
  }

  function onPointerOver(event) {
    if (!isUsefulImage(event.target)) return;
    event.target.classList.add('iz-zoom-target');
  }

  function onPointerOut(event) {
    if (!(event.target instanceof HTMLImageElement)) return;
    event.target.classList.remove('iz-zoom-target');
  }

  function onWheel(event) {
    if (overlayState) return;
    if (!isUsefulImage(event.target)) return;
    if (event.deltaY === 0) return;

    const image = event.target;
    const direction = event.deltaY < 0 ? 1 : -1;
    const currentZoom = getInlineZoom(image);
    const nextZoom = roundZoom(
      clamp(currentZoom + direction * ZOOM_STEP, INLINE_MIN_ZOOM, INLINE_MAX_ZOOM)
    );

    if (nextZoom === currentZoom) return;

    event.preventDefault();

    const origin = getPointerOrigin(event, image);

    setInlineZoom(image, nextZoom, origin.x, origin.y);
  }

  function openOverlay(image) {
    const source = getBestImageSource(image);
    if (!source || overlayState) return;

    const overlay = document.createElement('div');
    const overlayImage = document.createElement('img');

    overlay.className = 'iz-overlay';
    overlayImage.className = 'iz-overlay-image';
    overlayImage.src = source;
    overlayImage.alt = image.alt || '';
    overlayImage.decoding = 'async';
    overlayImage.draggable = false;

    overlay.append(overlayImage);
    document.documentElement.append(overlay);

    overlayState = {
      overlay,
      image: overlayImage,
      zoom: OVERLAY_MIN_ZOOM,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      dragging: false
    };

    updateOverlayTransform();
  }

  function closeOverlay() {
    if (!overlayState) return;

    overlayState.overlay.remove();
    overlayState = null;
  }

  function updateOverlayTransform() {
    if (!overlayState) return;

    overlayState.image.style.transform =
      `translate(${overlayState.x}px, ${overlayState.y}px) scale(${overlayState.zoom})`;
  }

  function onOverlayWheel(event) {
    if (!overlayState) return;
    if (!overlayState.overlay.contains(event.target)) return;
    if (event.deltaY === 0) return;

    const direction = event.deltaY < 0 ? 1 : -1;
    const nextZoom = roundZoom(
      clamp(
        overlayState.zoom + direction * ZOOM_STEP,
        OVERLAY_MIN_ZOOM,
        OVERLAY_MAX_ZOOM
      )
    );

    if (nextZoom === overlayState.zoom) return;

    event.preventDefault();

    overlayState.zoom = nextZoom;

    if (overlayState.zoom === OVERLAY_MIN_ZOOM) {
      overlayState.x = 0;
      overlayState.y = 0;
    }

    updateOverlayTransform();
  }

  function onOverlayPointerDown(event) {
    if (!overlayState || event.target !== overlayState.image) return;

    event.preventDefault();

    overlayState.dragging = true;
    overlayState.startX = event.clientX;
    overlayState.startY = event.clientY;
    overlayState.startOffsetX = overlayState.x;
    overlayState.startOffsetY = overlayState.y;
    overlayState.image.classList.add('iz-dragging');
    overlayState.image.setPointerCapture(event.pointerId);
  }

  function onOverlayPointerMove(event) {
    if (!overlayState || !overlayState.dragging) return;

    overlayState.x = overlayState.startOffsetX + event.clientX - overlayState.startX;
    overlayState.y = overlayState.startOffsetY + event.clientY - overlayState.startY;
    updateOverlayTransform();
  }

  function stopOverlayDrag() {
    if (!overlayState) return;

    overlayState.dragging = false;
    overlayState.image.classList.remove('iz-dragging');
  }

  function onClick(event) {
    if (overlayState) {
      if (event.target === overlayState.overlay) closeOverlay();
      return;
    }

    if (!isUsefulImage(event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    openOverlay(event.target);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') closeOverlay();
  }

  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('pointerout', onPointerOut, true);
  document.addEventListener('wheel', onWheel, { capture: true, passive: false });
  document.addEventListener('wheel', onOverlayWheel, { capture: true, passive: false });
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onOverlayPointerDown, true);
  document.addEventListener('pointermove', onOverlayPointerMove, true);
  document.addEventListener('pointerup', stopOverlayDrag, true);
  document.addEventListener('pointercancel', stopOverlayDrag, true);
})();
