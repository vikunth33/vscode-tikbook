# TikBook for RouterOS

### _a_ literate _way to work with RouterOS scripts in VSCode..._
> More conceptual than functional at this point.  For example, readme is pretty incomplete.  Feel free to try the extension, and report.

![screenshot-desktop](https://raw.githubusercontent.com/tikoci/vscode-tikbook/refs/heads/main/.github/screenshot-vscode-desktop.png)

The TikBook VSCode Extensions provide a "Notebook" interface on MikroTik RouterOS script and configuration.  If you're not familiar with notebooks, it a way of mixing runnable code and text in same document, with example like Jupyter, Pluto, or Observable.  

The only different between a "TikBook" and "normal" RouterOS script is the use of special comments — and since comments are ignored by RouterOS – a TikBook works on RouterOS unmodified.  So a `.tikbook.rsc` file is really just a RouterOS some "coding conventions" like that `/^#| .*$/` means embedded `.md` Markdown content.


### `.tikbook.rsc` Format

As applied to RouterOS, script can be put into individual "notebook cells" and mixed with Markdown text. **The TikBook notebook is still a valid RouterOS `.rsc` script when saved and loaded.**   The "trick" – and what makes a normal `.rsc` also a TikBook is it uses just two special `#` comments:
  * `#|` at start of line is to store Markdown text into a regular script, as a comment RouterOS ignores it — but TikBook uses it to render Markdown in the VSCode Notebook.
  * `#.` at start of line is used to separate a RouterOS script into two notebook cells.  `#|` automatically splits script code into cells, so the `#.` is **not** always needed since Markdown can be used. 

The default extension is `*.tikbook.rsc`, which is used to trigger VSCode's Notebook interface and use this extension.  But the end `.rsc` allows the same script to work with "RouterOS LSP" and other syntax colorizers that recognize the `*.rsc` as RouterOS script — since a TikBook is still a valid `.rsc`.  

> [!TIP]
>
> Works with VSCode for Web — like https://github.dev too!
>
>  _...Almost, "Run" is not supported.  Well, it is supported, but RouterOS does not accept REST API with CORS headers so browser does not allow the needed HTTP calls._  
>
>But you can edit and save - in VSCode for Web too:  
> ![screenshot-web](https://raw.githubusercontent.com/tikoci/vscode-tikbook/refs/heads/main/.github/screenshot-vscode-web.png)

#### Uses Cases
* Do "partial" runs of a larger script, with Markdown available to document the code
* Document configuration using Markdown


> [!TIP]
>
> Both "Known Issues" and a per-version "Changelog" (as well as future feature tracking) are now in [`CHANGELOG.md`](https://github.com/tikoci/vscode-tikbook/blob/main/CHANGELOG.md) which tracks the _current_ state of affairs for `vscode-tikbook`.

## Install and Configuration

### Enabling RouterOS REST API 

If you just want to read/write TikBook files, no REST API connection is needed.  However, to run RouterOS code in Notebook cell, a valid REST API connection is needed.


Using a different RouterOS account with lower permissions is recommended.  See "Security Considerations" for more details.


##### Configuring TikBook

Launch VSCode, if not already running. TikBook configuration can be done by "Open User Settings":
1. Use <kbd>Ctrl</kbd> + <kbd>,</kbd> (on Mac, <kbd>⌘</kbd> + <kbd>,</kbd>) to show settings
2. Select "Extensions" from left
3. Locate "TikBook for RouterOS" section in the list of extensions
4. Adjust the "Base URL" with the IP address and protocol needed (_without_ trailing slash or path), and provide username and password with at least `policy=read,api,rest-api` access to RouterOS
5. Close the Settings window. Settings should be picked up automatically.


##### Customizing Colors in VSCode

These are controlled by "RouterOS LSP" — no syntax checking or coloring in TikBook itself.  It's expected the "RouterOS LSP" will be used along side this extension — both come from TIKOCI and designed to work together. 


##### Troubleshooting VSCode and TikBook for RouterOS

TikBook for RouterOS logs most operations, perhaps too many.  If there are problems, logs may offer clues and be needed to provide any fix.

In VSCode, logs go to the "Output" view.  To bring up the "Output" view, use <kbd>Shift</kbd> + <kbd>⌘</kbd> + <kbd>U</kbd> then
select "TikBook for RouterOS" from the dropdown at top to show the logs. 


### Security Considerations

If you do not want to "Run" a TikBook, you technically do not need a RouterOS account to be used.  In this mode, scripts are still visualized in Markdown in Notebook interface, and be edited and saved too.  


TikBook for RouterOS does strictly need "write" or "sensitive" policies.  As such, it is highly recommended to avoid using "full" users in the configuration.  Instead, a new RouterOS user can be used to limit the needed permissions.  To create one, use:
```
/user/group add name=list policy=read,api,rest-api
/user add name=lsp password=changeme group=lsp
```
_The defaults/example configuration uses the above – change as needed._

On the router, either the "www" or "www-ssl" service must be enabled, and accessible to any editor using the TikBook.  Firewall configuration may need to be adjusted, but beyond the scope here. 


By default on RouterOS, only unsecured HTTP access is enabled.  To enable HTTPS, if not already enabled, use:
```
/certificate/enable-ssl-certificate 
/ip/service enable www-ssl
```
_TikBook for RouterOS also defaults to plain HTTP, so TikBook configuration needs to change from http:// to https://_ too._

Also, when using "https://" (TLS), the certificate chain must be valid on local system. So self-signed certificates on REST API may not work out-of-box.
> Also TikBook has **no** "allow unsafe certificates" option, so the router TLS certificate (and/or it's CAs and intermediates) must be installed via OS into the system's "keychain" (certificate store).

> [!TIP]
> A virtual machine can be used with the "free" version of RouterOS's "CHR" as the `baseUrl`.  This approach avoids storing any "real" router's password in the TikBook configuration.  
>
> For Mac, UTM can be used as the host, and tikoci's "mikropkl" has ready-to-use images can bring up RouterOS CHR in a few steps, see [tikoci/mikropkl](https://github.com/tikoci/mikropkl) for details. 


## Implementation and Development

The code uses Microsoft's node/TypeScript NPM library for VSCode extensions.  See project repo for code — which is largely based on framework from "RouterOS LSP" — that has more information on developing RouterOS-based VSCode Extensions.





> #### Disclaimers
> **Not affiliated, associated, authorized, endorsed by, or in any way officially connected with MikroTik, Apple, nor UTM from Turing Software, LLC.**
> **Any trademarks and/or copyrights remain the property of their respective holders** unless specifically noted otherwise.
> Use of a term in this document should not be regarded as affecting the validity of any trademark or service mark. Naming of particular products or brands should not be seen as endorsements.
> MikroTik is a trademark of Mikrotikls SIA.
> Apple and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions. UNIX is a registered trademark of The Open Group. 
> **No liability can be accepted.** No representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information is offered.  Use the concepts, code, examples, and other content at your own risk. There may be errors and inaccuracies, that may of course be damaging to your system. Although this is highly unlikely, you should proceed with caution. The author(s) do not accept any responsibility for any damage incurred. 