### **TikBook** -  _a_ literate _way to work with RouterOS scripts in VSCode..._
_Currently in early/conceptual stages — feedback welcome!_

![screenshot-desktop](https://raw.githubusercontent.com/tikoci/vscode-tikbook/refs/heads/main/.github/screenshot-vscode-desktop.png)

**TikBook** is a VSCode extension that introduces **Notebook support** for MikroTik RouterOS scripts, providing a "notebook" environment for working with `.rsc` scripts in a more readable and modular format — combining Markdown and code cells.  TikBook is fully compatible with RouterOS scripts: TikBook files are valid `.rsc` files with a few special comment conventions.  If you're not familiar with notebooks, it is a way of mixing runnable code and text in the same document, see examples from other languages, like [Python's Jupyter](https://jupyter.org), [Julia's Pluto](https://plutojl.org), or [JavaScript's Observable](https://observablehq.com).  

> [!TIP] 
>
> Use TikBook alongside the [RouterOS LSP](https://marketplace.visualstudio.com/items?itemName=TIKOCI.lsp-routeros-ts) VSCode Extension for full syntax highlighting and diagnostics.


### Features
- ✍️ **Literate RouterOS scripting** using Markdown cells (`#|`) - embedded in `.rsc` files.
- 📚 **Notebook interface** for RouterOS scripts (`*.tikbook.rsc`), - compatible with native `.rsc` syntax.
- 🚀 **Run code cells** directly via the RouterOS REST API (using - `:execute as-string`), from within VSCode.
- 💾 **compatible** since `.tikbook.rsc` files are still valid - RouterOS scripts.
- 🌐 **VSCode for Web** support (limited, see CORS note).

### Quick Start

1. Install [TikBook for RouterOS](https://marketplace.visualstudio.com/items?itemName=TIKOCI.tikbook) from the VSCode Marketplace.
2. _Optional_ install the [RouterOS LSP](https://marketplace.visualstudio.com/items?itemName=TIKOCI.lsp-routeros-ts) for syntax support.
3. _Optional_ Configure RouterOS REST API settings under Settings > Extensions > TikBook for RouterOS to allow execution of scripts:
    * Open VSCode Settings (`Ctrl+,` or `Cmd+,`)
    * Search for “TikBook for RouterOS”
    * Set:
      * _Base URL_ - like `http://192.168.88.1` - no trailing `/` or paths - or use `https://192.168.88.1:12345` for non-standard port
      * _Username_ - with at least `read,api,rest-api` permissions
      * _Password_ 
    > _No RouterOS REST API configuration or access is needed for only editing/saving — only for cell execution ("Run").  See Security Consideration below for more details on setup._
4. Create a new file with the `.tikbook.rsc` extension — Notebook UI will appear.
5. Run code cells or edit Markdown descriptions as desired.




> [!TIP]
>
> Works with VSCode for Web — like https://github.dev - and can be installed by searching Extensions for "TikBook for RouterOS".
>
> With the extension you can edit and save - in VSCode for Web just like Desktop:  
> ![screenshot-web](https://raw.githubusercontent.com/tikoci/vscode-tikbook/refs/heads/main/.github/screenshot-vscode-web.png)
>
> TikBook runs in [VSCode for Web](https://github.dev), but cannot **execute** cells due to CORS restrictions - only **editing**.  RouterOS does not support the required preflight (`OPTIONS`) headers to enable CORS to work in VSCode for Web.  One potential workaround is using a local reverse proxy (e.g. Traefik, see MikroTik Forum for details) to inject proper CORS headers when routing REST requests – but works to enable "Run" in VSCode for Web with TikBook.



> [!TIP]
>
> Both "Known Issues" and a per-version "Changelog" (as well as future feature tracking) are now in [`CHANGELOG.md`](https://github.com/tikoci/vscode-tikbook/blob/main/CHANGELOG.md) which tracks the _current_ state of affairs for `vscode-tikbook`.




### Security Considerations

If you do not want to "Run" a TikBook, you technically do not need a RouterOS account configured.  In this mode, scripts are still visualized in Markdown in the Notebook interface and be edited and saved too.  


TikBook for RouterOS does not strictly need "write" or "sensitive" policies.  As such, it is highly recommended to avoid using "full" users in the configuration.  Instead, a new RouterOS user can be used to limit the needed permissions.  To create one with the minimum, use:
```
/user/group add name=list policy=read,api,rest-api
/user add name=lsp password=changeme group=lsp
```
_The defaults/example configuration uses the above – change as needed._

On the router, either the "www" or "www-ssl" service must be enabled, and accessible to any editor using the TikBook.  _Firewall configuration may need to be adjusted too, specific to your environment._

By default on RouterOS, only unsecured HTTP access is enabled.  To enable HTTPS if not already enabled, use:
```
/certificate/enable-ssl-certificate 
/ip/service enable www-ssl
```
_TikBook for RouterOS also defaults to plain HTTP, so TikBook configuration needs to change from http:// to https://_ too._

Also, when using "https://" (TLS), the certificate chain must be valid on the local system – self-signed certificates may not work.  And, TikBook has **no** "allow unsafe certificates" option, so the router TLS certificate (CAs and intermediates) must be installed via OS into the system's "keychain" (certificate store).

> [!TIP]
> A virtual machine can be used with the "free" version of RouterOS's "CHR" as the `baseUrl`.  This approach avoids storing any "real" router's password in the TikBook configuration.  
>
> For Mac, UTM can be used as the host, and tikoci's "mikropkl" has ready-to-use images that bring up RouterOS CHR in a few steps, see [tikoci/mikropkl](https://github.com/tikoci/mikropkl) for details. 


## `*.tikbook.rsc` Spec

TikBook is built on plain `.rsc` files with three special comment prefixes:


| Prefix | Purpose |
|--------|---------|
| `#|`   | Markdown content (rendered as text cells) |
| `#.` | Cell break / metadata marker |
| `#>` | Output capture (future) |

All other content is treated as RouterOS script. Examples:

```rsc
#| ## Configure VLANs
#| This cell sets up **VLAN** interfaces.

/interface vlan
add name=vlan10 vlan-id=10 interface=ether1
add name=vlan20 vlan-id=20 interface=ether1

#. cell:metadata
```

TikBook files are UTF-8 encoded and use `\n` newlines (normalized on save).

The default extension is `*.tikbook.rsc`, which is used to trigger VSCode's Notebook interface and use this extension.  But the end `.rsc` allows the same script to work with "RouterOS LSP" and other syntax colorizers that recognize the `*.rsc` as RouterOS script — since a TikBook is still a valid `.rsc`. 

> Using `*.tikbook` as the extension - without `rsc` - is also accepted by the extensions.  However, the "two-level naming" allows editors, other than VSCode, to trigger on RouterOS syntax since most map `*.rsc` to RouterOS.

While starting from a single `rsc` script file, TikBook parses the script to break it up into individual "notebook cells".  The "trick" – and what makes a normal `.rsc` also a TikBook is it uses a few special `#` comments:
  * `#| ` at start of line is to store Markdown text in a regular `rsc` script since the marker is still a comment in RouterOS — but TikBook uses it to render Markdown in the VSCode Notebook.  There is always a space after `#| ` to keep `md` readable when viewed as a plain script file.
  * `#.` at start of line is used to separate a RouterOS script into two notebook cells.  `#|` automatically splits script code into cells, so the `#.` is **not** always needed since Markdown can be used. Text after `#.` is allowed, but reserved for use by TikBook to store notebook metadata.
  * `#>` at start of line is used to, optionally, store outputs from a notebook run - so the _results_ can be persisted and viewed later.  _Future_ 

With specific rules on formatting:
* Any whitespace is presumed to be part of a code cell, with either Markdown `#|` or Meta `#.` separating RouterOS script code into different cells.
* TikBook newlines are always use `\n`, even if original uses `\r\n` those are to preserved when saving.  `\r\n` is allowed as input, but on save they will converted to `\n`.
* TikBook files use UTF-8 encoding.  

> [!NOTE]
>
> "Rules" for serialization of whitespace get tricky and opinionated.  Currently, all whitespace is stored with code and presented as-in in Notebook.  But open question is whether whitespace be added before and after any "special comments" when serializing (saving) to allow "pretty" output in the `rsc` script.  But since when deserialized (loading) into Notebook, the same leading/ending whitespace is not "pretty" as there is already a bounding box and controls around the script code in Notebook.  So a `trim()` on loaded cells is likely desirable in the future while still keeping whitespace when saved.  

### TypeScript Implementation

The TikBook code is in [`tikoci/vscode-tikbook` on GitHub](https://github.com/tikoci/vscode-tikbook).  It uses Microsoft's [TypeScript library for VSCode extensions](https://code.visualstudio.com/api/get-started/your-first-extension).  These are then bundled by [`bun`](https://bun.sh) into "-web" and "-node" (desktop) targets since packaging TypeScript varies between normal VSCode and VSCode for Web.  The implementation is largely based on the framework from [RouterOS LSP project](https://github.com/tikoci/lsp-routeros-ts), and that project has more details on implementation.

TikBook is built using the official [VSCode Notebook API](https://code.visualstudio.com/api/extension-guides/notebook) and the TypeScript extension framework from [RouterOS LSP](https://github.com/tikoci/vscode-routeros-lsp).  See Microsoft's [Your First Extension]([TypeScript library for VSCode extensions](https://code.visualstudio.com/api/get-started/your-first-extension) for basic background on structure.

#### Local Development

You will need `git` and [`bun`](https://bun.sh) installed, and obviously VSCode too.  But the basic local development setup start with: 
```bash
git clone https://github.com/tikoci/vscode-tikbook
cd vscode-tikbook
bun install
bun compile
code .
```

Then make changes as desired.  
> Press F5 to launch the extension in debug mode in a new VSCode window

To package a local build as VSIX file, use `bun run vsix:package` which create an installable extension package, from your development environment.  

If you make changes to vscode-tikbook, feel free to make "pull request" with anything useful to others.

> #### Disclaimers
> **Not affiliated, associated, authorized, endorsed by, or in any way officially connected with MikroTik, Apple, nor UTM from Turing Software, LLC.**
> **Any trademarks and/or copyrights remain the property of their respective holders** unless specifically noted otherwise.
> Use of a term in this document should not be regarded as affecting the validity of any trademark or service mark. Naming of particular products or brands should not be seen as endorsements.
> MikroTik is a trademark of Mikrotikls SIA.
> Apple and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions.
> **No liability can be accepted.** No representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information is offered.  Use the concepts, code, examples, and other content at your own risk. There may be errors and inaccuracies, that may of course be damaging to your system. Although this is highly unlikely, you should proceed with caution. The author(s) do not accept any responsibility for any damage incurred. 