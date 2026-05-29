const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

class FakeStyle {
  removeProperty(name) {
    const key = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    delete this[key];
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = new FakeStyle();
    this.attributes = new Map();
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      remove: (...names) => names.forEach((name) => this.classes.delete(name)),
      contains: (name) => this.classes.has(name)
    };
  }

  get className() {
    return [...this.classes].join(' ');
  }

  set className(value) {
    this.classes = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  append(...nodes) {
    for (const node of nodes) {
      node.parentNode = this;
      this.children.push(node);
    }
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }

  contains(node) {
    if (node === this) return true;
    return this.children.some((child) => child.contains(node));
  }

  setPointerCapture() {}
}

class FakeImage extends FakeElement {
  constructor({ width = 200, height = 150, source = 'https://example.test/image.jpg' } = {}) {
    super('img');
    this.alt = '';
    this.currentSrc = source;
    this.src = source;
    this.srcset = '';
    this.naturalWidth = width;
    this.naturalHeight = height;
    this.rect = { left: 0, top: 0, width, height };
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

class FakeDocument {
  constructor() {
    this.documentElement = new FakeElement('html');
    this.listeners = new Map();
  }

  createElement(tagName) {
    if (tagName === 'img') return new FakeImage();
    return new FakeElement(tagName);
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  dispatch(type, event) {
    for (const handler of this.listeners.get(type) || []) {
      handler(event);
    }
    return event;
  }
}

function makeEvent(overrides = {}) {
  return {
    clientX: 100,
    clientY: 75,
    deltaY: 0,
    key: '',
    pointerId: 1,
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    },
    ...overrides
  };
}

function loadContentScript() {
  const document = new FakeDocument();
  const code = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
  const context = vm.createContext({
    document,
    HTMLImageElement: FakeImage
  });

  new vm.Script(code).runInContext(context);
  return { document };
}

test('hover marks useful images and ignores tiny images', () => {
  const { document } = loadContentScript();
  const useful = new FakeImage({ width: 200, height: 150 });
  const tiny = new FakeImage({ width: 48, height: 48 });

  document.dispatch('pointerover', makeEvent({ target: useful }));
  document.dispatch('pointerover', makeEvent({ target: tiny }));

  assert.equal(useful.classList.contains('iz-zoom-target'), true);
  assert.equal(tiny.classList.contains('iz-zoom-target'), false);
});

test('hover ignores images with unknown natural size', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });
  image.naturalWidth = 0;
  image.naturalHeight = 0;

  document.dispatch('pointerover', makeEvent({ target: image }));

  assert.equal(image.classList.contains('iz-zoom-target'), false);
});

test('wheel zooms a useful image inline and resets at minimum zoom', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  const zoomInEvent = document.dispatch(
    'wheel',
    makeEvent({ target: image, deltaY: -100 })
  );

  assert.equal(zoomInEvent.defaultPrevented, true);
  assert.equal(image.classList.contains('iz-inline-zoomed'), true);
  assert.equal(image.style.transform, 'scale(1.25)');
  assert.equal(image.style.transformOrigin, '50% 50%');

  document.dispatch('wheel', makeEvent({ target: image, deltaY: 100 }));

  assert.equal(image.classList.contains('iz-inline-zoomed'), false);
  assert.equal(image.style.transform, undefined);
  assert.equal(image.style.transformOrigin, undefined);
});

test('wheel down at minimum zoom does not block page scroll', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  const event = document.dispatch('wheel', makeEvent({ target: image, deltaY: 100 }));

  assert.equal(event.defaultPrevented, false);
  assert.equal(image.style.transform, undefined);
});

test('wheel with zero delta does not zoom or block page scroll', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  const event = document.dispatch('wheel', makeEvent({ target: image, deltaY: 0 }));

  assert.equal(event.defaultPrevented, false);
  assert.equal(image.style.transform, undefined);
});

test('click opens overlay and background click closes it', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  const openEvent = document.dispatch('click', makeEvent({ target: image }));
  const overlay = document.documentElement.children[0];

  assert.equal(openEvent.defaultPrevented, true);
  assert.equal(openEvent.propagationStopped, true);
  assert.equal(overlay.classList.contains('iz-overlay'), true);
  assert.equal(overlay.children[0].classList.contains('iz-overlay-image'), true);

  document.dispatch('click', makeEvent({ target: overlay }));

  assert.equal(document.documentElement.children.length, 0);
});

test('click opens overlay with largest width candidate from srcset', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({
    width: 200,
    height: 150,
    source: 'https://example.test/small.jpg'
  });
  image.srcset = [
    'https://example.test/small.jpg 400w',
    'https://example.test/large.jpg 1600w',
    'https://example.test/medium.jpg 800w'
  ].join(', ');

  document.dispatch('click', makeEvent({ target: image }));
  const overlay = document.documentElement.children[0];
  const overlayImage = overlay.children[0];

  assert.equal(overlayImage.src, 'https://example.test/large.jpg');
});

test('overlay wheel with zero delta does not zoom or block page scroll', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  document.dispatch('click', makeEvent({ target: image }));
  const overlay = document.documentElement.children[0];
  const overlayImage = overlay.children[0];

  document.dispatch('wheel', makeEvent({ target: overlayImage, deltaY: -100 }));
  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(1.25)');

  const zeroDeltaEvent = document.dispatch(
    'wheel',
    makeEvent({ target: overlayImage, deltaY: 0 })
  );

  assert.equal(zeroDeltaEvent.defaultPrevented, false);
  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(1.25)');
});

test('overlay wheel down at minimum zoom does not block page scroll', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  document.dispatch('click', makeEvent({ target: image }));
  const overlay = document.documentElement.children[0];
  const overlayImage = overlay.children[0];

  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(1)');

  const event = document.dispatch('wheel', makeEvent({ target: overlayImage, deltaY: 100 }));

  assert.equal(event.defaultPrevented, false);
  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(1)');
});

test('overlay wheel up at maximum zoom does not block page scroll', () => {
  const { document } = loadContentScript();
  const image = new FakeImage({ width: 200, height: 150 });

  document.dispatch('click', makeEvent({ target: image }));
  const overlay = document.documentElement.children[0];
  const overlayImage = overlay.children[0];

  for (let i = 0; i < 28; i += 1) {
    document.dispatch('wheel', makeEvent({ target: overlayImage, deltaY: -100 }));
  }

  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(8)');

  const event = document.dispatch('wheel', makeEvent({ target: overlayImage, deltaY: -100 }));

  assert.equal(event.defaultPrevented, false);
  assert.equal(overlayImage.style.transform, 'translate(0px, 0px) scale(8)');
});
