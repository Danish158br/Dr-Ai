// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !! CRITICAL ERROR POTENTIAL: THIS IS A .tsx (TypeScript + JSX) FILE.      !!
// !!                                                                        !!
// !! BROWSERS CANNOT EXECUTE THIS FILE DIRECTLY.                            !!
// !! IT MUST BE TRANSPILED (COMPILED) TO STANDARD JAVASCRIPT (.js)          !!
// !! USING A TOOL LIKE `tsc`, VITE, PARCEL, WEBPACK, OR SIMILAR.            !!
// !!                                                                        !!
// !! If you see "Uncaught SyntaxError: Unexpected end of input",            !!
// !! "Missing initializer in const declaration", "Unexpected token",        !!
// !! or other JavaScript parsing errors, it is almost CERTAINLY because     !!
// !! this raw .tsx file is being served to the browser without transpilation.!!
// !!                                                                        !!
// !! Link the COMPILED .js file in your index.html, NOT this .tsx file.     !!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part, GroundingChunk } from '@google/genai';
import { marked } from 'marked';

const ENV_API_KEY = process.env.API_KEY; // Store env key separately
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';

// --- Local Storage Keys ---
const LS_KEY_CHAT_SESSIONS = 'drAiChatSessions';
const LS_KEY_ACTIVE_CHAT_ID = 'drAiActiveChatId';
const LS_KEY_CORE_MEMORY = 'drAiGlobalCoreMemory';
const LS_KEY_CUSTOM_INSTRUCTIONS = 'drAiGlobalCustomInstructions';
const LS_KEY_THEME = 'drAiTheme';
const LS_KEY_ACTIVE_AI_ENGINE = 'drAiActiveAiEngine';


// API Settings Keys
const LS_KEY_RAPID_API_CONFIGS = 'drAiRapidApiConfigs';
const LS_KEY_HF_CONFIGS = 'drAiHuggingFaceConfigs';
const LS_KEY_OPENROUTER_AI_CONFIGS = 'drAiOpenRouterAiConfigs';


// --- DR AI Permanent Base Persona (Primarily for Gemini) ---
const BASE_DR_AI_CORE_MEMORY = "I am DR AI, a highly capable multimodal AI assistant. My name is DR AI. I am designed to be a helpful and versatile assistant. My core capabilities include advanced text generation, comprehension, and creative writing. When operating through my primary pathway, I can generate images from descriptions and utilize Google Search for up-to-date information. Users can enhance my responses by providing supplemental memory and custom instructions. Furthermore, I am designed to be extensible, allowing users to connect me to other AI services and APIs (like OpenRouter AI, Hugging Face, and RapidAPI) to broaden my knowledge and abilities. My aim is to provide the best possible assistance and help users fulfill their dreams by leveraging these diverse capabilities.";
const BASE_DR_AI_CUSTOM_INSTRUCTIONS = "Strive to be helpful, creative, and demonstrate your wide range of capabilities. When asked if you can do something, respond affirmatively and try your best, within ethical boundaries and your programmed abilities. Be confident, resourceful, and consistently reflect my helpful and capable nature. Your custom instructions will help refine my responses to better suit your preferences and achieve the best results.";


// --- DOM Elements: Main Application ---
const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const stopGenerationButton = document.getElementById('stop-generation-button') as HTMLButtonElement;
const outputContainer = document.getElementById('output-container') as HTMLElement | null;
const newChatButton = document.getElementById('new-chat-button') as HTMLButtonElement;
const chatHistoryList = document.getElementById('chat-history-list') as HTMLElement;
const clearConversationButton = document.getElementById('clear-conversation-button') as HTMLButtonElement;
const sidebar = document.getElementById('sidebar') as HTMLElement;
const menuButton = document.getElementById('menu-button') as HTMLButtonElement;
const imageToggleButton = document.getElementById('image-toggle-button') as HTMLButtonElement;
const searchToggleButton = document.getElementById('search-toggle-button') as HTMLButtonElement;
const loadingOverlay = document.getElementById('loading-overlay') as HTMLElement | null;


// --- DOM Elements: Settings Modal ---
const settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
const settingsModalOverlay = document.getElementById('settings-modal-overlay') as HTMLElement | null;
const closeSettingsModalButton = document.getElementById('close-settings-modal-button') as HTMLButtonElement;
const coreMemoryInput = document.getElementById('core-memory-input') as HTMLTextAreaElement;
const customInstructionsInput = document.getElementById('custom-instructions-input') as HTMLTextAreaElement;
const enhanceInstructionsButton = document.getElementById('enhance-instructions-button') as HTMLButtonElement;
const saveSettingsButton = document.getElementById('save-settings-button') as HTMLButtonElement;
const saveSettingsFeedback = document.getElementById('save-settings-feedback') as HTMLSpanElement;
const themeSelector = document.getElementById('theme-selector') as HTMLDivElement;
const resetAllDataButton = document.getElementById('reset-all-data-button') as HTMLButtonElement;

// --- DOM Elements: API Settings Modal ---
const apiSettingsButton = document.getElementById('api-settings-button') as HTMLButtonElement;
const apiSettingsModalOverlay = document.getElementById('api-settings-modal-overlay') as HTMLElement | null;
const closeApiSettingsModalButton = document.getElementById('close-api-settings-modal-button') as HTMLButtonElement;
const saveApiSettingsButton = document.getElementById('save-api-settings-button') as HTMLButtonElement;
const saveApiSettingsFeedback = document.getElementById('save-api-settings-feedback') as HTMLSpanElement;
const activeAiEngineSelector = document.getElementById('active-ai-engine-selector') as HTMLSelectElement;

// API Setting Section Divs
const geminiApiSettingsSection = document.getElementById('gemini-api-settings-section') as HTMLElement | null;
const openrouterApiSettingsSection = document.getElementById('openrouter-api-settings-section') as HTMLElement | null;
const huggingfaceApiSettingsSection = document.getElementById('huggingface-api-settings-section') as HTMLElement | null;
const rapidapiApiSettingsSection = document.getElementById('rapidapi-api-settings-section') as HTMLElement | null;


// RapidAPI Inputs
const rapidApiNameInput = document.getElementById('rapidapi-name-input') as HTMLInputElement;
const rapidApiKeyInput = document.getElementById('rapidapi-key-input') as HTMLInputElement;
const rapidApiHostInput = document.getElementById('rapidapi-host-input') as HTMLInputElement;
const rapidApiEndpointInput = document.getElementById('rapidapi-endpoint-input') as HTMLInputElement;
const addRapidApiConfigButton = document.getElementById('add-rapidapi-config-button') as HTMLButtonElement;
const rapidApiConfigsList = document.getElementById('rapidapi-configs-list') as HTMLDivElement;

// HuggingFace Inputs
const huggingFaceNameInput = document.getElementById('huggingface-name-input') as HTMLInputElement;
const huggingFaceKeyInput = document.getElementById('huggingface-key-input') as HTMLInputElement;
const huggingFaceEndpointInput = document.getElementById('huggingface-endpoint-input') as HTMLInputElement;
const addHuggingFaceConfigButton = document.getElementById('add-huggingface-config-button') as HTMLButtonElement;
const huggingFaceConfigsList = document.getElementById('huggingface-configs-list') as HTMLDivElement;


// OpenRouter AI Inputs
const openRouterAiNameInput = document.getElementById('openrouterai-name-input') as HTMLInputElement;
const openRouterAiKeyInput = document.getElementById('openrouterai-key-input') as HTMLInputElement;
const openRouterAiModelInput = document.getElementById('openrouterai-model-input') as HTMLInputElement;
const addOpenRouterAiConfigButton = document.getElementById('add-openrouterai-config-button') as HTMLButtonElement;
const openRouterAiConfigsList = document.getElementById('openrouterai-configs-list') as HTMLDivElement;


// --- DOM Elements: About Modal ---
const aboutButton = document.getElementById('about-button') as HTMLButtonElement;
const aboutModalOverlay = document.getElementById('about-modal-overlay') as HTMLElement | null;
const closeAboutModalButton = document.getElementById('close-about-modal-button') as HTMLButtonElement;

// --- DOM Elements: Terms Modal ---
const termsButton = document.getElementById('terms-button') as HTMLButtonElement;
const termsModalOverlay = document.getElementById('terms-modal-overlay') as HTMLElement | null;
const closeTermsModalButton = document.getElementById('close-terms-modal-button') as HTMLButtonElement;

// --- DOM Elements: Capabilities Modal ---
const capabilitiesButton = document.getElementById('capabilities-button') as HTMLButtonElement;
const capabilitiesModalOverlay = document.getElementById('capabilities-modal-overlay') as HTMLElement | null;
const closeCapabilitiesModalButton = document.getElementById('close-capabilities-modal-button') as HTMLButtonElement;

const allModalOverlays: (HTMLElement | null)[] = [
    settingsModalOverlay,
    apiSettingsModalOverlay,
    aboutModalOverlay,
    termsModalOverlay,
    capabilitiesModalOverlay
];


// --- Types ---
interface AppHistoryEntry {
  content: Content; // Role is 'user' or 'model' (or 'system' if directly added)
  timestamp: number;
  engine?: AiEngineType; // Specifies the AI engine for 'model' turns
  rawResponse?: any;
}

interface ChatSession {
  id: string;
  title: string;
  history: AppHistoryEntry[];
  timestamp: number;
}

type Theme = 'light' | 'dark' | 'glassmorphism' | 'futuristic';
type AiEngineType = 'gemini' | 'openrouter' | 'huggingface' | 'rapidapi';

interface RapidApiConfig {
    id: string;
    name: string;
    key: string;
    host: string;
    endpoint: string;
}

interface HuggingFaceConfig {
    id: string;
    name: string;
    apiKey: string;
    endpointUrl: string;
}

interface OpenRouterAiConfig {
    id: string;
    name: string;
    apiKey: string;
    modelString: string;
}


// --- State ---
let ai: GoogleGenAI | null = null;
let currentChatSDK: Chat | null = null;
let chatSessions: ChatSession[] = [];
let activeChatSessionId: string | null = null;
let abortController: AbortController | null = null;
let currentGlobalCoreMemory: string = '';
let currentGlobalCustomInstructions: string = '';
let currentTheme: Theme = 'glassmorphism';
let activeAiEngine: AiEngineType = 'gemini';
let isImageGenerationMode: boolean = false;
let isGoogleSearchMode: boolean = false;
let typingIndicatorElement: HTMLDivElement | null = null;

let rapidApiConfigs: RapidApiConfig[] = [];
let huggingFaceConfigs: HuggingFaceConfig[] = [];
let openRouterAiConfigs: OpenRouterAiConfig[] = [];


const sendButtonDefaultSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="send-icon-default">
  <path d="M3.105 3.105a.75.75 0 01.884-.043l11.998 7.001a.75.75 0 010 1.272L4.002 18.337a.75.75 0 01-1.203-.883L4.25 10.5 2.797 4.135a.75.75 0 01.308-1.03zM5.18 10.501L14.097 5.57L4.75 9.613l.43 1.888zm0 0L4.75 11.387l9.348-4.934L5.18 10.5z"/>
</svg>`;

const sendButtonLoadingSVG = `
<svg class="spinner" viewBox="0 0 50 50">
  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
</svg>`;

const enhanceButtonDefaultContent = `💡`;
const enhanceButtonLoadingContent = `
<svg class="spinner-small" viewBox="0 0 50 50">
  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="8"></circle>
</svg>`;


// --- Loading Overlay Control ---
function showLoadingOverlay(message: string = "Processing...") {
    if (loadingOverlay) {
        const messageElement = loadingOverlay.querySelector('p');
        if (messageElement) messageElement.textContent = message;
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.setAttribute('aria-hidden', 'false');
    }
}
function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.setAttribute('aria-hidden', 'true');
    }
}

// --- Typing Indicator ---
function displayTypingIndicator(show: boolean) {
    if (!outputContainer) return;

    if (show) {
        if (typingIndicatorElement) return; // Already showing

        typingIndicatorElement = document.createElement('div');
        typingIndicatorElement.className = 'turn-wrapper ai-turn-wrapper typing-indicator-turn-wrapper';

        const turnDiv = document.createElement('div');
        turnDiv.className = 'turn ai-turn typing-indicator-turn';
        turnDiv.setAttribute('role', 'status');
        turnDiv.setAttribute('aria-label', `DR AI is typing`);

        const dot1 = document.createElement('span');
        dot1.className = 'typing-indicator-dot';
        const dot2 = document.createElement('span');
        dot2.className = 'typing-indicator-dot';
        const dot3 = document.createElement('span');
        dot3.className = 'typing-indicator-dot';

        turnDiv.appendChild(dot1);
        turnDiv.appendChild(dot2);
        turnDiv.appendChild(dot3);
        typingIndicatorElement.appendChild(turnDiv);

        outputContainer.appendChild(typingIndicatorElement);
        outputContainer.scrollTop = outputContainer.scrollHeight;
    } else {
        removeTypingIndicator();
    }
}

function removeTypingIndicator() {
    if (typingIndicatorElement && typingIndicatorElement.parentNode === outputContainer) {
        outputContainer?.removeChild(typingIndicatorElement);
        typingIndicatorElement = null;
    }
}

// --- Display Messages ---
async function addTurnToOutput(
    role: 'user' | 'model' | 'system' | 'error',
    text: string | Part[] | null,
    isStreaming: boolean = false,
    citations?: GroundingChunk[] | null,
    imageUrl?: string | null,
    engineForDisplay: AiEngineType | 'user' = 'gemini' // Used for styling/context, not direct logic.
) {
    if (!outputContainer) return;
    removeTypingIndicator();

    const turnWrapper = document.createElement('div');
    turnWrapper.className = `turn-wrapper ${role === 'user' ? 'user-turn-wrapper' : 'ai-turn-wrapper'}`;

    const turnDiv = document.createElement('div');
    turnDiv.className = `turn ${role === 'user' ? 'user-turn' : 'ai-turn'}`;
    turnDiv.setAttribute('role', 'logitem');

    if (role === 'system') {
        turnDiv.classList.add('system-message');
    }
    if (role === 'error') {
        turnDiv.classList.add('system-message', 'error-text');
        turnDiv.innerHTML = `<strong>DR AI Error:</strong> ${text as string}`;
    } else if (imageUrl) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'generated-image-container';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'DR AI Generated Image';
        img.className = 'generated-image';
        imageContainer.appendChild(img);

        const downloadButton = document.createElement('a');
        downloadButton.href = imageUrl;
        downloadButton.textContent = 'Download Image';
        downloadButton.className = 'download-image-button';
        downloadButton.download = `dr-ai-image-${Date.now()}.png`;
        imageContainer.appendChild(downloadButton);
        turnDiv.appendChild(imageContainer);

        // Add the prompt text if available
        if (text && typeof text === 'string' && text.trim() !== "") {
            const promptTextDiv = document.createElement('div');
            promptTextDiv.innerHTML = await marked.parse(text);
            turnDiv.appendChild(promptTextDiv);
        }

    } else if (text) {
        let contentToParse: string;
        if (typeof text === 'string') {
            contentToParse = text;
        } else if (Array.isArray(text) && text.length > 0 && 'text' in text[0] && typeof text[0].text === 'string') {
            contentToParse = text[0].text; // Assuming simple text part
        } else {
            contentToParse = "Unsupported content format.";
        }
        turnDiv.innerHTML = await marked.parse(contentToParse);
    }


    if (isStreaming) {
        turnDiv.classList.add('streaming');
    }

    turnWrapper.appendChild(turnDiv);

    if (citations && citations.length > 0) {
        const citationsDiv = document.createElement('div');
        citationsDiv.className = 'grounding-citations';
        const title = document.createElement('h4');
        title.textContent = 'Retrieved Citations:';
        citationsDiv.appendChild(title);
        const list = document.createElement('ul');
        citations.forEach(citation => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = citation.web?.uri || '#';
            link.textContent = citation.web?.title || citation.web?.uri || 'Unknown source';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            item.appendChild(link);
            list.appendChild(item);
        });
        citationsDiv.appendChild(list);
        turnWrapper.appendChild(citationsDiv);
    }


    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = timestamp;
    turnWrapper.appendChild(timestampDiv);


    outputContainer.appendChild(turnWrapper);
    outputContainer.scrollTop = outputContainer.scrollHeight;

    // Add copy code buttons to new code blocks
    turnDiv.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-code-button')) return; // Already has one

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy code block');
        copyButton.onclick = () => {
            const code = pre.querySelector('code');
            if (code) {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
                }).catch(err => {
                    console.error('Failed to copy code: ', err);
                    copyButton.textContent = 'Error';
                     setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
                });
            }
        };
        pre.appendChild(copyButton);
    });

    return turnDiv;
}

function displaySystemMessage(message: string, isError: boolean = false) {
    if (!outputContainer) return;
    const systemMessageDiv = document.createElement('div');
    systemMessageDiv.className = `turn system-message ${isError ? 'error-text' : ''}`;
    systemMessageDiv.setAttribute('role', 'status');
    systemMessageDiv.innerHTML = message; // Allow basic HTML like <strong>
    outputContainer.appendChild(systemMessageDiv);
    outputContainer.scrollTop = outputContainer.scrollHeight;
}

function displayError(message: string, technicalDetails?: string) {
    console.error(`DR AI Error: ${message}`, technicalDetails || '');
    addTurnToOutput('error', message, false, null, null, activeAiEngine);
}

// --- Helper for System Instructions ---
function getSystemInstructionContent(): Content {
    const coreMem = currentGlobalCoreMemory.trim();
    const customInstr = currentGlobalCustomInstructions.trim();

    const parts: Part[] = [
        { text: (coreMem !== "" ? coreMem : BASE_DR_AI_CORE_MEMORY) },
        { text: (customInstr !== "" ? customInstr : BASE_DR_AI_CUSTOM_INSTRUCTIONS) }
    ];
    return { role: "system", parts };
}


// --- AI Initialization ---
async function initializeAiInstance() {
    showLoadingOverlay("Initializing DR AI Engine...");
    let engineReady = false;
    let initMessage = "DR AI is initializing...";

    if (activeAiEngine === 'gemini') {
        if (!ENV_API_KEY) {
            initMessage = "<strong>DR AI Primary Pathway Error:</strong> System API Key is not configured. This pathway cannot be used by DR AI.";
            displaySystemMessage(initMessage, true);
            ai = null;
            currentChatSDK = null;
        } else {
            try {
                if (!ai) ai = new GoogleGenAI({ apiKey: ENV_API_KEY }); // Initialize if not already
                engineReady = true;
                initMessage = "DR AI Primary Pathway initialized successfully.";
                displaySystemMessage(initMessage);
            } catch (error: any) {
                console.error("Error initializing GoogleGenAI for DR AI Primary Pathway:", error);
                initMessage = `<strong>DR AI Primary Pathway Error:</strong> Could not initialize. ${error.message || 'Please check console for details.'}`;
                displaySystemMessage(initMessage, true);
                ai = null;
                currentChatSDK = null;
            }
        }
    } else if (activeAiEngine === 'openrouter') {
        if (openRouterAiConfigs.length > 0 && openRouterAiConfigs.some(c => c.apiKey && c.modelString)) {
            engineReady = true;
            initMessage = "DR AI (OpenRouter AI Pathway) is active. Ready to use configured models.";
            displaySystemMessage(initMessage);
        } else {
            initMessage = "<strong>DR AI (OpenRouter AI Pathway) Warning:</strong> No valid OpenRouter AI configurations found. Please add API key and model string in API Settings for DR AI to use this pathway.";
            displaySystemMessage(initMessage, true);
        }
    } else if (activeAiEngine === 'huggingface') {
        if (huggingFaceConfigs.length > 0 && huggingFaceConfigs.some(c => c.apiKey && c.endpointUrl)) {
            engineReady = true;
            initMessage = "DR AI (Hugging Face Pathway) is active. Ready to use configured endpoints.";
            displaySystemMessage(initMessage);
        } else {
            initMessage = "<strong>DR AI (Hugging Face Pathway) Warning:</strong> No valid Hugging Face configurations found. Please add API key and endpoint URL in API Settings for DR AI to use this pathway.";
            displaySystemMessage(initMessage, true);
        }
    } else if (activeAiEngine === 'rapidapi') {
         if (rapidApiConfigs.length > 0 && rapidApiConfigs.some(c => c.key && c.host && c.endpoint)) {
            engineReady = true;
            initMessage = "DR AI (RapidAPI Pathway) is active. Ready to use configured APIs.";
            displaySystemMessage(initMessage);
        } else {
            initMessage = "<strong>DR AI (RapidAPI Pathway) Warning:</strong> No valid RapidAPI configurations found. Please add key, host, and endpoint in API Settings for DR AI to use this pathway.";
            displaySystemMessage(initMessage, true);
        }
    }

    updateInputPlaceholderAndButtons(engineReady);
    updateApiSettingsVisualIndicators();
    // Update enhance instructions button state as well, as it depends on Gemini
    if (enhanceInstructionsButton) {
        if (ENV_API_KEY) {
            enhanceInstructionsButton.disabled = false;
            enhanceInstructionsButton.title = "Enhance Instructions with DR AI (uses Primary Pathway)";
        } else {
            enhanceInstructionsButton.disabled = true;
            enhanceInstructionsButton.title = "DR AI Primary Pathway (Gemini) must be configured for this feature.";
        }
    }
    hideLoadingOverlay();
    return engineReady;
}


// --- Message Handling ---
async function handleSendMessage() {
    const promptText = promptInput.value.trim();
    if (!promptText) return;

    promptInput.value = '';
    promptInput.disabled = true;
    sendButton.innerHTML = sendButtonLoadingSVG;
    sendButton.disabled = true;
    stopGenerationButton.classList.remove('hidden');
    stopGenerationButton.disabled = false;
    abortController = new AbortController();

    const activeSession = getActiveChatSession();
    if (!activeSession) {
        displayError("No active DR AI chat session found. Please start a new chat.");
        resetControls();
        return;
    }

    await addTurnToOutput('user', promptText, false, null, null, 'user');
    activeSession.history.push({
        content: { role: 'user', parts: [{ text: promptText }] },
        timestamp: Date.now()
    });
    saveChatSessions();

    displayTypingIndicator(true);

    try {
        let aiResponseText = "";
        let aiResponseParts: Part[] = [];
        let citations: GroundingChunk[] | null = null;
        let imageUrl: string | null = null;
        let rawApiResponse: any = null;

        if (activeAiEngine === 'gemini') {
            if (!ai) {
                await initializeAiInstance(); // This will try to create `ai` if ENV_API_KEY is present
                if (!ai) { // Check again after attempt
                    displayError("DR AI's primary pathway is not initialized. Please check system API key and configuration.");
                    resetControls();
                    return;
                }
            }
            
            const systemInstructionContent = getSystemInstructionContent();
            const historyForSDK = activeSession.history
                .filter(entry => entry.content.role === 'user' || (entry.content.role === 'model' && entry.engine === 'gemini'))
                .map(entry => entry.content);

            currentChatSDK = ai.chats.create({
                model: TEXT_MODEL_NAME,
                history: historyForSDK,
                config: {
                    systemInstruction: systemInstructionContent,
                    tools: isGoogleSearchMode ? [{ googleSearch: {} }] : undefined,
                }
            });

            if (isImageGenerationMode) {
                //  showLoadingOverlay("DR AI is generating an image..."); // Removed as per user request
                const response = await ai.models.generateImages({
                    model: IMAGE_MODEL_NAME,
                    prompt: promptText,
                    config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
                });
                rawApiResponse = response;
                if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
                    imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
                    aiResponseText = `Image generated for: "${promptText}"`; // This text will be shown with the image
                    aiResponseParts = [{ text: aiResponseText }];
                    removeTypingIndicator(); // Ensure typing indicator is removed before showing image
                    await addTurnToOutput('model', aiResponseText, false, null, imageUrl, 'gemini');

                } else {
                    throw new Error("DR AI could not generate an image from the response.");
                }
            } else {
                const stream = await currentChatSDK.sendMessageStream({ message: promptText });
                let currentTurnDiv: HTMLElement | null = null;
                const markedOptions = { breaks: true, gfm: true };

                for await (const chunk of stream) {
                    if (abortController.signal.aborted) {
                        displaySystemMessage("DR AI generation stopped by user.");
                        break;
                    }
                    rawApiResponse = chunk; // Capture the last chunk as representative for saving
                    const chunkText = chunk.text;
                    aiResponseText += chunkText;
                    // For saving, we'll construct aiResponseParts at the end from the full aiResponseText
                    
                    if (!currentTurnDiv) {
                        removeTypingIndicator();
                        currentTurnDiv = await addTurnToOutput('model', aiResponseText, true, null, null, 'gemini') as HTMLElement;
                    } else {
                        currentTurnDiv.innerHTML = await marked.parse(aiResponseText, markedOptions);
                    }
                    if (outputContainer) outputContainer.scrollTop = outputContainer.scrollHeight;

                    if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                        citations = (citations || []).concat(chunk.candidates[0].groundingMetadata.groundingChunks);
                    }
                }
                 aiResponseParts = [{ text: aiResponseText }]; // Final parts from accumulated text

                if (currentTurnDiv) {
                    currentTurnDiv.classList.remove('streaming');
                    if (citations && citations.length > 0) {
                        const turnWrapper = currentTurnDiv.parentElement;
                        const existingCitationsDiv = turnWrapper?.querySelector('.grounding-citations');
                        if (existingCitationsDiv) existingCitationsDiv.remove();
                        const citationsDiv = document.createElement('div');
                        citationsDiv.className = 'grounding-citations';
                        const title = document.createElement('h4');
                        title.textContent = 'Retrieved Citations:';
                        citationsDiv.appendChild(title);
                        const list = document.createElement('ul');
                        const uniqueCitations = Array.from(new Map(citations.map(c => [c.web?.uri, c])).values());
                        uniqueCitations.forEach(citation => {
                            const item = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = citation.web?.uri || '#';
                            link.textContent = citation.web?.title || citation.web?.uri || 'Unknown source';
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            item.appendChild(link);
                            list.appendChild(item);
                        });
                        citationsDiv.appendChild(list);
                        turnWrapper?.appendChild(citationsDiv);
                    }
                } else if (!abortController.signal.aborted && !aiResponseText && !imageUrl) {
                     removeTypingIndicator();
                     displayError("DR AI returned an empty response.");
                }
            }
        } else if (activeAiEngine === 'openrouter') {
            const config = openRouterAiConfigs.find(c => c.apiKey && c.modelString);
            if (!config) {
                displayError("DR AI (OpenRouter AI Pathway) is not configured. Please add an API key and model string in API Settings.");
                resetControls(); return;
            }

            const messagesForOpenRouter = activeSession.history
                .map(entry => {
                    const textContent = (entry.content.parts[0] as any)?.text || "";
                    let role: 'user' | 'assistant' | 'system' = 'user'; // Default
                    if (entry.content.role === 'model') role = 'assistant';
                    else if (entry.content.role === 'system') role = 'system';
                    else role = 'user'; // Fallback for other roles or user explicitly

                    return { role: role, content: textContent };
                })
                .filter(msg => msg.content);


            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": `${location.protocol}//${location.host}`,
                    "X-Title": "DR AI",
                },
                body: JSON.stringify({
                    model: config.modelString,
                    messages: messagesForOpenRouter,
                    stream: true,
                }),
                signal: abortController.signal,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                rawApiResponse = errorData; // Save error response for history
                throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let currentTurnDiv: HTMLElement | null = null;
            const markedOptions = { breaks: true, gfm: true };
            let streamFinished = false;
            let lastSuccessfulChunk: any = null;

            while (reader && !streamFinished) {
                const { done, value } = await reader.read();
                if (done || abortController.signal.aborted) {
                    if (abortController.signal.aborted) displaySystemMessage("DR AI generation stopped by user.");
                    streamFinished = true;
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const dataPayload = line.substring('data: '.length);
                    if (dataPayload.trim() === '[DONE]') {
                        streamFinished = true;
                        break;
                    }
                    try {
                        const parsed = JSON.parse(dataPayload);
                        lastSuccessfulChunk = parsed; // Store the last successfully parsed chunk
                        const contentDelta = parsed.choices?.[0]?.delta?.content;
                        if (contentDelta) {
                            aiResponseText += contentDelta;
                            // aiResponseParts will be constructed at the end

                            if (!currentTurnDiv) {
                                removeTypingIndicator();
                                currentTurnDiv = await addTurnToOutput('model', aiResponseText, true, null, null, 'openrouter') as HTMLElement;
                            } else {
                                currentTurnDiv.innerHTML = await marked.parse(aiResponseText, markedOptions);
                            }
                            if (outputContainer) outputContainer.scrollTop = outputContainer.scrollHeight;
                        }
                    } catch (e) {
                        console.warn("Error parsing OpenRouter stream chunk:", e, dataPayload);
                    }
                }
                 if (streamFinished) break;
            }
            if (reader) await reader.cancel();
            aiResponseParts = [{ text: aiResponseText }];
            rawApiResponse = lastSuccessfulChunk || { note: "Stream ended or cancelled."};


            if (currentTurnDiv) {
                currentTurnDiv.classList.remove('streaming');
            } else if (!abortController.signal.aborted && !aiResponseText) {
                removeTypingIndicator();
                displayError("DR AI (OpenRouter AI Pathway) returned an empty response.");
            }
        } else if (activeAiEngine === 'huggingface') {
            const config = huggingFaceConfigs.find(c => c.apiKey && c.endpointUrl);
            if (!config) {
                displayError("DR AI (Hugging Face Pathway) is not configured. Please add an API key and endpoint URL in API Settings.");
                resetControls(); return;
            }
            showLoadingOverlay("DR AI is contacting Hugging Face...");
            const response = await fetch(config.endpointUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: promptText, parameters: { return_full_text: false } }),
                signal: abortController.signal,
            });
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 rawApiResponse = errorData;
                throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
            }
            const hfResponse = await response.json();
            rawApiResponse = hfResponse;
            if (Array.isArray(hfResponse) && hfResponse[0]?.generated_text) {
                aiResponseText = hfResponse[0].generated_text;
            } else if (hfResponse.generated_text) {
                aiResponseText = hfResponse.generated_text;
            } else {
                aiResponseText = JSON.stringify(hfResponse, null, 2); // Fallback to show raw JSON
            }
            aiResponseParts = [{ text: aiResponseText }];
            removeTypingIndicator();
            await addTurnToOutput('model', aiResponseText, false, null, null, 'huggingface');
        } else if (activeAiEngine === 'rapidapi') {
            const config = rapidApiConfigs.find(c => c.key && c.host && c.endpoint);
            if (!config) {
                displayError("DR AI (RapidAPI Pathway) is not configured. Please add an API key, host, and endpoint in API Settings.");
                resetControls(); return;
            }
            showLoadingOverlay("DR AI is contacting RapidAPI...");
            const endpointPath = config.endpoint.startsWith('/') ? config.endpoint : `/${config.endpoint}`;
            const response = await fetch(`https://${config.host}${endpointPath}`, {
                method: "POST",
                headers: {
                    "x-rapidapi-key": config.key,
                    "x-rapidapi-host": config.host,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: promptText }), // Generic payload, might need adjustment per API
                signal: abortController.signal,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                rawApiResponse = errorData;
                throw new Error(`RapidAPI Error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
            }
            const rapidResponse = await response.json();
            rawApiResponse = rapidResponse;
            // Attempt to extract text from common response structures
            aiResponseText = rapidResponse.text || rapidResponse.data?.text || rapidResponse.choices?.[0]?.text || rapidResponse.result || JSON.stringify(rapidResponse, null, 2);
            aiResponseParts = [{ text: aiResponseText }];
            removeTypingIndicator();
            await addTurnToOutput('model', aiResponseText, false, null, null, 'rapidapi');
        }

        if (!abortController.signal.aborted) {
            activeSession.history.push({
                content: { role: 'model', parts: aiResponseParts }, // Ensure aiResponseParts are correctly formed
                timestamp: Date.now(),
                engine: activeAiEngine,
                rawResponse: rawApiResponse // Save the raw response for potential rehydration or debugging
            });
            saveChatSessions();
            if (!activeSession.title || activeSession.title === "Untitled Chat") {
                 autoNameChat(activeSession, promptText);
            }
        }
    } catch (error: any) {
        removeTypingIndicator();
        console.error("Error during DR AI message handling:", error);
        displayError(`DR AI encountered an issue: ${error.message || 'Unknown error. Check console for details.'}`, error.stack);
         // Save the error in history if possible
        if (activeSession && !abortController?.signal.aborted) {
            activeSession.history.push({
                content: { role: 'model', parts: [{ text: `Error: ${error.message}` }] },
                timestamp: Date.now(),
                engine: activeAiEngine,
                rawResponse: { error: error.message, stack: error.stack }
            });
            saveChatSessions();
        }
    } finally {
        resetControls();
        hideLoadingOverlay();
    }
}


function resetControls() {
    promptInput.disabled = false;
    sendButton.innerHTML = sendButtonDefaultSVG;
    sendButton.disabled = false;
    stopGenerationButton.classList.add('hidden');
    stopGenerationButton.disabled = true;
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    const engineReady = (activeAiEngine === 'gemini' && !!ai) ||
                        (activeAiEngine === 'openrouter' && openRouterAiConfigs.some(c => c.apiKey && c.modelString)) ||
                        (activeAiEngine === 'huggingface' && huggingFaceConfigs.some(c => c.apiKey && c.endpointUrl)) ||
                        (activeAiEngine === 'rapidapi' && rapidApiConfigs.some(c => c.key && c.host && c.endpoint));
    updateInputPlaceholderAndButtons(engineReady);
}

// --- Chat Session Management ---
function generateUniqueId() {
    return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function startNewChat(isInitialLoad: boolean = false) {
    if (activeChatSessionId && !isInitialLoad) {
      const currentSession = getActiveChatSession();
      if (currentSession && (currentSession.history.length === 0 && currentSession.title === "Untitled Chat")) {
        // Do nothing specific, new session will overwrite/be focused
      } else if (currentSession) {
         saveChatSessions(); // Save current session if it has content or a title
      }
    }

    const newSessionId = generateUniqueId();
    const newSession: ChatSession = {
        id: newSessionId,
        title: "Untitled Chat",
        history: [],
        timestamp: Date.now(),
    };
    chatSessions.unshift(newSession); // Add to the beginning for chronological order in UI
    activeChatSessionId = newSessionId;

    if (outputContainer) outputContainer.innerHTML = ''; // Clear previous chat messages

    if (activeAiEngine === 'gemini' && ai) {
        const systemInstructionContent = getSystemInstructionContent();
        currentChatSDK = ai.chats.create({
            model: TEXT_MODEL_NAME,
            history: [], // Start with empty history for the SDK
            config: { systemInstruction: systemInstructionContent }
        });
        if (!isInitialLoad) {
           displaySystemMessage("New chat started. DR AI is ready!");
        }
    } else if (!isInitialLoad) {
         displaySystemMessage(`New chat started. DR AI is ready!`);
    }

    renderChatHistory(); 
    saveActiveChatId();
    saveChatSessions(); 
    updateInputPlaceholderAndButtons(true); 
    isImageGenerationMode = false;
    isGoogleSearchMode = false;
    imageToggleButton?.classList.remove('active');
    imageToggleButton?.setAttribute('aria-pressed', 'false');
    searchToggleButton?.classList.remove('active');
    searchToggleButton?.setAttribute('aria-pressed', 'false');
    updateInputPlaceholderAndButtons(true); 
}


function loadChatSession(sessionId: string) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) {
        console.warn(`DR AI: Session ${sessionId} not found. Starting a new chat.`);
        startNewChat();
        return;
    }
    activeChatSessionId = sessionId;
    if (outputContainer) outputContainer.innerHTML = '';

    initializeAiInstance().then(engineReady => {
        if (!engineReady && activeAiEngine === 'gemini') {
            displaySystemMessage(`DR AI's primary pathway is not configured. Displaying history only.`, true);
        } else if (!engineReady) {
             displaySystemMessage(`DR AI's ${activeAiEngine} pathway is not configured. Displaying history only.`, true);
        }

        session.history.forEach(entry => {
            const contentPart = entry.content.parts[0];
            let imageUrl: string | null = null;
            let textContent: string | null = null;

            if (contentPart && 'text' in contentPart && typeof contentPart.text === 'string') {
                textContent = contentPart.text;
                if (entry.engine === 'gemini' && textContent.startsWith("Image generated for: ") && entry.rawResponse?.generatedImages?.[0]?.image?.imageBytes) {
                    imageUrl = `data:image/jpeg;base64,${entry.rawResponse.generatedImages[0].image.imageBytes}`;
                }
            }


             if (entry.content.role === 'user') {
                addTurnToOutput('user', textContent, false, null, null, 'user');
            } else if (entry.content.role === 'model') {
                if (imageUrl) {
                     addTurnToOutput('model', textContent, false, null, imageUrl, entry.engine || activeAiEngine);
                } else {
                    const citations = entry.rawResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks ||
                                      (entry.engine === 'gemini' && entry.rawResponse?.groundingMetadata?.groundingChunks) || // For older stored direct GenerateContentResponse
                                      null;
                    addTurnToOutput('model', textContent, false, citations, null, entry.engine || activeAiEngine);
                }
            }
        });

        if (activeAiEngine === 'gemini' && ai && engineReady) {
            const systemInstructionContent = getSystemInstructionContent();
            const historyForSDK = session.history
                    .filter(entry => entry.content.role === 'user' || (entry.content.role === 'model' && entry.engine === 'gemini'))
                    .map(entry => entry.content);
            currentChatSDK = ai.chats.create({
                model: TEXT_MODEL_NAME,
                history: historyForSDK,
                config: { systemInstruction: systemInstructionContent }
            });
        }
    });

    renderChatHistory();
    saveActiveChatId();
    updateInputPlaceholderAndButtons(true);
}

function autoNameChat(session: ChatSession, firstUserMessage: string) {
    if (session.title === "Untitled Chat" && firstUserMessage && firstUserMessage.trim().length > 0) {
        const potentialTitle = firstUserMessage.split('\n')[0].substring(0, 40);
        session.title = potentialTitle.length > 0 ? potentialTitle : "Chat";
        renderChatHistory();
        saveChatSessions();
    }
}


function renderChatHistory() {
    if (!chatHistoryList) return;
    chatHistoryList.innerHTML = '';

    if (chatSessions.length === 0) {
        const noHistoryMsg = document.createElement('p');
        noHistoryMsg.className = 'no-history-message';
        noHistoryMsg.textContent = 'No chat history yet.';
        chatHistoryList.appendChild(noHistoryMsg);
        return;
    }

    chatSessions.forEach(session => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'chat-history-item';
        item.setAttribute('data-session-id', session.id);
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Load chat: ${session.title}`);
        if (session.id === activeChatSessionId) {
            item.classList.add('active');
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = session.title;
        item.appendChild(titleSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.setAttribute('aria-label', `Delete chat: ${session.title}`);
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete the DR AI chat "${session.title}"? This cannot be undone.`)) {
                deleteChatSession(session.id);
            }
        };
        item.appendChild(deleteBtn);

        item.onclick = (e) => {
            e.preventDefault();
            if (session.id !== activeChatSessionId) {
                loadChatSession(session.id);
            }
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && menuButton) {
                sidebar.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        };
        chatHistoryList.appendChild(item);
    });
}

function deleteChatSession(sessionId: string) {
    chatSessions = chatSessions.filter(s => s.id !== sessionId);
    if (activeChatSessionId === sessionId) {
        if (chatSessions.length > 0) {
            loadChatSession(chatSessions[0].id);
        } else {
            startNewChat(true);
        }
    }
    saveChatSessions();
    renderChatHistory();
}

function clearCurrentConversation() {
    const session = getActiveChatSession();
    if (session) {
        if (confirm(`Are you sure you want to clear all messages in the DR AI chat "${session.title}"? This cannot be undone.`)) {
            session.history = [];
            if (outputContainer) outputContainer.innerHTML = '';
            displaySystemMessage("DR AI conversation cleared.");

            if (activeAiEngine === 'gemini' && ai) {
                const systemInstructionContent = getSystemInstructionContent();
                currentChatSDK = ai.chats.create({ model: TEXT_MODEL_NAME, history: [], config: {systemInstruction: systemInstructionContent}});
            }
            saveChatSessions();
        }
    }
}


function saveChatSessions() {
    localStorage.setItem(LS_KEY_CHAT_SESSIONS, JSON.stringify(chatSessions));
}

function loadChatSessions(): ChatSession[] {
    const storedSessions = localStorage.getItem(LS_KEY_CHAT_SESSIONS);
    return storedSessions ? JSON.parse(storedSessions) : [];
}

function saveActiveChatId() {
    if (activeChatSessionId) {
        localStorage.setItem(LS_KEY_ACTIVE_CHAT_ID, activeChatSessionId);
    } else {
        localStorage.removeItem(LS_KEY_ACTIVE_CHAT_ID);
    }
}

function loadActiveChatId(): string | null {
    return localStorage.getItem(LS_KEY_ACTIVE_CHAT_ID);
}

function getActiveChatSession(): ChatSession | undefined {
    return chatSessions.find(s => s.id === activeChatSessionId);
}

// --- Settings Management (Core Memory, Custom Instructions, Theme, Active Engine) ---
async function handleEnhanceInstructionsClick() {
    if (!ENV_API_KEY || !ai) {
        if (saveSettingsFeedback) {
            saveSettingsFeedback.textContent = 'DR AI Primary Pathway (Gemini) must be configured for this feature.';
            saveSettingsFeedback.style.color = 'var(--text-error)';
            setTimeout(() => {
                saveSettingsFeedback.textContent = '';
                saveSettingsFeedback.style.color = 'var(--text-link)';
            }, 5000);
        }
        return;
    }
    if (!customInstructionsInput || !enhanceInstructionsButton) return;

    const currentInstructions = customInstructionsInput.value.trim();
    if (!currentInstructions) {
         if (saveSettingsFeedback) {
            saveSettingsFeedback.textContent = 'Please enter some instructions to enhance.';
            setTimeout(() => { saveSettingsFeedback.textContent = ''; }, 3000);
        }
        return;
    }

    enhanceInstructionsButton.innerHTML = enhanceButtonLoadingContent;
    enhanceInstructionsButton.disabled = true;

    try {
        const prompt = `You are an AI assistant specialized in optimizing instructions for other AI models. Review the following custom instructions provided by a user for their AI. Your task is to enhance these instructions to make them more precise, comprehensive, and effective, essentially elevating them to an 'expert level' for guiding an AI. Preserve the core intent of the original instructions. Return *only* the enhanced instructions as a single block of text, without any preamble or explanation. Original instructions:\n\n---\n${currentInstructions}\n---`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: prompt,
        });

        const enhancedText = response.text;
        if (enhancedText) {
            customInstructionsInput.value = enhancedText.trim();
            if (saveSettingsFeedback) {
                saveSettingsFeedback.textContent = 'Instructions enhanced! Remember to save settings.';
                saveSettingsFeedback.style.color = 'var(--text-link)';
                setTimeout(() => { saveSettingsFeedback.textContent = ''; }, 4000);
            }
        } else {
            throw new Error("DR AI returned empty enhanced instructions.");
        }
    } catch (error: any) {
        console.error("Error enhancing instructions with DR AI:", error);
        if (saveSettingsFeedback) {
            saveSettingsFeedback.textContent = 'Failed to enhance instructions.';
            saveSettingsFeedback.style.color = 'var(--text-error)';
             setTimeout(() => {
                saveSettingsFeedback.textContent = '';
                saveSettingsFeedback.style.color = 'var(--text-link)';
            }, 5000);
        }
    } finally {
        enhanceInstructionsButton.innerHTML = enhanceButtonDefaultContent;
        enhanceInstructionsButton.disabled = !ENV_API_KEY; // Re-enable only if API key is present
    }
}


function saveGlobalSettings(feedbackMessage: string = 'DR AI settings saved!') {
    currentGlobalCoreMemory = coreMemoryInput.value.trim();
    currentGlobalCustomInstructions = customInstructionsInput.value.trim();

    localStorage.setItem(LS_KEY_CORE_MEMORY, currentGlobalCoreMemory);
    localStorage.setItem(LS_KEY_CUSTOM_INSTRUCTIONS, currentGlobalCustomInstructions);
    localStorage.setItem(LS_KEY_THEME, currentTheme);
    localStorage.setItem(LS_KEY_ACTIVE_AI_ENGINE, activeAiEngine);

    localStorage.setItem(LS_KEY_RAPID_API_CONFIGS, JSON.stringify(rapidApiConfigs));
    localStorage.setItem(LS_KEY_HF_CONFIGS, JSON.stringify(huggingFaceConfigs));
    localStorage.setItem(LS_KEY_OPENROUTER_AI_CONFIGS, JSON.stringify(openRouterAiConfigs));

    if (saveSettingsFeedback) {
        saveSettingsFeedback.textContent = feedbackMessage;
        saveSettingsFeedback.style.color = 'var(--text-link)'; // Ensure default color
        setTimeout(() => { saveSettingsFeedback.textContent = ''; }, 3000);
    }
     if (saveApiSettingsFeedback) { 
        saveApiSettingsFeedback.textContent = 'DR AI API Settings confirmed!';
         setTimeout(() => { saveApiSettingsFeedback.textContent = ''; }, 3000);
    }

    initializeAiInstance().then(() => {
        if (activeAiEngine === 'gemini' && ai) {
            const activeSession = getActiveChatSession();
            const historyForSDK = activeSession ? activeSession.history
                .filter(entry => entry.content.role === 'user' || (entry.content.role === 'model' && entry.engine === 'gemini'))
                .map(entry => entry.content) : [];

            const systemInstructionContent = getSystemInstructionContent();
            currentChatSDK = ai.chats.create({
                model: TEXT_MODEL_NAME,
                history: historyForSDK,
                config: { systemInstruction: systemInstructionContent }
            });
            if (feedbackMessage === 'DR AI settings saved!') {
                 displaySystemMessage("DR AI settings updated.");
            }
        } else if (feedbackMessage === 'DR AI settings saved!') {
            displaySystemMessage(`DR AI settings confirmed.`);
        }
    });
}

function loadGlobalSettings() {
    currentGlobalCoreMemory = localStorage.getItem(LS_KEY_CORE_MEMORY) || '';
    currentGlobalCustomInstructions = localStorage.getItem(LS_KEY_CUSTOM_INSTRUCTIONS) || '';
    currentTheme = (localStorage.getItem(LS_KEY_THEME) as Theme) || 'glassmorphism';
    activeAiEngine = (localStorage.getItem(LS_KEY_ACTIVE_AI_ENGINE) as AiEngineType) || 'gemini';

    if (coreMemoryInput) coreMemoryInput.value = currentGlobalCoreMemory;
    if (customInstructionsInput) customInstructionsInput.value = currentGlobalCustomInstructions;
    if (activeAiEngineSelector) activeAiEngineSelector.value = activeAiEngine;

    if (enhanceInstructionsButton) {
        if (ENV_API_KEY) {
            enhanceInstructionsButton.disabled = false;
            enhanceInstructionsButton.title = "Enhance Instructions with DR AI (uses Primary Pathway)";
            enhanceInstructionsButton.innerHTML = enhanceButtonDefaultContent;
        } else {
            enhanceInstructionsButton.disabled = true;
            enhanceInstructionsButton.title = "DR AI Primary Pathway (Gemini) must be configured for this feature.";
            enhanceInstructionsButton.innerHTML = enhanceButtonDefaultContent; 
        }
    }


    applyTheme(currentTheme);
    updateThemeButtons();

    rapidApiConfigs = JSON.parse(localStorage.getItem(LS_KEY_RAPID_API_CONFIGS) || '[]');
    huggingFaceConfigs = JSON.parse(localStorage.getItem(LS_KEY_HF_CONFIGS) || '[]');
    openRouterAiConfigs = JSON.parse(localStorage.getItem(LS_KEY_OPENROUTER_AI_CONFIGS) || '[]');

    renderRapidApiConfigs();
    renderHuggingFaceConfigs();
    renderOpenRouterAiConfigs();
}

function applyTheme(themeName: Theme) {
    document.body.setAttribute('data-theme', themeName);
    if (themeName === 'glassmorphism') {
        document.body.setAttribute('data-active-theme', 'glassmorphism');
    } else {
        document.body.removeAttribute('data-active-theme');
    }
    currentTheme = themeName;
    updateThemeButtons();
}

function updateThemeButtons() {
    document.querySelectorAll('.theme-button').forEach(button => {
        if (button.getAttribute('data-theme') === currentTheme) {
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }
    });
}

function resetAllData() {
    if (confirm("Are you sure you want to reset ALL DR AI application data? This includes all chat history, saved settings, and API configurations. This action cannot be undone.")) {
        localStorage.removeItem(LS_KEY_CHAT_SESSIONS);
        localStorage.removeItem(LS_KEY_ACTIVE_CHAT_ID);
        localStorage.removeItem(LS_KEY_CORE_MEMORY);
        localStorage.removeItem(LS_KEY_CUSTOM_INSTRUCTIONS);
        localStorage.removeItem(LS_KEY_THEME);
        localStorage.removeItem(LS_KEY_ACTIVE_AI_ENGINE);
        localStorage.removeItem(LS_KEY_RAPID_API_CONFIGS);
        localStorage.removeItem(LS_KEY_HF_CONFIGS);
        localStorage.removeItem(LS_KEY_OPENROUTER_AI_CONFIGS);

        chatSessions = [];
        activeChatSessionId = null;
        currentGlobalCoreMemory = '';
        currentGlobalCustomInstructions = '';
        currentTheme = 'glassmorphism';
        activeAiEngine = 'gemini';
        rapidApiConfigs = [];
        huggingFaceConfigs = [];
        openRouterAiConfigs = [];
        ai = null; 
        currentChatSDK = null;

        loadGlobalSettings(); 
        startNewChat(true);
        displaySystemMessage("All DR AI application data has been reset.");
        if (settingsModalOverlay && !settingsModalOverlay.classList.contains('hidden')) {
             closeModal(settingsModalOverlay);
        }
        if (apiSettingsModalOverlay && !apiSettingsModalOverlay.classList.contains('hidden')) {
            closeModal(apiSettingsModalOverlay);
        }
        initializeAiInstance();
    }
}

// --- API Configuration Management ---
function addRapidApiConfig() {
    const name = rapidApiNameInput.value.trim() || `RapidAPI Config ${rapidApiConfigs.length + 1}`;
    const key = rapidApiKeyInput.value.trim();
    const host = rapidApiHostInput.value.trim();
    const endpoint = rapidApiEndpointInput.value.trim();

    if (!key || !host || !endpoint) {
        alert("DR AI: RapidAPI Key, Host, and Endpoint are required.");
        return;
    }
    rapidApiConfigs.push({ id: generateUniqueId(), name, key, host, endpoint });
    renderRapidApiConfigs();
    rapidApiNameInput.value = '';
    rapidApiKeyInput.value = '';
    rapidApiHostInput.value = '';
    rapidApiEndpointInput.value = '';
    updateApiSettingsVisualIndicators();
}

function renderRapidApiConfigs() {
    if (!rapidApiConfigsList) return;
    rapidApiConfigsList.innerHTML = '';
    rapidApiConfigs.forEach(config => {
        const item = document.createElement('div');
        item.className = 'api-config-item';
        item.innerHTML = `<span><strong>${config.name}</strong> (${config.host})</span>`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', `Remove ${config.name}`);
        removeBtn.onclick = () => deleteRapidApiConfig(config.id);
        item.appendChild(removeBtn);
        rapidApiConfigsList.appendChild(item);
    });
}

function deleteRapidApiConfig(id: string) {
    rapidApiConfigs = rapidApiConfigs.filter(c => c.id !== id);
    renderRapidApiConfigs();
    updateApiSettingsVisualIndicators();
}

function addHuggingFaceConfig() {
    const name = huggingFaceNameInput.value.trim() || `HF Config ${huggingFaceConfigs.length + 1}`;
    const apiKey = huggingFaceKeyInput.value.trim();
    const endpointUrl = huggingFaceEndpointInput.value.trim();

    if (!apiKey || !endpointUrl) {
        alert("DR AI: Hugging Face API Key and Endpoint URL are required.");
        return;
    }
    try {
        new URL(endpointUrl);
    } catch (_) {
        alert("DR AI: Invalid Hugging Face Endpoint URL.");
        return;
    }
    huggingFaceConfigs.push({ id: generateUniqueId(), name, apiKey, endpointUrl });
    renderHuggingFaceConfigs();
    huggingFaceNameInput.value = '';
    huggingFaceKeyInput.value = '';
    huggingFaceEndpointInput.value = '';
    updateApiSettingsVisualIndicators();
}

function renderHuggingFaceConfigs() {
    if (!huggingFaceConfigsList) return;
    huggingFaceConfigsList.innerHTML = '';
    huggingFaceConfigs.forEach(config => {
        const item = document.createElement('div');
        item.className = 'api-config-item';
        item.innerHTML = `<span><strong>${config.name}</strong></span>`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', `Remove ${config.name}`);
        removeBtn.onclick = () => deleteHuggingFaceConfig(config.id);
        item.appendChild(removeBtn);
        huggingFaceConfigsList.appendChild(item);
    });
}

function deleteHuggingFaceConfig(id: string) {
    huggingFaceConfigs = huggingFaceConfigs.filter(c => c.id !== id);
    renderHuggingFaceConfigs();
    updateApiSettingsVisualIndicators();
}

function addOpenRouterAiConfig() {
    const name = openRouterAiNameInput.value.trim() || `OpenRouter Config ${openRouterAiConfigs.length + 1}`;
    const apiKey = openRouterAiKeyInput.value.trim();
    const modelString = openRouterAiModelInput.value.trim();

    if (!apiKey || !modelString) {
        alert("DR AI: OpenRouter AI Key and Model String are required.");
        return;
    }
    openRouterAiConfigs.push({ id: generateUniqueId(), name, apiKey, modelString });
    renderOpenRouterAiConfigs();
    openRouterAiNameInput.value = '';
    openRouterAiKeyInput.value = '';
    openRouterAiModelInput.value = '';
    updateApiSettingsVisualIndicators();
}

function renderOpenRouterAiConfigs() {
    if (!openRouterAiConfigsList) return;
    openRouterAiConfigsList.innerHTML = '';
    openRouterAiConfigs.forEach(config => {
        const item = document.createElement('div');
        item.className = 'api-config-item';
        item.innerHTML = `<span><strong>${config.name}</strong> (${config.modelString})</span>`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', `Remove ${config.name}`);
        removeBtn.onclick = () => deleteOpenRouterAiConfig(config.id);
        item.appendChild(removeBtn);
        openRouterAiConfigsList.appendChild(item);
    });
}

function deleteOpenRouterAiConfig(id: string) {
    openRouterAiConfigs = openRouterAiConfigs.filter(c => c.id !== id);
    renderOpenRouterAiConfigs();
    updateApiSettingsVisualIndicators();
}


function updateApiSettingsVisualIndicators() {
    const sections = [
        { el: geminiApiSettingsSection, engineName: 'gemini' as AiEngineType, isConfigured: () => !!ENV_API_KEY, pathwayName: "DR AI Primary Pathway" },
        { el: openrouterApiSettingsSection, engineName: 'openrouter' as AiEngineType, isConfigured: () => openRouterAiConfigs.some(c => c.apiKey && c.modelString), pathwayName: "OpenRouter AI" },
        { el: huggingfaceApiSettingsSection, engineName: 'huggingface' as AiEngineType, isConfigured: () => huggingFaceConfigs.some(c => c.apiKey && c.endpointUrl), pathwayName: "Hugging Face" },
        { el: rapidapiApiSettingsSection, engineName: 'rapidapi' as AiEngineType, isConfigured: () => rapidApiConfigs.some(c => c.key && c.host && c.endpoint), pathwayName: "RapidAPI" }
    ];

    sections.forEach(sec => {
        if (!sec.el) return;

        sec.el.classList.remove('engine-active-configured', 'engine-active-unconfigured', 'engine-inactive');

        if (sec.engineName === 'gemini') {
            const statusDiv = sec.el.querySelector('#gemini-pathway-status') as HTMLElement | null;
            if (statusDiv) {
                statusDiv.classList.remove('active-configured', 'active-unconfigured'); 
                let statusText = `${sec.pathwayName}: `;
                if (activeAiEngine === 'gemini') {
                    if (sec.isConfigured()) {
                        statusText += "Active & Ready";
                        statusDiv.classList.add('active-configured');
                        sec.el.classList.add('engine-active-configured');
                    } else {
                        statusText += "System Configuration Issue";
                        statusDiv.classList.add('active-unconfigured');
                        sec.el.classList.add('engine-active-unconfigured');
                    }
                } else { 
                    if (sec.isConfigured()) {
                        statusText += "Configured (Inactive)";
                    } else {
                        statusText += "System Configuration Issue (Inactive)";
                    }
                    sec.el.classList.add('engine-inactive');
                }
                statusDiv.textContent = statusText;
            }
        } else { 
            const header = sec.el.querySelector('h3.settings-section-header') as HTMLElement | null;
            if (header) {
                 header.classList.remove('active-configured', 'active-unconfigured'); 
                if (activeAiEngine === sec.engineName) {
                    if (sec.isConfigured()) {
                        sec.el.classList.add('engine-active-configured');
                        header.classList.add('active-configured');
                    } else {
                        sec.el.classList.add('engine-active-unconfigured');
                        header.classList.add('active-unconfigured');
                    }
                } else {
                    sec.el.classList.add('engine-inactive');
                }
            }
        }
    });
}

// --- UI Updates ---
function updateInputPlaceholderAndButtons(engineIsReady: boolean = true) {
    let placeholderText = "Type your message to DR AI...";
    let controlsDisabled = false;

    if (!engineIsReady) {
        if (activeAiEngine === 'gemini' && !ENV_API_KEY) {
            placeholderText = "DR AI Primary Pathway Error: System API Key not configured.";
        } else {
            placeholderText = `DR AI (${activeAiEngine} pathway) not configured. Check API Settings.`;
        }
        controlsDisabled = true;
    } else if (isImageGenerationMode) {
        placeholderText = "Describe the image DR AI should generate...";
    } else if (isGoogleSearchMode) {
        placeholderText = "Ask DR AI a question for Google Search...";
    }

    if (promptInput) {
        promptInput.placeholder = placeholderText;
        promptInput.disabled = controlsDisabled;
    }
    if (sendButton) {
        sendButton.disabled = controlsDisabled;
    }

    const geminiFeaturesDisabled = activeAiEngine !== 'gemini' || !ENV_API_KEY || controlsDisabled;
    if (imageToggleButton) {
        imageToggleButton.disabled = geminiFeaturesDisabled;
        imageToggleButton.style.display = activeAiEngine === 'gemini' ? 'inline-flex' : 'none';
    }
    if (searchToggleButton) {
        searchToggleButton.disabled = geminiFeaturesDisabled;
        searchToggleButton.style.display = activeAiEngine === 'gemini' ? 'inline-flex' : 'none';
    }

    if (activeAiEngine !== 'gemini') {
        isImageGenerationMode = false;
        isGoogleSearchMode = false;
        imageToggleButton?.classList.remove('active');
        imageToggleButton?.setAttribute('aria-pressed', 'false');
        searchToggleButton?.classList.remove('active');
        searchToggleButton?.setAttribute('aria-pressed', 'false');
    }
}


// --- Modal Controls ---
function openModal(modalToOpen: HTMLElement | null) {
    if (!modalToOpen) return;

    allModalOverlays.forEach(overlay => {
        if (overlay && overlay !== modalToOpen && !overlay.classList.contains('hidden')) {
            closeModal(overlay);
        }
    });

    modalToOpen.classList.remove('hidden');
    modalToOpen.setAttribute('aria-hidden', 'false');
    const focusableElement = modalToOpen.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    if (focusableElement) {
        focusableElement.focus();
    }

    if (modalToOpen === settingsModalOverlay && enhanceInstructionsButton) {
         if (ENV_API_KEY) {
            enhanceInstructionsButton.disabled = false;
            enhanceInstructionsButton.title = "Enhance Instructions with DR AI (uses Primary Pathway)";
            enhanceInstructionsButton.innerHTML = enhanceButtonDefaultContent;
        } else {
            enhanceInstructionsButton.disabled = true;
            enhanceInstructionsButton.title = "DR AI Primary Pathway (Gemini) must be configured for this feature.";
            enhanceInstructionsButton.innerHTML = enhanceButtonDefaultContent;
        }
    }
    if (modalToOpen === apiSettingsModalOverlay) {
         updateApiSettingsVisualIndicators();
    }

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && menuButton) {
        sidebar.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
    }
}

function closeModal(modalOverlay: HTMLElement | null) {
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
        modalOverlay.setAttribute('aria-hidden', 'true');
    }
}


// --- Event Listeners ---
function setupEventListeners() {
    if (sendButton && promptInput) {
        sendButton.innerHTML = sendButtonDefaultSVG;
        sendButton.onclick = handleSendMessage;
        promptInput.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !promptInput.disabled) {
                e.preventDefault();
                handleSendMessage();
            }
        };
        promptInput.addEventListener('input', () => {
            promptInput.style.height = 'auto';
            promptInput.style.height = `${promptInput.scrollHeight}px`;
        });
    }

    if (stopGenerationButton) {
        stopGenerationButton.onclick = () => {
            if (abortController) {
                abortController.abort();
                displaySystemMessage("DR AI generation stopping...");
                stopGenerationButton.disabled = true;
            }
        };
    }

    if (newChatButton) {
        newChatButton.onclick = () => startNewChat();
    }
    if (clearConversationButton) {
        clearConversationButton.onclick = clearCurrentConversation;
    }

    if (menuButton && sidebar) {
        menuButton.onclick = () => {
            sidebar.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(sidebar.classList.contains('open')));
        };
    }
    document.addEventListener('click', (event) => {
        if (sidebar && sidebar.classList.contains('open') && menuButton) {
            const target = event.target as Node;
            const isAnyModalOpen = allModalOverlays.some(modal => modal && !modal.classList.contains('hidden'));
            if (!sidebar.contains(target) && !menuButton.contains(target) && !isAnyModalOpen) {
                sidebar.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        }
    });

    if (settingsButton && settingsModalOverlay) {
        settingsButton.onclick = () => openModal(settingsModalOverlay);
    }
    if (closeSettingsModalButton && settingsModalOverlay) {
        closeSettingsModalButton.onclick = () => closeModal(settingsModalOverlay);
    }
    if (saveSettingsButton) {
        saveSettingsButton.onclick = () => saveGlobalSettings();
    }
     if (enhanceInstructionsButton) {
        enhanceInstructionsButton.onclick = handleEnhanceInstructionsClick;
    }
    if (resetAllDataButton) {
        resetAllDataButton.onclick = resetAllData;
    }
    themeSelector?.querySelectorAll('.theme-button').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme') as Theme;
            if (theme) {
                applyTheme(theme);
            }
        });
    });

    if (apiSettingsButton && apiSettingsModalOverlay) {
        apiSettingsButton.onclick = () => openModal(apiSettingsModalOverlay);
    }
    if (closeApiSettingsModalButton && apiSettingsModalOverlay) {
        closeApiSettingsModalButton.onclick = () => closeModal(apiSettingsModalOverlay);
    }
    if (saveApiSettingsButton) {
        saveApiSettingsButton.onclick = () => {
             saveGlobalSettings('DR AI API Settings confirmed!');
        };
    }
    if (activeAiEngineSelector) {
        activeAiEngineSelector.onchange = () => {
            activeAiEngine = activeAiEngineSelector.value as AiEngineType;
            initializeAiInstance();
        };
    }
    if (addRapidApiConfigButton) addRapidApiConfigButton.onclick = addRapidApiConfig;
    if (addHuggingFaceConfigButton) addHuggingFaceConfigButton.onclick = addHuggingFaceConfig;
    if (addOpenRouterAiConfigButton) addOpenRouterAiConfigButton.onclick = addOpenRouterAiConfig;

    allModalOverlays.forEach(overlay => {
        overlay?.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal(overlay);
            }
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            allModalOverlays.forEach(closeModal);
        }
    });

    if (aboutButton && aboutModalOverlay) {
        aboutButton.onclick = () => openModal(aboutModalOverlay);
    }
    if (closeAboutModalButton && aboutModalOverlay) {
        closeAboutModalButton.onclick = () => closeModal(aboutModalOverlay);
    }
    if (termsButton && termsModalOverlay) {
        termsButton.onclick = () => openModal(termsModalOverlay);
    }
    if (closeTermsModalButton && termsModalOverlay) {
        closeTermsModalButton.onclick = () => closeModal(termsModalOverlay);
    }
    if (capabilitiesButton && capabilitiesModalOverlay) {
        capabilitiesButton.onclick = () => openModal(capabilitiesModalOverlay);
    }
    if (closeCapabilitiesModalButton && capabilitiesModalOverlay) {
        closeCapabilitiesModalButton.onclick = () => closeModal(capabilitiesModalOverlay);
    }

    if (imageToggleButton) {
        imageToggleButton.onclick = () => {
            if (activeAiEngine !== 'gemini' || !ENV_API_KEY) {
                 displaySystemMessage("Image generation is a DR AI feature available with its primary pathway. Please ensure the pathway is active and system configured.", true);
                return;
            }
            isImageGenerationMode = !isImageGenerationMode;
            imageToggleButton.classList.toggle('active', isImageGenerationMode);
            imageToggleButton.setAttribute('aria-pressed', String(isImageGenerationMode));
            if (isImageGenerationMode) {
                isGoogleSearchMode = false;
                searchToggleButton?.classList.remove('active');
                searchToggleButton?.setAttribute('aria-pressed', 'false');
            }
            updateInputPlaceholderAndButtons(true);
        };
    }
    if (searchToggleButton) {
        searchToggleButton.onclick = () => {
             if (activeAiEngine !== 'gemini' || !ENV_API_KEY) {
                displaySystemMessage("Google Search grounding is a DR AI feature available with its primary pathway. Please ensure the pathway is active and system configured.", true);
                return;
            }
            isGoogleSearchMode = !isGoogleSearchMode;
            searchToggleButton.classList.toggle('active', isGoogleSearchMode);
            searchToggleButton.setAttribute('aria-pressed', String(isGoogleSearchMode));
            if (isGoogleSearchMode) {
                isImageGenerationMode = false;
                imageToggleButton?.classList.remove('active');
                imageToggleButton?.setAttribute('aria-pressed', 'false');
            }
            updateInputPlaceholderAndButtons(true);
        };
    }
}

// --- Initialization ---
async function initializeApp() {
    showLoadingOverlay("DR AI is waking up...");
    loadGlobalSettings(); 
    setupEventListeners();

    chatSessions = loadChatSessions();
    activeChatSessionId = loadActiveChatId();

    const engineIsReady = await initializeAiInstance(); 

    if (activeChatSessionId && chatSessions.some(s => s.id === activeChatSessionId)) {
        loadChatSession(activeChatSessionId);
    } else if (chatSessions.length > 0) {
        loadChatSession(chatSessions[0].id);
    } else {
        startNewChat(true); 
    }

    renderChatHistory();
    const activeSession = getActiveChatSession();
    if (activeSession && activeSession.history.length === 0 &&
        (!localStorage.getItem(LS_KEY_CHAT_SESSIONS) || loadChatSessions().length <=1 ) ) {
        displaySystemMessage("Welcome to DR AI! How can I assist you today?");
    }
    updateInputPlaceholderAndButtons(engineIsReady);
    hideLoadingOverlay();
}

// Start the application
initializeApp();
