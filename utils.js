function formatRow(term) {
	let status = `:warning:`
	// if (term.level === 'severe') {
	// 	status = `:stop_sign:`
	// }

    // find alternative term
    const alternative = 'test';
    console.log('row term:',term);

	return `| ${status} | ${term.word} | ${alternative} |`;
}

function formatFileTable(res) {
	// Don't post anything for files that do not contain prohibitted terms
	if (res.length === 0) {
		return '';
	}

	// let filePath = path.relative(process.cwd(), res.filePath)
	// let header = `### ${filePath}\n`
	let tableHeader = `| Level | Word | Alternative |\n| :---: | :---: | :--- |\n`;

    let rows = res.map(el => formatRow(el));

	return `${tableHeader}${rows.join('\n')}\n`;
}

// Formats comment that will be posted on the PR
function formatComment(checkRes) {
	let header = `# Inclusive Language Report\n This PR contains some words that are considered problematic, you should try using an alternative term instead for more inclusive language. [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)\n`;
	let success = `### :sparkles: :rocket: :sparkles: Nothing to Report :sparkles: :rocket: :sparkles:`;

	let sections = checkRes.map(res => formatFileTable(res));

	if (sections.every(section => section === '') || sections.length == 0) {
		return `${success}`
	} else {
		return `${header}${sections.join('\n')}`
	}

}

module.exports = {
    formatComment,
    formatFileTable
}
