
import { workspace, notebooks, ExtensionContext, NotebookSerializer, CancellationToken, NotebookData, NotebookCellData, NotebookCellKind, NotebookController, NotebookCell, NotebookDocument, NotebookCellOutput, NotebookCellOutputItem, window, commands, WebviewViewProvider, WebviewView, Uri, WebviewViewResolveContext, SnippetString, ViewColumn, Webview, env, ProgressLocation, QuickPickItem } from "vscode";
import axios = require('axios');
import path = require("path");

const output = window.createOutputChannel("RouterOS TikBook", "tikbook")
const settings = workspace.getConfiguration("tikbook")
output.appendLine(JSON.stringify(settings))
export function activate(context: ExtensionContext) {
    // Register "tikbook" as RouterOS Notebook format
    context.subscriptions.push(
        workspace.registerNotebookSerializer('tikbook', new TikbookSerializer(),),
        new TikbookController(),
        commands.registerCommand('tikbook.cmd.routeros.active.config.show', () => {
            window.showInformationMessage("TODO")
        }),
        commands.registerCommand('tikbook.cmd.tikociHome.browse', () => {
            env.openExternal(Uri.parse("https://tikoci.github.io"));
        }),
        commands.registerCommand('tikbook.cmd.tikociDiscussions.browse', () => {
            env.openExternal(Uri.parse("https://github.com/orgs/tikoci/discussions"));
        }),
        commands.registerCommand('tikbook.cmd.tikociGithubRepos.browse', async () => {
            const organization = 'tikoci';

            try {
                // Show loading message
                await window.withProgress({
                    location: ProgressLocation.Notification,
                    title: `Fetching repositories for ${organization}...`,
                    cancellable: false
                }, async (progress) => {
                    try {
                        // Fetch repositories from GitHub API
                        const repos = await fetchGitHubRepos(organization);

                        if (repos.length === 0) {
                            window.showWarningMessage(`No public repositories found for organization: ${organization}`);
                            return;
                        }

                        // Convert repos to QuickPickItems
                        const options: QuickPickItem[] = repos.map(repo => ({
                            label: `$(repo) ${repo.name}`,
                            description: repo.language ? `${repo.language} • ⭐ ${repo.stargazers_count}` : `⭐ ${repo.stargazers_count}`,
                            detail: repo.description || 'No description available',
                            // Store the repo data for later use
                            repo: repo
                        } as QuickPickItem & { repo: GitHubRepo }));

                        // Show the QuickPick
                        const selected = await window.showQuickPick(options, {
                            placeHolder: `Select a repository from ${organization}`,
                            matchOnDescription: true,
                            matchOnDetail: true
                        });

                        if (selected) {
                            const selectedRepo = (selected as any).repo as GitHubRepo;
                            env.openExternal(Uri.parse(selectedRepo.html_url));
                        }

                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        window.showErrorMessage(`Failed to fetch repositories: ${errorMessage}`);
                    }
                });

            } catch (error) {
                window.showErrorMessage('An unexpected error occurred');
            }
        }),
        commands.registerCommand('tikbook.cmd.mikrotikForum.browse', () => {
            env.openExternal(Uri.parse("https://forum.mikrotik.com"));
        }),
        commands.registerCommand('tikbook.cmd.mikrotikJira.browse', () => {
            env.openExternal(Uri.parse("https://help.mikrotik.com/servicedesk/servicedesk"));
        }),
        commands.registerCommand('tikbook.cmd.mikrotikConfluenceRouterOS.scripting.browse', () => {
            env.openExternal(Uri.parse("https://help.mikrotik.com/docs/x/XQDWAg"));
        }),
        commands.registerCommand('tikbook.cmd.mikrotikConfluenceRouterOS.browse', () => {
            env.openExternal(Uri.parse("https://help.mikrotik.com/docs"));
            /*
            // WebView Panel Code - but turns out not easy to get it follow links
            const panel = window.createWebviewPanel(
                'mikrotik-routeros-docs-html',
                'MikroTik RouterOS Documentation',
                ViewColumn.One,
                {
                    enableScripts: false
                }
            );
            const htmlPath = path.join(context.extensionPath, 'docs', 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            panel.webview.html = htmlContent;
            */
        })
    );
}

export function deactivate() {
}


// Notebook code based on https://code.visualstudio.com/api/extension-guides/notebook
const markdownMark = "|"
const codeEndMark = "."
const langid = "routeros"
const encoding = "utf-8"

class TikbookSerializer implements NotebookSerializer {
    async deserializeNotebook(
        content: Uint8Array,
        _token: CancellationToken
    ): Promise<NotebookData> {
        var decoded: string[] | null = new TextDecoder(encoding)
            .decode(content)
            ?.replace(/\r\n|\r/g, '\n')
            ?.split('\n')

        let cells: NotebookCellData[] = []
        let pendingMarkdown: string = ""
        let pendingCode: string = ""

        decoded.forEach((itemRaw, index) => {
            const item = itemRaw.trim()
            const isMarkdown = item[0] === '#' && item[1] === markdownMark
            const isCodeEndMark = item[0] === '#' && item[1] === codeEndMark
            const isLast = index === decoded.length - 1
            const isBlank = item.trim() === ""

            if (isMarkdown) {
                pendingMarkdown += `${item.substring(3)}\n`
            } else {
                if (!isCodeEndMark) pendingCode += `${item}\n`
            }
            if ((isLast || isMarkdown || isCodeEndMark) && pendingCode) {
                cells.push(new NotebookCellData(NotebookCellKind.Code, pendingCode, langid))
                pendingCode = ""
            }
            if ((isLast || !isMarkdown || isBlank) && pendingMarkdown) {
                cells.push(new NotebookCellData(NotebookCellKind.Markup, pendingMarkdown, "markdown"))
                pendingMarkdown = ""
            }
        })
        return new NotebookData(cells);
    }

    async serializeNotebook(
        data: NotebookData,
        _token: CancellationToken
    ): Promise<Uint8Array> {
        let contents: string[] = [];
        let lastCellType: number = NotebookCellKind.Markup
        for (const cell of data.cells) {
            if (cell.kind === NotebookCellKind.Markup) {
                // Markdown may may have new lines...
                // but to be "safe" in .rsc, each line needs to have the "#!" prefix 
                // since comments are are terminated by `\n`  
                cell.value
                    ?.replace(/\r\n|\r/g, '\n')
                    ?.split('\n')
                    .forEach(item => {
                        contents.push(`#${markdownMark} ${item}`)
                    })
                lastCellType = NotebookCellKind.Markup
            }
            else {
                if (lastCellType === NotebookCellKind.Code) {
                    contents.push(`${cell.value}\r\n#${codeEndMark}`)
                } else {
                    contents.push(`${cell.value}`)
                }

            }
        }

        return new TextEncoder().encode(contents.join('\n'));
    }
}


class TikbookController {
    readonly controllerId = 'tikbook';
    readonly notebookType = 'tikbook';
    readonly label = 'TikBook (:execute)';
    readonly supportedLanguages = ['routeros'];


    private readonly _controller: NotebookController;
    private _executionOrder = 0;
    dispose() { }

    constructor() {
        this._controller = notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );

        this._controller.supportedLanguages = this.supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._execute.bind(this);
    }

    private _execute(
        cells: NotebookCell[],
        _notebook: NotebookDocument,
        _controller: NotebookController
    ): void {
        for (let cell of cells) {
            this._doExecution(cell);
        }
    }

    private async _doExecution(cell: NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now()); // Keep track of elapsed time to execute cell.

        // TODO: MUST use really settings...
        //const settings = { maxNumberOfProblems: 100, baseUrl: 'http://192.168.74.1', username: 'lsp', password: 'changeme', hotlock: true }
        const codeText = cell.document.getText()

        let outputItems: NotebookCellOutputItem[] = []


        const callRestApi = async (path, data) => await axios.post<any>(
            `${settings.baseUrl}/rest${path}`,
            data,
            {
                auth: {
                    username: settings.username || 'lsp',
                    password: settings.password || 'changeme'
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );


        try {
            // "print" is special to enable renders
            if (codeText.includes("print") && codeText.length > 4 && codeText.length < 256) {
                let cleanCodeText = codeText
                    .trim()
                    .substring(0, codeText.indexOf("print") + 5)
                    .replace('\n', ' ')
                    .replace(' ', '/')
                if (cleanCodeText[0] === '/') {
                    const response = await callRestApi("/console/inspect", { request: "highlight", input: cleanCodeText })
                    output.appendLine(JSON.stringify(response.data))
                    const tokens: string[] = response.data[0]?.highlight
                    if (tokens.indexOf("error") === -1 && tokens.indexOf("obj-inactive") === -1) {
                        output.appendLine(cleanCodeText)
                        const response = await callRestApi(cleanCodeText, {})
                        outputItems.push(NotebookCellOutputItem.json(response.data))
                    }
                }
            }

            const response = await callRestApi("/execute", {
                script: codeText,
                "as-string": true
            })
            outputItems.push(NotebookCellOutputItem.text(response.data.ret))
            execution.replaceOutput(new NotebookCellOutput(outputItems));
            execution.end(true, Date.now());
        }
        catch (error) {
            output.appendLine(error);
            execution.replaceOutput([
                new NotebookCellOutput([
                    NotebookCellOutputItem.error(error)
                ])
            ]);
            execution.end(true, Date.now());
        }
    }
}

/* GitHub Repo Fetch */


interface GitHubRepo {
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    updated_at: string;
}

async function fetchGitHubRepos(organization: string = "tikoci"): Promise<GitHubRepo[]> {
    try {
        const response = await axios.get<GitHubRepo[]>(
            `https://api.github.com/orgs/${organization}/repos`,
            {
                params: {
                    type: 'public',
                    sort: 'updated',
                    per_page: 100
                },
                headers: {
                    'User-Agent': 'VSCode-Extension',
                    'Accept': 'application/vnd.github.v3+json'
                },
                timeout: 10000
            }
        );

        return response.data;
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`GitHub API error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('Network error: Unable to reach GitHub API');
        } else if (error.code === 'ECONNABORTED') {
            // Request timeout
            throw new Error('Request timeout: GitHub API is taking too long to respond');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Request error: ${error.message || 'Unknown error occurred'}`);
        }
    }
}
