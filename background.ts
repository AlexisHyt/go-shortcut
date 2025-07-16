export {}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get("entries", (result) => {
    const entries = result.entries || {}
    
    const suggestions = []

    for (const [keyword, url] of Object.entries(entries)) {
      if (keyword.toLowerCase().includes(text.toLowerCase())) {
        suggestions.push({
          content: keyword,
          description: `Go to "${url}" with shortcut "${keyword}"`
        })
      }
    }

    if (suggestions.length === 0 && text.trim() !== "") {
      suggestions.push({
        content: text,
        description: `No matching shortcut found for "${text}"`
      })
    }
    
    suggest(suggestions)
  })
})

chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.storage.local.get("entries", (result) => {
    const entries = result.entries || {}

    if (entries[text]) {
      chrome.tabs.update({
        url: entries[text]
      })
    } else {
      let url = 'https://www.google.com/search?q=' + text
      
      chrome.tabs.update({
        url: url
      })
    }
  })
})