# **TIKLocal Copilot - Extension VSCode**  

🚀 **Générez et modifiez du code avec des modèles IA locaux (Ollama)** directement dans VSCode, sans dépendre du cloud !  

## **Fonctionnalités** ✨  
✔ **Génération de code contextuelle** (selon la sélection ou le fichier entier)  
✔ **Modification intelligente** du code existant  
✔ **Chat interactif** avec historique des conversations  
✔ **Support multi-langage** (Python, JavaScript, HTML, etc.)  
✔ **100% local** (utilise Ollama pour exécuter des modèles comme StarCoder, CodeLlama, etc.)  
✔ **Bouton "Appliquer"** pour insérer le code généré en un clic  

---

## **Prérequis** ⚙️  
1. **Ollama** installé ([Télécharger ici](https://ollama.ai/))  
2. **Modèles IA** téléchargés (ex: `starcoder`, `deepseek-coder`, `codellama`)  

### **Installation d'Ollama**  
```bash
curl -fsSL https://ollama.com/install.sh | sh  # Linux/Mac
winget install ollama                          # Windows (via Winget)
```

### **Télécharger un modèle**  
```bash
ollama pull starcoder
```

---

## **Installation dans VSCode** 📥  

### **Option 1 : Depuis le Marketplace (recommandé)**  
1. Ouvrez VSCode  
2. Allez dans **Extensions** (Ctrl+Shift+X)  
3. Cherchez **"Local Copilot"**  
4. Cliquez sur **Installer**  

### **Option 2 : Manuellement (fichier .vsix)**  
1. Téléchargez la dernière version `.vsix` depuis [Releases](https://github.com/votre-repo/releases)  
2. Dans VSCode :  
   ```bash
   code --install-extension chemin/vers/local-copilot-X.X.X.vsix
   ```
3. **Redémarrez VSCode**  

---

## **Utilisation** 🛠️  

1. **Ouvrez un fichier de code**  
2. **Sélectionnez du code** (ou laissez vide pour tout le fichier)  
3. **Lancez le chat** :  
   - **Commande palette** (Ctrl+Shift+P) → `Local Copilot: Ouvrir le chat`  
   - **Raccourci clavier** : `Ctrl+Alt+C`  
4. **Posez votre question** (ex: *"Corrige ce code"*, *"Optimise cette fonction"*)  
5. **Cliquez sur "Appliquer"** sous la réponse pour insérer le code généré  

![Demo](images/demo.gif)  

---

## **Configuration** ⚙️  

### **Changer de modèle IA**  
1. Ouvrez le chat (`Ctrl+Alt+C`)  
2. Cliquez sur **"Modèle: [nom-du-modèle]"** en haut à droite  
3. Sélectionnez un modèle installé (ex: `starcoder`, `phi3`)  

### **Paramètres recommandés** (dans `settings.json`)  
```json
{
  "localCopilot.defaultModel": "starcoder",
  "localCopilot.temperature": 0.3  // Contrôle la créativité (0=précis, 1=créatif)
}
```

---

## **Dépannage** 🐛  

### **Problème : L'extension ne répond pas**  
✅ Vérifiez qu'Ollama tourne :  
```bash
ollama serve  # Doit être lancé en arrière-plan
```  

### **Problème : Pas de réponse de l'IA**  
✅ Vérifiez les logs :  
1. Ouvrez la palette (Ctrl+Shift+P) → `Local Copilot: Afficher les logs`  
2. Vérifiez le fichier `.vscode/local-copilot.log` dans votre projet  

### **Problème : Modèle introuvable**  
✅ Téléchargez-le via Ollama :  
```bash
ollama pull nom_du_modèle  # Ex: ollama pull codellama
```

---

## **Développement** 👨‍💻  
Pour contribuer ou compiler depuis les sources :  
```bash
git clone https://github.com/votre-repo/local-copilot.git
cd local-copilot
npm install
npm run compile
code .
```

---

## **Licence** 📜  
MIT License - [Lire ici](LICENSE)  
