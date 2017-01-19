/*
Rules:
 1. ignore first line if it starts with '#'
 2. take content until you meet '**' or '##' or '###' at start of line
 3. take no more than 4 paragraphs of text
 4. transform string like "Here's a few tips:" on last line to "Here's a few tips..."
*/
export default function getShortDescription(fullContent) {
	let lines = fullContent.split('\n');

	removeFirstLineIfHeader(lines);
	removeFirstLineIfEmpty(lines);

	removeLinesAfterStars(lines);
	removeLastLineIfEmpty(lines);

	removeLinesAfterNParagraphs(lines, 4);
	removeLastLineIfEmpty(lines);

	replaceLastSymbolOfLastLine(lines, ':', '...');

	return lines.join('\n');
}

function removeFirstLineIfHeader(lines) {
	if (lines[0].indexOf('#') === 0) {
		lines.splice(0, 1);
	}
}

function removeFirstLineIfEmpty(lines) {
	if (lines[0] === '') {
		lines.splice(0, 1);
	}
}

function removeLinesAfterStars(lines) {
	let breakIndex = lines.findIndex(l => l.indexOf('**') === 0 || l.indexOf('##') === 0);
	removeLinesAfterIndex(lines, breakIndex);
}

function removeLinesAfterIndex(lines, index) {
	if (index !== -1) {
		lines.splice(index, lines.length - index);
	}
}

function removeLastLineIfEmpty(lines) {
	if (lines.length && lines[lines.length - 1] === '') {
		lines.splice(lines.length - 1, 1);
	}
}

function removeLinesAfterNParagraphs(lines, n) {
	let p = 0, breakIndex = -1;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i] !== '') {
			p++;
		}
		if (p > n) {
			breakIndex = i;
			break;
		}
	}
	removeLinesAfterIndex(lines, breakIndex);
}

function replaceLastSymbolOfLastLine(lines, symbolToReplace, replaceToSymbols) {
	if (lines.length) {
		var lastLine = lines[lines.length - 1];
		if (lastLine.length && lastLine[lastLine.length - 1] === symbolToReplace) {
			lastLine = lastLine.substring(0, lastLine.length - 1) + replaceToSymbols;
			lines[lines.length - 1] = lastLine;
		}
	}
}