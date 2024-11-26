const { ipcRenderer } = require('electron');
const Tesseract = require('tesseract.js');
const axios = require('axios');

// Google Translate API Config
const TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";
const API_KEY = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with your API key

// OCR and Translation on Hover
const virtualWindow = document.getElementById('virtual-window');

// Helper function for translation
async function translateText(text, targetLanguage = "en") {
    try {
        const response = await axios.post(TRANSLATE_API_URL, {
            q: text,
            target: targetLanguage,
            source: "ja", // Japanese as source language
            key: API_KEY,
        });
        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error("Translation error:", error);
        return "Translation failed.";
    }
}

// OCR Processing Function
async function processImage(imageData) {
    try {
        const result = await Tesseract.recognize(imageData, "jpn");
        const detectedText = result.data.text.trim();
        console.log("Detected Text:", detectedText);

        if (detectedText) {
            const translation = await translateText(detectedText);
            console.log("Translated Text:", translation);
            showTranslationPopup(translation);
        }
    } catch (error) {
        console.error("OCR error:", error);
    }
}

// Display Translation Popup
function showTranslationPopup(text) {
    const popup = document.createElement("div");
    popup.style.position = "absolute";
    popup.style.background = "rgba(0, 0, 0, 0.8)";
    popup.style.color = "white";
    popup.style.padding = "10px";
    popup.style.borderRadius = "5px";
    popup.style.top = `${event.clientY + 10}px`;
    popup.style.left = `${event.clientX + 10}px`;
    popup.innerText = text;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 5000); // Remove popup after 5 seconds
}

// Capture Hover Event
virtualWindow.addEventListener("mousemove", async (event) => {
    const { clientX, clientY } = event;

    // Capture a section of the screen under the window
    const captureData = await ipcRenderer.invoke("capture-screen", {
        x: clientX,
        y: clientY,
        width: 200, // Area width
        height: 50, // Area height
    });

    if (captureData) {
        processImage(captureData); // Pass captured data to OCR
    }
});
