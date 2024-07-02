import { Message } from "./messaging";

(() => {
  chrome.runtime.sendMessage({
    message: Message.LOADED,
    payload: { version: 1.0 },
  });
})();

const highlightElements = (reverse = false) => {
  try {
    const links = document.querySelectorAll('a');
    const buttons = document.querySelectorAll('button');

    links.forEach(link => {
      (link as HTMLElement).style.outline = reverse ? '2px solid blue' : '2px solid orange';
    });

    buttons.forEach(button => {
      (button as HTMLElement).style.outline = reverse ? '2px solid orange' : '2px solid blue';
    });
  } catch (error) {
    console.error('Error highlighting elements:', error);
  }
};

const detectElements = () => {
  try {
    const url = window.location.href;
    const elements: { tag: string, href?: string }[] = [];

    document.querySelectorAll('a').forEach(link => {
      elements.push({ tag: link.tagName.toLowerCase(), href: (link as HTMLAnchorElement).href });
    });

    document.querySelectorAll('button').forEach(button => {
      elements.push({ tag: button.tagName.toLowerCase() });
    });

    chrome.runtime.sendMessage({ type: 'STORE_ELEMENTS', url, elements }, response => {
      console.log('Message sent to background script, response:', response); 
    });
  } catch (error) {
    console.error('Error detecting and storing elements:', error);
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.type === 'REVERSE_HIGHLIGHT') {
      highlightElements(true);
    }
  } catch (error) {
    console.error('Error processing reverse highlight message:', error);
  }
});

window.addEventListener('load', () => {
  try {
    highlightElements();
    detectElements();
  } catch (error) {
    console.error('Error during window load:', error);
  }
});