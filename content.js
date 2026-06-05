(() => {
  'use strict';

  const MIN_IMAGE_SIZE = 80;
  const OVERLAY_MIN_ZOOM = 1;
  const OVERLAY_MAX_ZOOM = 8;
  const ZOOM_STEP = 0.25;

  let overlayState = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundZoom(value) {
    return Math.round(value * 100) / 100;
  }

  function setImportantStyles(element, styles) {
    for (const [name, value] of Object.entries(styles)) {
      element.style.setProperty(name, value, 'important');
    }
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

  function isLinkedImage(image) {
    return typeof image.closest === 'function' && Boolean(image.closest('a[href]'));
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

  function getImageUnderPointer(event) {
    if (typeof document.elementsFromPoint !== 'function') return null;

    return document.elementsFromPoint(event.clientX, event.clientY)
      .find(isUsefulImage) || null;
  }

  function getActivationImage(event) {
    if (isUsefulImage(event.target)) return event.target;

    return getImageUnderPointer(event);
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

    setImportantStyles(overlay, {
      position: 'fixed',
      inset: '0',
      'z-index': '2147483647',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      background: 'rgba(0, 0, 0, 0.88)',
      cursor: 'zoom-out'
    });
    setImportantStyles(overlayImage, {
      'max-width': '92vw',
      'max-height': '92vh',
      'object-fit': 'contain',
      'transform-origin': 'center center',
      transition: 'transform 80ms ease',
      cursor: 'grab',
      'user-select': 'none',
      '-webkit-user-drag': 'none',
      'will-change': 'transform'
    });

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
    setImportantStyles(overlayState.image, {
      cursor: 'grabbing',
      transition: 'none'
    });
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
    setImportantStyles(overlayState.image, {
      cursor: 'grab',
      transition: 'transform 80ms ease'
    });
  }

  function onClick(event) {
    if (overlayState) {
      if (event.target === overlayState.overlay) closeOverlay();
    }
  }

  function onDoubleClick(event) {
    if (overlayState) {
      if (overlayState.overlay.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        closeOverlay();
      }
      return;
    }

    const image = getActivationImage(event);

    if (!image) return;
    if (isLinkedImage(image)) return;

    event.preventDefault();
    event.stopPropagation();
    openOverlay(image);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') closeOverlay();
  }

  document.addEventListener('wheel', onOverlayWheel, { capture: true, passive: false });
  document.addEventListener('click', onClick, true);
  document.addEventListener('dblclick', onDoubleClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onOverlayPointerDown, true);
  document.addEventListener('pointermove', onOverlayPointerMove, true);
  document.addEventListener('pointerup', stopOverlayDrag, true);
  document.addEventListener('pointercancel', stopOverlayDrag, true);
})();
