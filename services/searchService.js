const { details, rules } = require("../data/data");

const keywordScore = 1;
const HostelementScore = 2;
const AdjacentelementScore = 2;
const exposureScore = 1;

const normalize = (str) => (str || "").toLowerCase();

const getWords = (query) =>
    normalize(query).split(/\s+/).filter(Boolean);

function fuzzyMatch(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function getTextScore(detail, words) {
    let score = 0;
    const allWords = (detail.title + " " + detail.tags.join(" ") + " " + detail.description)
        .toLowerCase()
        .split(/\s+/);
    words.forEach((queryWord) => {
        for (let textWord of allWords) {
            if (textWord === queryWord) { //perfect match
                score += keywordScore;
                break;
            }
            if (fuzzyMatch(queryWord, textWord) <= 2) {// fuzzy match
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