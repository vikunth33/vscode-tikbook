
## Known Issues

* Early builds & conceptional to get feedback on issue of a "RouterOS Notebook"
* VSCode for Web will load/save TikBook, but it will not be able to run any scripts — this requires CORS support, which RouterOS lacks (*untested if proxing CORS works)


## Changelog
### 0.1.6

#### Changes
* Allow TikBook to work on fully on desktop, including run scripting (introduced 0.1.5) but _all_ work in "VSCode for Web"

#### Fixes
* Build and publish "web" target separate from "all others", to allow `--target node` to be used for desktop, which bypasses CORS on desktop



### 0.1.5

#### Changes
* Extension is listed and installs on _VSCode for Web_ but will not run in desktop nor web (see CORS below)

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
