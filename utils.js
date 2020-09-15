const prohibitedTerms = require('./prohibitedTerms');

function formatRow(term) {
	let status = `:warning:`
	if (prohibitedTerms[term.word].severity === 'severe') {
		status = `:stop_sign:`
	}

    // Get alternative term
    const alternative = prohibitedTerms[term.word].alternative;

	return `| ${status} | ${term.word} | ${alternative} | ${term.line}|`;
}

function formatFileTable(result) {
	// Don't post anything for files that do not contain prohibited terms
	if (result.length === 0) {
		return '';
	}

	const tableHeader = `| Severity | Term | Alternative | Included in line |\n| :---: | :--- | :--- | :--- |\n`;
	let fileName = result.filename;
	let header = `### File: ${fileName}\n`;

    let rows = result.map(el => formatRow(el));

	return `${header}${tableHeader}${rows.join('\n')}\n`;
}

// Formats comment that will be posted on the PR
function formatComment(checkRes) {
	const header = `# Inclusive Language Report\n This PR contains some terms that are considered problematic, you should try using an alternative term instead for more inclusive language. [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)\n`;

	let sections = checkRes.map(result => formatFileTable(result));

	return `${header}${sections.join('\n')}`
}

module.exports = {
    formatComment,
    formatFileTable
}
