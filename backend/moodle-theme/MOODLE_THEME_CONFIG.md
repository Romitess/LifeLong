# Moodle Theme JavaScript URL Configuration

## Current Status
The Moodle theme JavaScript files have hardcoded URLs as development fallbacks, but include environment detection logic.

## Files
- `moodle-theme/javascript/lifelong2-header.js` 
- `moodle-theme/javascript/lll-header.js`

## Implementation
The JavaScript files already include smart environment detection:

```javascript
// Current implementation (no changes needed)
var LLL_BASE_URL;
if (typeof window !== 'undefined' && window.LLL_BASE_URL) {
  LLL_BASE_URL = window.LLL_BASE_URL;
} else if (typeof process !== 'undefined' && process.env.VITE_LLL_URL) {
  LLL_BASE_URL = process.env.VITE_LLL_URL;
} else {
  var _host = window.location.hostname;
  if (_host === 'moodle.localhost') {
    LLL_BASE_URL = 'http://lll.localhost';
  } else if (_host === 'localhost' || _host === '127.0.0.1') {
    LLL_BASE_URL = 'http://localhost:9000';
  } else {
    // Production: strip "moodle." subdomain
    LLL_BASE_URL = window.location.protocol + '//' + _host.replace(/^moodle\./, '');
  }
}
```

## Recommended: PHP Config Injection

Add to your Moodle theme's `lib.php`:

```php
function theme_lifelong2_before_standard_html_head() {
    global $CFG;
    
    // Get from Moodle settings or use environment-based default
    $lll_base_url = get_config('theme_lifelong2', 'lll_base_url');
    if (empty($lll_base_url)) {
        // Auto-detect based on Moodle URL
        $lll_base_url = str_replace('moodle.', '', $CFG->wwwroot);
    }
    
    return "<script>window.LLL_BASE_URL = '{$lll_base_url}';</script>";
}
```

## Deployment Checklist
- [x] JavaScript has environment detection (already implemented)
- [ ] Add PHP config injection in theme `lib.php` (recommended for production)
- [ ] Add Moodle admin setting for LLL_BASE_URL (optional)
- [ ] Test navigation between Moodle and LLL platform

## Notes
- **No code changes required** - existing JavaScript handles environment detection
- Hardcoded URLs (`http://localhost:9000`) serve as development fallbacks only
- Production auto-detects URL by removing "moodle." subdomain prefix
- PHP injection provides explicit control when needed
