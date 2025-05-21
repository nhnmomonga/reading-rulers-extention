// content.js
console.debug("Reading Ruler Content Script loaded."); // Changed from log to debug

// Global variables
let isRulerActive = false;
let rulerElement = null;
let mouseYPosition = 50; 
let focusTopOverlay = null;
let focusBottomOverlay = null;

const DEFAULT_RULER_SETTINGS = {
  height: '32px', 
  color: 'rgba(0, 0, 255, 0.3)', 
  focusModeEnabled: false 
};

// Listener to update mouse Y position
document.addEventListener('mousemove', (event) => {
  mouseYPosition = event.clientY;
  if (isRulerActive && rulerElement) {
    const rulerHeightNum = parseInt(rulerElement.style.height);
    const newRulerTopNum = mouseYPosition - (rulerHeightNum / 2);
    rulerElement.style.top = newRulerTopNum + 'px';

    if (focusTopOverlay && focusBottomOverlay) { 
      updateFocusOverlays(newRulerTopNum, rulerHeightNum);
    }
  }
});

function createRuler() {
  if (rulerElement) {
    console.debug("CreateRuler called but rulerElement already exists."); // Changed from log to debug
    return;
  }

  let currentHostname = window.location.hostname;
  if (!currentHostname || currentHostname === "") {
    currentHostname = '_localfiles_';
  }

  const siteHeightKey = currentHostname + '_rulerHeight';
  const siteColorKey = currentHostname + '_rulerColor';
  const siteFocusKey = currentHostname + '_focusModeEnabled'; 

  const globalHeightKey = 'rulerHeight';
  const globalColorKey = 'rulerColor';
  const globalFocusKey = 'focusModeEnabled'; 

  chrome.storage.sync.get(
    [siteHeightKey, siteColorKey, siteFocusKey, globalHeightKey, globalColorKey, globalFocusKey],
    (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting ruler settings:", chrome.runtime.lastError.message);
        items = {};
      }

      if (!isRulerActive) {
        console.debug("Ruler creation aborted as isRulerActive is false (toggled off during storage fetch)."); // Changed from log to debug
        return;
      }
      if (rulerElement) {
        console.debug("Ruler creation aborted, rulerElement exists (created by another call during storage fetch)."); // Changed from log to debug
        return;
      }

      const siteHeight = items[siteHeightKey];
      const siteColor = items[siteColorKey];
      const siteFocus = items[siteFocusKey];

      const globalHeight = items[globalHeightKey];
      const globalColor = items[globalColorKey];
      const globalFocus = items[globalFocusKey];

      const appliedHeight = siteHeight || globalHeight || DEFAULT_RULER_SETTINGS.height;
      const appliedColor = siteColor || globalColor || DEFAULT_RULER_SETTINGS.color;
      const focusEnabled = siteFocus !== undefined ? siteFocus :
                           (globalFocus !== undefined ? globalFocus :
                           DEFAULT_RULER_SETTINGS.focusModeEnabled);
      
      console.debug(`Settings for ${currentHostname}: SiteH=${siteHeight}, SiteC=${siteColor}, SiteF=${siteFocus}, GlobalH=${globalHeight}, GlobalC=${globalColor}, GlobalF=${globalFocus}. Applied: H=${appliedHeight}, C=${appliedColor}, F=${focusEnabled}`); // Changed from log to debug

      // Automatic profile creation
      if (isRulerActive && (siteHeight === undefined || siteColor === undefined || siteFocus === undefined)) {
        const newSiteProfile = {};
        if (siteHeight === undefined) newSiteProfile[siteHeightKey] = appliedHeight;
        if (siteColor === undefined) newSiteProfile[siteColorKey] = appliedColor;
        if (siteFocus === undefined) newSiteProfile[siteFocusKey] = focusEnabled;
        
        if (Object.keys(newSiteProfile).length > 0) {
            chrome.storage.sync.set(newSiteProfile, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Error saving site-specific profile for ${currentHostname}:`, chrome.runtime.lastError.message);
                } else {
                    console.debug(`Site-specific profile for ${currentHostname} created/updated with:`, newSiteProfile); // Changed from log to debug
                }
            });
        }
      }
      
      rulerElement = document.createElement('div');
      rulerElement.id = 'reading-ruler-overlay';

      const rulerHeightNum = parseInt(appliedHeight);
      const rulerTopNum = mouseYPosition - (rulerHeightNum / 2);

      Object.assign(rulerElement.style, {
        position: 'fixed',
        top: rulerTopNum + 'px',
        left: '0px',
        width: '100%',
        height: appliedHeight,
        backgroundColor: appliedColor,
        zIndex: '2147483647', 
        pointerEvents: 'none'
      });

      document.body.appendChild(rulerElement);
      console.debug("Ruler created on", currentHostname, "with H:", appliedHeight, "C:", appliedColor, "F:", focusEnabled, "at Y:", rulerElement.style.top); // Changed from log to debug

      if (focusEnabled) {
        createFocusOverlays(rulerHeightNum, rulerTopNum);
      }
    }
  );
}

function createFocusOverlays(rulerHeightNum, rulerTopNum) {
  if (!focusTopOverlay) {
    focusTopOverlay = document.createElement('div');
    focusTopOverlay.id = 'reading-ruler-focus-top';
    Object.assign(focusTopOverlay.style, {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100%',
      height: rulerTopNum + 'px',
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: '2147483646', 
      pointerEvents: 'none'
    });
    document.body.appendChild(focusTopOverlay);
    console.debug("Top focus overlay created."); // Changed from log to debug
  }

  if (!focusBottomOverlay) {
    focusBottomOverlay = document.createElement('div');
    focusBottomOverlay.id = 'reading-ruler-focus-bottom';
    Object.assign(focusBottomOverlay.style, {
      position: 'fixed',
      top: (rulerTopNum + rulerHeightNum) + 'px',
      left: '0px',
      width: '100%',
      height: 'calc(100vh - ' + (rulerTopNum + rulerHeightNum) + 'px)',
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: '2147483646', 
      pointerEvents: 'none'
    });
    document.body.appendChild(focusBottomOverlay);
    console.debug("Bottom focus overlay created."); // Changed from log to debug
  }
}

function removeFocusOverlays() {
  if (focusTopOverlay && focusTopOverlay.parentNode) {
    focusTopOverlay.parentNode.removeChild(focusTopOverlay);
    focusTopOverlay = null;
    console.debug("Top focus overlay removed."); // Changed from log to debug
  }
  if (focusBottomOverlay && focusBottomOverlay.parentNode) {
    focusBottomOverlay.parentNode.removeChild(focusBottomOverlay);
    focusBottomOverlay = null;
    console.debug("Bottom focus overlay removed."); // Changed from log to debug
  }
}

function updateFocusOverlays(rulerTopNum, rulerHeightNum) {
  if (focusTopOverlay && focusBottomOverlay) {
    focusTopOverlay.style.height = rulerTopNum + 'px';
    focusBottomOverlay.style.top = (rulerTopNum + rulerHeightNum) + 'px';
    focusBottomOverlay.style.height = 'calc(100vh - ' + (rulerTopNum + rulerHeightNum) + 'px)';
  }
}

function removeRuler() {
  if (rulerElement && rulerElement.parentNode) {
    rulerElement.parentNode.removeChild(rulerElement);
    rulerElement = null;
    console.debug("Ruler removed."); // Changed from log to debug
  } else {
    console.debug("RemoveRuler called but no rulerElement to remove."); // Changed from log to debug
  }
  removeFocusOverlays(); 
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_RULER") {
    if (isRulerActive) {
      isRulerActive = false;
      removeRuler(); 
    } else {
      isRulerActive = true;
      createRuler();
    }
    sendResponse({ status: "success", isActive: isRulerActive });
    return true;
  }
});
