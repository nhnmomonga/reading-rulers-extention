// bg.js
console.debug("Reading Ruler Service Worker started."); // Changed from log to debug

// Listener for the browser action (toolbar icon)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_RULER" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Error sending message from action.onClicked:", chrome.runtime.lastError.message);
      } else {
        console.debug("Browser action toggle message sent, response:", response); // Changed from log to debug
      }
    });
  } else {
    console.warn("Browser action clicked on tab with no ID.");
  }
});

// Create context menu item on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-reading-ruler",
    title: "__MSG_contextMenuToggleRuler__", 
    contexts: ["page"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error creating context menu:", chrome.runtime.lastError.message); // Kept as error
    } else {
      console.debug("Context menu created successfully."); // Changed from log to debug
    }
  });
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener(async (onClickData, tabContext) => {
  if (onClickData.menuItemId === "toggle-reading-ruler") {
    const targetTabId = tabContext ? tabContext.id : null;

    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, { type: "TOGGLE_RULER" }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Error sending message from context menu:", chrome.runtime.lastError.message);
        } else {
          console.debug("Context menu toggle message sent, response:", response); // Changed from log to debug
        }
      });
    } else {
      console.warn("Context menu clicked, but tab ID not directly available from tabContext. Querying active tab.");
      try {
        let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, { type: "TOGGLE_RULER" }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn("Error sending message from context menu (fallback query):", chrome.runtime.lastError.message);
            } else {
              console.debug("Context menu toggle message sent (fallback query), response:", response); // Changed from log to debug
            }
          });
        } else {
          console.warn("Could not identify active tab for context menu action after fallback query.");
        }
      } catch (e) {
        console.error("Error querying active tab for context menu:", e); // Kept as error
      }
    }
  }
});
