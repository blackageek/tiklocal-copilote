import * as vscode from 'vscode';
import { OllamaClient } from './ollama-client';
import * as path from 'path';
import * as fs from 'fs';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatContext {
    type: 'selection' | 'fullFile';
    content: string;
    language: string;
    lineRange?: string;
}

export function activate(context: vscode.ExtensionContext) {
    const ollama = new OllamaClient();
    let activeWebview: vscode.WebviewPanel | undefined;
    let chatHistory: ChatMessage[] = [];
    let currentContext: ChatContext | null = null;
    let currentModel = 'starcoder'; // Modèle par défaut

    const createWebview = (): vscode.WebviewPanel => {
        const panel = vscode.window.createWebviewPanel(
            'localCopilotChat',
            'Local Copilot',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))
                ]
            }
        );

        const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'webview.html');
        panel.webview.html = fs.readFileSync(htmlPath, 'utf-8');

        return panel;
    };

    const updateContext = (editor: vscode.TextEditor) => {
        if (editor.selection && !editor.selection.isEmpty) {
            currentContext = {
                type: 'selection',
                content: editor.document.getText(editor.selection),
                language: editor.document.languageId,
                lineRange: `Lignes ${editor.selection.start.line + 1}-${editor.selection.end.line + 1}`
            };
        } else {
            currentContext = {
                type: 'fullFile',
                content: editor.document.getText(),
                language: editor.document.languageId,
                lineRange: `Fichier entier (${editor.document.lineCount} lignes)`
            };
        }
        
        if (activeWebview) {
            activeWebview.webview.postMessage({
                type: 'contextUpdate',
                context: currentContext,
                currentModel: currentModel
            });
        }
    };

    const fetchModels = async (): Promise<string[]> => {
        try {
            const models = await ollama.getAvailableModels();
            return models.length > 0 ? models : ['starcoder'];
        } catch (error) {
            console.error("Failed to fetch models:", error);
            return ['starcoder'];
        }
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('local-copilot.chat', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("Ouvrez un fichier de code d'abord !");
                return;
            }

            // Sélection du modèle
            const models = await fetchModels();
            const selectedModel = await vscode.window.showQuickPick(models, {
                placeHolder: `Modèle actuel: ${currentModel}`,
                title: 'Sélectionnez un modèle Ollama'
            });

            if (selectedModel) {
                currentModel = selectedModel;
                ollama.setModel(currentModel);
            }

            if (!activeWebview) {
                activeWebview = createWebview();
                updateContext(editor);
                
                activeWebview.webview.onDidReceiveMessage(async message => {
                    if (!activeWebview || !currentContext) return;

                    switch (message.type) {
                        case 'ready':
                            activeWebview.webview.postMessage({
                                type: 'init',
                                history: chatHistory,
                                context: currentContext,
                                currentModel: currentModel
                            });
                            break;
                            
                        case 'send':
                            const userMessage: ChatMessage = {
                                role: 'user',
                                content: message.content,
                                timestamp: Date.now()
                            };
                            chatHistory.push(userMessage);
                            activeWebview.webview.postMessage({
                                type: 'message',
                                message: userMessage
                            });

                            activeWebview.webview.postMessage({
                                type: 'loading',
                                state: true
                            });

                            try {
                                const response = await ollama.generate(`
                                    ${userMessage.content}
                                    ---
                                    [${currentContext.language}] ${currentContext.lineRange}
                                    \`\`\`${currentContext.language}
                                    ${currentContext.content}
                                    \`\`\`
                                    ---
                                    IMPORTANT:
                                    -Répond de manière concise et pertinente
                                    - pour le code mettre dans un bloc markdown
                                    - apres le markdown explique les modifications apportées ou ce que tu fait
                                    - Format: \`\`\`${currentContext.language}\ncode\n\`\`\`
                                `);

                                const assistantMessage: ChatMessage = {
                                    role: 'assistant',
                                    content: response,
                                    timestamp: Date.now()
                                };
                                chatHistory.push(assistantMessage);
                                activeWebview.webview.postMessage({
                                    type: 'message',
                                    message: assistantMessage
                                });
                            } catch (error) {
                                vscode.window.showErrorMessage(`Erreur avec le modèle ${currentModel}: ${error instanceof Error ? error.message : String(error)}`);
                            } finally {
                                activeWebview.webview.postMessage({
                                    type: 'loading',
                                    state: false
                                });
                            }
                            break;

                        case 'applyCode':
                            if (editor) {
                                editor.edit(editBuilder => {
                                    if (editor.selection && !editor.selection.isEmpty) {
                                        editBuilder.replace(editor.selection, message.code);
                                    } else {
                                        const fullRange = new vscode.Range(
                                            editor.document.positionAt(0),
                                            editor.document.positionAt(editor.document.getText().length)
                                        );
                                        editBuilder.replace(fullRange, message.code);
                                    }
                                });
                            }
                            break;

                        case 'changeModel':
                            const models = await fetchModels();
                            const selectedModel = await vscode.window.showQuickPick(models, {
                                placeHolder: `Modèle actuel: ${currentModel}`,
                                title: 'Changer de modèle Ollama'
                            });
                            if (selectedModel) {
                                currentModel = selectedModel;
                                ollama.setModel(currentModel);
                                activeWebview.webview.postMessage({
                                    type: 'modelChanged',
                                    model: currentModel
                                });
                            }
                            break;
                    }
                });

                activeWebview.onDidDispose(() => {
                    activeWebview = undefined;
                });
            }

            activeWebview.reveal();
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(e => {
            if (activeWebview && e.textEditor === vscode.window.activeTextEditor) {
                updateContext(e.textEditor);
            }
        })
    );
}

export function deactivate() {}