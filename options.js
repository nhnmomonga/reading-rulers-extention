// options.js

const RULER_HEIGHT_KEY = 'rulerHeight';
const RULER_COLOR_KEY_FOR_CONTENT_SCRIPT = 'rulerColor';
const FOCUS_MODE_KEY = 'focusModeEnabled';
const RULER_HEIGHT_MODE_KEY = 'rulerHeightMode';

const OPTIONS_RULER_BASE_COLOR_KEY = 'rulerBaseColor';
const OPTIONS_RULER_OPACITY_KEY = 'rulerOpacity';     

const DEFAULT_OPTIONS_PAGE_VALUES = {
  height: 32,
  baseColor: '#0000FF',
  opacity: 0.3,
  focusMode: false,
  rulerHeightMode: 'fixed'
};

const DEFAULT_CONTENT_SCRIPT_VALUES = {
  height: DEFAULT_OPTIONS_PAGE_VALUES.height + 'px',
  color: `rgba(${hexToRgb(DEFAULT_OPTIONS_PAGE_VALUES.baseColor).r}, ${hexToRgb(DEFAULT_OPTIONS_PAGE_VALUES.baseColor).g}, ${hexToRgb(DEFAULT_OPTIONS_PAGE_VALUES.baseColor).b}, ${DEFAULT_OPTIONS_PAGE_VALUES.opacity})`,
  focusMode: DEFAULT_OPTIONS_PAGE_VALUES.focusMode,
  rulerHeightMode: 'fixed'
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function localizeOptionsPage() {
  document.title = chrome.i18n.getMessage("optionsPageTitle");
  document.getElementById('optionsPageHeading').textContent = chrome.i18n.getMessage("optionsPageHeading");
  
  document.querySelector('label[for="rulerHeight"]').textContent = chrome.i18n.getMessage("optionsHeightLabel");
  document.querySelector('label[for="rulerColor"]').textContent = chrome.i18n.getMessage("optionsColorLabel");
  document.querySelector('label[for="rulerOpacity"]').textContent = chrome.i18n.getMessage("optionsOpacityLabel");
  document.querySelector('label[for="focusModeEnabled"]').textContent = chrome.i18n.getMessage("optionsFocusModeLabel");
  document.querySelector('label[data-i18n="optionsRulerHeightModeLabel"]').textContent = chrome.i18n.getMessage("optionsRulerHeightModeLabel");
  document.querySelector('label[data-i18n="optionsHeightModeFixedLabel"]').textContent = chrome.i18n.getMessage("optionsHeightModeFixedLabel");
  document.querySelector('label[data-i18n="optionsHeightModeAutoLabel"]').textContent = chrome.i18n.getMessage("optionsHeightModeAutoLabel");
  
  document.getElementById('saveOptions').textContent = chrome.i18n.getMessage("optionsSaveButton");
  
  const explanationElement = document.getElementById('pExplanation');
  if (explanationElement) { 
     const smallElement = explanationElement.querySelector('small') || explanationElement; 
     smallElement.textContent = chrome.i18n.getMessage("optionsGlobalExplanation");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  localizeOptionsPage(); 

  const heightInput = document.getElementById('rulerHeight');
  const colorInput = document.getElementById('rulerColor');
  const opacityInput = document.getElementById('rulerOpacity');
  const opacityValueSpan = document.getElementById('opacityValue');
  const focusModeCheckbox = document.getElementById('focusModeEnabled');
  const saveButton = document.getElementById('saveOptions');
  const statusMessage = document.getElementById('statusMessage');
  const heightModeFixedRadio = document.getElementById('rulerHeightModeFixed');
  const heightModeAutoRadio = document.getElementById('rulerHeightModeAuto');

  opacityInput.addEventListener('input', () => {
    opacityValueSpan.textContent = opacityInput.value;
  });

  chrome.storage.sync.get({
    [RULER_HEIGHT_KEY]: DEFAULT_CONTENT_SCRIPT_VALUES.height,
    [OPTIONS_RULER_BASE_COLOR_KEY]: DEFAULT_OPTIONS_PAGE_VALUES.baseColor,
    [OPTIONS_RULER_OPACITY_KEY]: DEFAULT_OPTIONS_PAGE_VALUES.opacity,
    [FOCUS_MODE_KEY]: DEFAULT_OPTIONS_PAGE_VALUES.focusMode,
    [RULER_HEIGHT_MODE_KEY]: DEFAULT_OPTIONS_PAGE_VALUES.rulerHeightMode
  }, (items) => {
    if (chrome.runtime.lastError) {
        console.error("Error loading settings for options page:", chrome.runtime.lastError.message); // Kept as error
        statusMessage.textContent = chrome.i18n.getMessage("optionsStatusErrorLoading");
        heightInput.value = DEFAULT_OPTIONS_PAGE_VALUES.height;
        colorInput.value = DEFAULT_OPTIONS_PAGE_VALUES.baseColor;
        opacityInput.value = DEFAULT_OPTIONS_PAGE_VALUES.opacity;
        focusModeCheckbox.checked = DEFAULT_OPTIONS_PAGE_VALUES.focusMode;
        heightModeFixedRadio.checked = DEFAULT_OPTIONS_PAGE_VALUES.rulerHeightMode === 'fixed';
        heightModeAutoRadio.checked = DEFAULT_OPTIONS_PAGE_VALUES.rulerHeightMode === 'auto';
        heightInput.disabled = DEFAULT_OPTIONS_PAGE_VALUES.rulerHeightMode === 'auto';
    } else {
        console.debug("Settings loaded for options page:", items); // Changed from log to debug (if there was one before)
        heightInput.value = parseInt(items[RULER_HEIGHT_KEY]) || DEFAULT_OPTIONS_PAGE_VALUES.height;
        colorInput.value = items[OPTIONS_RULER_BASE_COLOR_KEY];
        opacityInput.value = items[OPTIONS_RULER_OPACITY_KEY];
        focusModeCheckbox.checked = items[FOCUS_MODE_KEY];
        if (items[RULER_HEIGHT_MODE_KEY] === 'auto') {
            heightModeAutoRadio.checked = true;
        } else {
            heightModeFixedRadio.checked = true;
        }
        heightInput.disabled = items[RULER_HEIGHT_MODE_KEY] === 'auto';
    }
    opacityValueSpan.textContent = opacityInput.value;
  });

  heightModeFixedRadio.addEventListener('change', () => { heightInput.disabled = false; });
  heightModeAutoRadio.addEventListener('change', () => { heightInput.disabled = true; });

  saveButton.addEventListener('click', () => {
    const heightForContentScript = heightInput.value + 'px';
    const baseColorForOptionsPage = colorInput.value;
    const opacityForOptionsPage = parseFloat(opacityInput.value);
    const focusEnabledForContentScript = focusModeCheckbox.checked;
    const selectedHeightMode = heightModeAutoRadio.checked ? 'auto' : 'fixed';

    const rgb = hexToRgb(baseColorForOptionsPage);
    let finalRgbaColorForContentScript;

    if (rgb) {
        finalRgbaColorForContentScript = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityForOptionsPage})`;
    } else {
        console.error("Invalid hex color:", baseColorForOptionsPage); // Kept as error
        const defaultRgb = hexToRgb(DEFAULT_OPTIONS_PAGE_VALUES.baseColor);
        finalRgbaColorForContentScript = `rgba(${defaultRgb.r}, ${defaultRgb.g}, ${defaultRgb.b}, ${opacityForOptionsPage})`;
    }
    
    const settingsToSave = {
      [RULER_HEIGHT_KEY]: heightForContentScript,
      [RULER_COLOR_KEY_FOR_CONTENT_SCRIPT]: finalRgbaColorForContentScript,
      [FOCUS_MODE_KEY]: focusEnabledForContentScript,
      [OPTIONS_RULER_BASE_COLOR_KEY]: baseColorForOptionsPage,
      [OPTIONS_RULER_OPACITY_KEY]: opacityForOptionsPage,
      [RULER_HEIGHT_MODE_KEY]: selectedHeightMode
    };

    chrome.storage.sync.set(settingsToSave, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving settings:", chrome.runtime.lastError.message); // Kept as error
        statusMessage.textContent = chrome.i18n.getMessage("optionsStatusErrorSaving") + ' ' + chrome.runtime.lastError.message;
      } else {
        console.debug("Settings saved:", settingsToSave); // Changed from log to debug
        statusMessage.textContent = chrome.i18n.getMessage("optionsStatusSaved");
        setTimeout(() => { statusMessage.textContent = ''; }, 3500);
      }
    });
  });
});
