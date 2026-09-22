# Bypass Links

A browser extension that skips intermediary links, plus a bookmarks manager with person tagging. The web app hosts the public landing page and browser-hosted versions of the extension panels.

## Language

### Surfaces

**Landing page**:
The public home route of the web app that markets the extension and offers the download.
_Avoid_: Homepage, download page, marketing site

**Popup**:
The extension's main window, opened from the browser toolbar. Its home screen shows the bypass controls and entry points to the panels.
_Avoid_: Extension UI, main screen

**Panel**:
A full-height screen for managing one kind of user data: the Bookmarks Panel or the Persons Panel. Panels open from the Popup and also exist as web-hosted routes.
_Avoid_: Page, view, dashboard

### Release

**Release**:
The latest published GitHub release of the extension. Its Chrome zip asset carries the version and publish date shown on the Landing page.
_Avoid_: Build, version bump

### Landing page design

**Product shot**:
A screenshot of the real Popup or a Panel, captured from the extension with every piece of user-generated content replaced by placeholder text before capture.
_Avoid_: Mockup, demo image, hero image

**User-generated content**:
Anything a signed-in user created: folder names, bookmark titles and URLs, person names and photos. Never appears in a Product shot.
_Avoid_: Test data, real data

**Landing theme**:
The light or dark appearance chosen by a visitor on the Landing page. It applies to the Landing page only; Panels stay dark.
_Avoid_: Site theme, app theme
