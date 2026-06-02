# Chrome Web Store Listing - Image Zoom

> Last Updated: 2026-06-02

## Store Listing

**Extension Name**

Image Zoom

**Short Description**

Zoom images with click-first inline zoom and a full-page overlay.

**Detailed Description**

Image Zoom lets you zoom images on normal web pages without opening a new tab.

Click a useful image that is not inside a link to open a full-page overlay. Linked images keep their normal page link click. After an image has been clicked once, scroll over that same image to zoom it inline. In the overlay, scroll to zoom, drag to pan, press Escape to close, or click the dark background to close.

The extension ignores tiny images under 80px wide or 80px tall, which helps avoid icons, avatars, sprites, unloaded images, and tracking pixels.

Image Zoom has no popup, no account, no analytics, and no server. It runs locally in your browser. When a page provides a larger `srcset` image, the overlay may use that existing page image URL so the zoomed view looks sharper. The website hosting the image may receive the normal image request.

**Category**

Photos

**Single Purpose**

Let users zoom selected images on http and https web pages inline or in a full-page overlay.

**Primary Language**

English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|------------|--------|----------|
| Store icon | 128x128 PNG | Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280x800 PNG | Ready | `store-assets/screenshot-overlay-1280x800.png` |
| Small promo tile | 440x280 PNG | Ready | `store-assets/small-promo-tile-440x280.png` |

### Screenshot Notes

Use `store-assets/screenshot-overlay-1280x800.png` as the first screenshot. It should show the zoom overlay open on the manual test page, because that is the main user-visible feature.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `http://*/*` | content script match | Image Zoom needs to run on normal http pages so it can detect image elements under the pointer and provide click-first inline zoom and overlay zoom. |
| `https://*/*` | content script match | Image Zoom needs to run on normal https pages so it can detect image elements under the pointer and provide click-first inline zoom and overlay zoom. |

The extension requests no Chrome API permissions and no `host_permissions`.

## Privacy & Data Use

**Does the extension collect user data?**

No.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|------------|-------------------------|---------|----------------------------|
| Personally identifiable info | No | No | Not collected | No |
| Health info | No | No | Not collected | No |
| Financial info | No | No | Not collected | No |
| Authentication info | No | No | Not collected | No |
| Personal communications | No | No | Not collected | No |
| Location | No | No | Not collected | No |
| Web history | No | No | Not collected | No |
| User activity | No | No | Not collected | No |
| Website content | No | No | Page image elements are processed locally only for zoom behavior. | No |

### Data Use Certification

- Data is not sold to third parties.
- Data is not used for purposes unrelated to the extension's core functionality.
- Data is not used for creditworthiness or lending purposes.

## Privacy Policy

Use this public privacy policy URL in the Chrome Web Store Developer Dashboard:

```text
https://liewcf.github.io/imagezoom/privacy/
```

## Distribution

**Visibility**: Public

**Regions**: All regions

**Pricing**: Free

## Developer Info

**Publisher Name**

Owner input needed before submission.

**Contact Email**

Owner input needed before submission.

**Support URL / Email**

https://github.com/liewcf/imagezoom/issues

**Homepage URL**

https://liewcf.github.io/imagezoom/

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1.1 | 2026-06-02 | Patch version bump, listing copy refresh, and linked-image click handling fix. | Draft |
| 0.1.0 | 2026-05-29 | Initial Chrome Web Store package with content-script image zoom, PNG icons, store assets, privacy policy text, and clean ZIP packaging. | Draft |

## Review Notes

### Known Limits

- The extension runs on `http://` and `https://` pages only.
- It does not run on `chrome://` pages, Chrome Web Store pages, extension pages, or local file URLs.
- It has no popup, settings page, storage, service worker, or custom site list in version `0.1.1`.

### Submission Steps

1. Run `scripts/package-extension.sh`.
2. Upload `dist/image-zoom-v0.1.1.zip` in the Chrome Developer Dashboard.
3. Fill in the Store Listing, Privacy, and Distribution tabs using this file.
4. Add the hosted privacy policy URL: `https://liewcf.github.io/imagezoom/privacy/`.
5. Add the owner publisher name, contact email, support URL or email, and homepage URL.
6. Submit for review.
