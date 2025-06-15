
## Known Issues

* Early builds & conceptional to get feedback on issue of a "RouterOS Notebook"
* VSCode for Web does not load TikBook, yet
  * _Note_ running scripts from VSCode for web would be a different step.  But a TikBook should at least load in web — running RouterOS scripts requires CORS support, which RouterOS lacks

## Changelog

### 0.1.5

#### Changes
* Extension appears and install on VSCode for Web but fails to open a TikBook nor run commands

#### Fixes
* _Attempted_ fix, using `--target=browser` not `--target=node` in `package.json`
  * Which mean changes to build, since --target=node if desired on desktop, CORS is enforced.
* Remove nascent `package-lock.json`

### 0.1.4

#### Changes
* Initial to enabled for "VSCode for Web"

#### Fixes
* Add `browser` to `package.json` & removed `main`

### 0.1.3

#### Changes
* Checkin and build in GitHub

#### Fixes
* Copied base code and infra from `tikoci/lsp-routeros-ts`

> Prior builds were not on GitHub
