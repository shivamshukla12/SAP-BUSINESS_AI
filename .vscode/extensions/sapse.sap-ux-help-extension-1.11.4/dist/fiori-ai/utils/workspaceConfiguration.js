"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConfigCommands = exports.validateLLMProviderAPISettings = exports.updateLLMProviderAPISettings = exports.getLLMProviderAPISettings = void 0;
const vscode_1 = require("vscode");
let sapAICoreAPISettings;
/**
 * Retrieves LLM Provider API settings from the workspace configuration.
 *
 * @returns {LLMProviderAPISettings} The LLM Provider API settings.
 */
function getLLMProviderAPISettings() {
    // Check AI Core service key and deployment id from secrets
    if (sapAICoreAPISettings) {
        return {
            type: 'sapAICore',
            sapAICoreAPISettings
        };
    }
    // Get the configuration for 'sap.ux.help.fiori.ai.llmProvider'
    const llmProviderSettings = vscode_1.workspace.getConfiguration('sap.ux.help.fiori.ai.llmProvider');
    const type = llmProviderSettings.get('type') || 'openAI';
    const settings = llmProviderSettings.get(type === 'azureOpenAI' ? 'azureOpenAiApiSettings' : 'openAiApiSettings') ?? {};
    // Helper function to extract the values using null coalescing
    const getValue = (key) => settings[key] ?? '';
    // Return the API Settings
    if (type === 'azureOpenAI') {
        return {
            type,
            azureOpenAIAPISettings: {
                apiKey: getValue('apiKey'),
                apiVersion: getValue('apiVersion'),
                instanceName: getValue('instanceName'),
                deploymentName: getValue('deploymentName'),
                embeddingsDeploymentName: getValue('embeddingsDeploymentName')
            }
        };
    }
    else {
        return {
            type,
            openAIAPISettings: {
                apiKey: getValue('apiKey')
            }
        };
    }
}
exports.getLLMProviderAPISettings = getLLMProviderAPISettings;
/**
 * Updates the LLM Provider API settings in the workspace configuration.
 *
 * @param {any} settingsToBeSaved - The new configuration values to be saved.
 * @returns {Promise<void>} Resolves when the update operation is complete.
 */
async function updateLLMProviderAPISettings(settingsToBeSaved) {
    // Get the configuration for 'sap.ux.help.fiori.ai.llmProvider'
    const llmProviderSettings = vscode_1.workspace.getConfiguration('sap.ux.help.fiori.ai.llmProvider');
    // Update the type and openAI | azureOpenAI settings
    await llmProviderSettings.update('type', settingsToBeSaved.type, true);
    const settingsKey = settingsToBeSaved.type === 'azureOpenAI' ? 'azureOpenAiApiSettings' : 'openAiApiSettings';
    await llmProviderSettings.update(settingsKey, settingsToBeSaved.type === 'azureOpenAI'
        ? settingsToBeSaved.azureOpenAIAPISettings
        : settingsToBeSaved.openAIAPISettings, true);
}
exports.updateLLMProviderAPISettings = updateLLMProviderAPISettings;
/**
 * Validates the given LLM Provider API settings.
 *
 * @param {LLMProviderAPISettings} config - The settings to validate.
 * @returns {boolean} `true` if the settings are valid, otherwise `false`.
 */
function validateLLMProviderAPISettings(config) {
    const { type } = config;
    if (type === 'azureOpenAI') {
        const { apiKey, apiVersion, instanceName, deploymentName, embeddingsDeploymentName } = config.azureOpenAIAPISettings ?? {};
        return Boolean(apiKey && apiVersion && instanceName && deploymentName && embeddingsDeploymentName);
    }
    else if (type === 'openAI') {
        return Boolean(config.openAIAPISettings?.apiKey);
    }
    else if (type === 'sapAICore') {
        const { serviceKey, deploymentId } = config.sapAICoreAPISettings ?? {};
        return Boolean(serviceKey && deploymentId);
    }
    return false;
}
exports.validateLLMProviderAPISettings = validateLLMProviderAPISettings;
/**
 * Initialize secretly stored API key and register commands to set and delete.
 *
 * @param context - extension context from active call
 */
async function initConfigCommands(context) {
    const key = 'sap.help.fiori.ai.llmProvider.sapAICore.servicekey';
    const value = await context.secrets.get(key);
    if (value) {
        sapAICoreAPISettings = JSON.parse(value);
        console.log('Using stored service key');
    }
    else {
        console.log('No service key stored');
    }
    context.subscriptions.push(vscode_1.commands.registerCommand('sap.ux.help.fiori.ai.storeServiceKey', async () => {
        try {
            const deploymentId = await vscode_1.window.showInputBox({
                title: `Enter Deployment Id`,
                prompt: 'Deployment Id',
                ignoreFocusOut: true
            });
            if (typeof deploymentId !== 'string') {
                throw Error('Deployment ID must be provided as string');
            }
            const serviceKeyString = await vscode_1.window.showInputBox({
                title: `Paste Service Key`,
                password: true,
                prompt: 'Service Key',
                ignoreFocusOut: true
            });
            if (typeof serviceKeyString === 'string') {
                const serviceKey = JSON.parse(serviceKeyString);
                sapAICoreAPISettings = { deploymentId, serviceKey };
                context.secrets.store(key, JSON.stringify(sapAICoreAPISettings));
                vscode_1.commands.executeCommand('sap.ux.help.fiori.ai.chatView.displayLLMProviderSettings');
            }
            else {
                throw Error('Service key must be provided');
            }
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`Provided deployment id or service key invalid`, error);
        }
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('sap.ux.help.fiori.ai.deleteServiceKey', () => {
        context.secrets.delete(key);
        sapAICoreAPISettings = undefined;
        vscode_1.commands.executeCommand('sap.ux.help.fiori.ai.chatView.displayLLMProviderSettings');
    }));
}
exports.initConfigCommands = initConfigCommands;
//# sourceMappingURL=workspaceConfiguration.js.map