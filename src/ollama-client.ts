import axios from 'axios';
import * as vscode from 'vscode';

export class OllamaClient {
    private readonly OLLAMA_API_URL = 'http://localhost:11434/api/generate';
    private modelName: string;  // Changé de readonly à modifiable

    constructor() {
        this.modelName = 'phi3'; // Valeur par défaut
    }

    // Nouvelle méthode pour changer de modèle
    public setModel(modelName: string): void {
        this.modelName = modelName;
        console.log(`[Ollama] Modèle changé pour : ${this.modelName}`);
    }

    async generate(prompt: string): Promise<string> {
        console.log("[Ollama] URL appelée :", this.OLLAMA_API_URL);
        console.log("[Ollama] Prompt envoyé :", prompt.slice(0, 200) + (prompt.length > 200 ? "..." : ""));

        try {
            const response = await axios.post(this.OLLAMA_API_URL, {
                model: this.modelName,  // Utilise this.modelName au lieu de la constante
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_ctx: 2048
                }
            });

            console.log("[Ollama] Réponse complète :", JSON.stringify(response.data, null, 2));
            return response.data.response?.trim() || "";
        } catch (error) {
            console.error("[Ollama] Erreur :", error);
            throw new Error(`Échec avec le modèle ${this.modelName}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getAvailableModels(): Promise<string[]> {
        try {
            const response = await axios.get('http://localhost:11434/api/tags');
            const models = response.data.models.map((model: any) => model.name.split(':')[0]);
            console.log("[Ollama] Modèles disponibles :", models);
            return models;
        } catch (error) {
            console.error("Erreur lors de la récupération des modèles:", error);
            return ['phi3', 'starcoder']; // Valeurs par défaut si erreur
        }
    }
}