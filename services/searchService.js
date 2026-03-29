const { details, rules } = require("../data/data");

const keywordScore = 1;
const HostelementScore = 2;
const AdjacentelementScore = 2;
const exposureScore = 1;

const normalize = (str) => (str || "").toLowerCase();

const getWords = (query) =>
    normalize(query).split(/\s+/).filter(Boolean);

function fuzzyMatch(a, b) {
    if (a.length === 0) return b.length === 0 ? 1.0 : 0.0;
    if (b.length === 0) return a.length === 0 ? 1.0 : 0.0;
    a = normalize(a);
    b = normalize(b);
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            let cost = (b[i - 1] === a[j - 1]) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
            if (i > 1 && j > 1 && b[i - 1] === a[j - 2] && b[i - 2] === a[j - 1]) {
                matrix[i][j] = Math.min(
                    matrix[i][j],
                    matrix[i - 2][j - 2] + cost
                );
            }
        }
    }
    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    const similarityScore = (maxLength - distance) / maxLength;
    return similarityScore >= 0.75; // Threshold for fuzzy match
}

function getTextScore(detail, words) {
    let score = 0;
    const allWords = (detail.title + " " + detail.tags.join(" ") + " " + detail.description)
        .toLowerCase()
        .split(/\s+/);
    words.forEach((queryWord) => {
        for (let textWord of allWords) {
            if (fuzzyMatch(queryWord, textWord)) {
                score += keywordScore;
                break;
            }
        }
    });
    return score;
}

function getContextScore(rule, input) {
    let score = 0;
    let explanationParts = [];
    if (input.host_element && normalize(rule.host_element) === normalize(input.host_element)) {
        score += HostelementScore;
        explanationParts.push(`Host Element equal to: ${input.host_element}`);
    }
    if (input.adjacent_element && normalize(rule.adjacent_element) === normalize(input.adjacent_element)) {
        score += AdjacentelementScore;
        explanationParts.push(
            `Adjacent Element equal to : ${input.adjacent_element}`
        );
    }
    if (input.exposure && normalize(rule.exposure) === normalize(input.exposure)) {
        score += exposureScore;
        explanationParts.push(`Exposure equal to : ${input.exposure}`);
    }
    return {
        score,
        explanation: explanationParts.join(" | "),
    };
}

function searchService(input) {
    const { query, host_element, adjacent_element, exposure } = input;
    const words = query ? getWords(query) : [];
    let results = [];
    details.forEach((detail) => {
        const rule = rules.find(
            (r) => r.detail_id === detail.id
        );
        let textScore = 0;
        let contextScore = 0;
        let explanationParts = [];
        if (words.length) {
            textScore = getTextScore(detail, words);
            if (textScore > 0) {
                explanationParts.push(`Matched query : ${query}`);
            }
        }
        if (rule) {
            const context = getContextScore(rule, { host_element, adjacent_element, exposure, });
            contextScore = context.score;
            if (context.explanation) {
                explanationParts.push(context.explanation);
            }
        }
        const totalScore = textScore + contextScore;
        if (totalScore > 0) {
            results.push({
                detail_id: rule.detail_id,
                title: detail.title,
                score: totalScore,
                explanation: explanationParts.join(" | "),
            });
        }
    });
    results.sort((a, b) => b.score - a.score);
    return { results: results.slice(0, 5) };
}

module.exports = searchService;