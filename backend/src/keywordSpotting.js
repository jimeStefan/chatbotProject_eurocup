const fs = require('fs');
const path = require('path');

const keywordList = ["matches", "players", "teams", "stadiums", "stadium"];

function keywordSpotting(T, P) {
    const n = T.length;
    const m = P.length;
    
    if (m === 0) {
        return 0;
    }

    const last = {};
    for (let k = 0; k < m; k++) {
        last[P[k]] = k;
    }

    let i = m - 1;
    let k = m - 1;

    while (i < n) {
        if (T[i] === P[k]) {
            if (k === 0) {
                return i;
            } else {
                i--;
                k--;
            }
        } else {
            const j = last[T[i]] !== undefined ? last[T[i]] : -1;
            i += m - Math.min(k, j + 1);
            k = m - 1;
        }
    }

    return -1;
}

function searchKeywords(text, keywords) {
    const foundKeywords = [];
    
    for (let keyword of keywords) {
        if (keywordSpotting(text, keyword) !== -1) {
            foundKeywords.push(keyword);
        }
    }
    
    return foundKeywords;
}

function cleanText(text) {
    text = text.toLowerCase();
    text = text.replace(/[^\w\s]/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

module.exports = {
    keywordList,
    searchKeywords,
    cleanText
};
