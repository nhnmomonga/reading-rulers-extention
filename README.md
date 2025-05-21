# Reading Ruler Chrome Extension

## Purpose

The Reading Ruler Chrome Extension is designed to assist users by highlighting lines of text, making it easier to focus while reading long documents or articles online. It aims to reduce reading load, especially for users who may easily lose their place or have reading difficulties such as dyslexia.

This extension is developed based on the specifications outlined in the SRS document.

## Features

*   **Reading Ruler:** Displays a configurable horizontal bar that follows the mouse cursor vertically to highlight the current line of text.
*   **Toggle On/Off:** Easily toggle the ruler's visibility using:
    *   The extension's toolbar icon.
    *   A keyboard shortcut (Default: `Ctrl+Shift+R` or `Cmd+Shift+R` on Mac). Users can customize this in `chrome://extensions/shortcuts`.
    *   A context menu item (right-click on a page).
*   **Customization:** Configure the ruler's appearance via the Options page:
    *   **Height:** Adjust the thickness of the ruler bar (in pixels).
    *   **Color & Opacity:** Set the base color (RGB) and opacity of the ruler.
*   **Site-Specific Profiles:** Settings (height, color, opacity, focus mode) are saved per website. The first time you use the ruler on a new site, the current global default settings are copied to create a profile for that site.
*   **Focus Mode:** Optionally dim the area outside the ruler to further enhance focus on the highlighted line. This can be enabled in the Options page.
*   **Internationalization:** UI elements are available in English and Japanese.

## Installation (for Development/Testing)

1.  Clone this repository or download the source code.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" using the toggle switch in the top right corner.
4.  Click the "Load unpacked" button.
5.  Select the directory where you cloned/downloaded the extension's source code (the directory containing `manifest.json`).

The Reading Ruler extension icon should now appear in your Chrome toolbar.

## Usage

*   **Toggle:** Click the toolbar icon, use the keyboard shortcut, or right-click on a webpage and select "Toggle Reading Ruler on this page."
*   **Options:**
    1.  Right-click the extension icon in the Chrome toolbar and select "Options," or navigate to the extension's card in `chrome://extensions` and click "Details," then "Extension options."
    2.  Adjust the height, color, and opacity settings.
    3.  Enable or disable Focus Mode.
    4.  Click "Save Settings." These settings are saved as global defaults.
    5.  As noted, when you first activate the ruler on a specific website, these global defaults are used to create a profile for that site. Subsequent changes to global defaults via the options page will apply to new sites but won't automatically update profiles already created for other sites.

## Default Settings

*   **Ruler Height:** 32px
*   **Ruler Color:** Semi-transparent blue (`rgba(0, 0, 255, 0.3)`)
*   **Focus Mode:** Disabled

---

This project adheres to the requirements specified in the provided Software Requirements Specification (SRS).
