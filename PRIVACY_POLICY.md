# Privacy Policy — YT Skipper

**Last updated:** 2025-01-01

## Overview

YT Skipper is a browser extension that automatically skips the first N seconds of YouTube videos. This policy explains what data the extension accesses and how it is handled.

## Data Collection

**YT Skipper does not collect, transmit, store, or share any personal data.**

The extension operates entirely within your browser. No data is sent to any external server.

## Data Stored Locally

The extension stores only the following user preferences using `browser.storage.sync`:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `skipSeconds` | integer | `5` | Number of seconds to skip at the start of each video |
| `enabled` | boolean | `true` | Whether the extension is currently active |

These values are stored by your browser's built-in sync storage. If you are signed into your browser with a Google or Mozilla account, these preferences may sync across your devices according to your browser's own sync privacy policy.

## Permissions Explained

| Permission | Reason |
|------------|--------|
| `storage` | Save your skip duration and enabled/disabled preference |
| `host_permissions: *.youtube.com` | Detect video playback and advance the playhead on YouTube pages only |

The extension **does not** request access to:
- Your browsing history
- Cookies or authentication tokens
- Any data outside of YouTube pages
- The network (no external requests are made)

## Third-Party Services

YT Skipper does not use any third-party analytics, tracking, or advertising services.

## Changes to This Policy

If this policy is updated, the new version will be published alongside the extension update on the Chrome Web Store and Firefox Add-ons.

## Contact

For questions or concerns, open an issue on the project's repository.
