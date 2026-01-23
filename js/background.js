const local_data = {
    labels: {
        Data_0: {
            id: 0,
            Label: 'localhost',
            URLRegexpFilter: '^http(s)?://localhost.*$',
            Position: 'top',
            Style: 'simple',
            Color: '#c2fbfc',
            Alpha: 100,
            NowTimer: true,
            Enabled: true
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['labels'], (result) => {
        if (!result.labels) {
            chrome.storage.local.set(local_data);
        }
    });
});