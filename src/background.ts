import { Message } from "./messaging";

chrome.runtime.onMessage.addListener(
  ({ message, payload }: { message: Message; payload: any }) => {
    switch (message) {
      case Message.LOADED:
        console.log("Content script loaded", payload);
        break;
    }
  }
);

chrome.runtime.onInstalled.addListener(() => {
  try {
    console.log('Extension installed or updated'); 
  } catch (error) {
    console.error('Error during installation:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.type === 'STORE_ELEMENTS') {
      const { url, elements } = message;
      chrome.storage.local.get([url], (result) => {
        const storedData = result[url] || [];
        storedData.push(...elements);

        chrome.storage.local.set({ [url]: storedData }, () => {
          console.log('New stored data:', storedData); 

          // Immediately read back from storage to confirm it's stored correctly
          chrome.storage.local.get([url], (newResult) => {
            console.log('Data read back from storage:', newResult[url]); // Verify stored data
            sendResponse({ status: 'success', data: newResult[url] });
          });
        });
      });

      return true;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ status: 'error', error: error });
    return true; // Keep the messaging channel open for sendResponse
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  try {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reverse=true')) {
      chrome.tabs.sendMessage(tabId, { type: 'REVERSE_HIGHLIGHT' });
    }
  } catch (error) {
    console.error('Error during tab update:', error);
  }
});