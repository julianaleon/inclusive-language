const prohibittedTerms = require('./prohibittedTerms');
const { Octokit } = require("@octokit/rest");
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log.info('App loaded!')

  const regex = RegExp('blacklist');
  var hasProhibittedTerm = false;

  const octokit = new Octokit({
      // auth: "secret123",
      userAgent: 'be-inclusive'
      // Needed for GitHub Enterprise
      // baseUrl: 'https://github.expedia.biz',
  });

  app.on(['issues.opened', 'issues.edited'], async context => {
    app.log.info(context);
    const issueComment = context.issue({ body: 'Thanks for the issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
        // console.log(
		// 	context.payload.pull_request.body,
		// 	'****** payload body ******',
		// );

    	const owner = context.payload.repository.owner.login;
    	const repo = context.payload.repository.name;
        const pull_number = context.payload.number;

        // Retrieve files from pull request
        const files = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number
        });

        const extractedTerms = [];

        var checkCommit = index => {
            return files.data[index].patch.split('\n');
        }
		var onlyAddedLines = line => {
			return line.startsWith('+');
		};
		var removeFirstPlus = line => {
			return line.substring(1);
		};
		var extractTermsFromFile = (extractedTerms, line) => {
			for (const term of prohibittedTerms) {
				if (line.includes(term)) {
					extractedTerms.push({
						word: term,
						line: line,
						index: line.indexOf(term),
						status: true,
						count: extractedTerms.length
					});
				}
			}
            return extractedTerms;
		};

        files.data.forEach((file, i) => {
            console.log(
                files.data[i],
                '******** File',i,'data ********'
            );
            checkCommit(i)
    			.filter(onlyAddedLines)
    			.map(removeFirstPlus)
    			.reduce(extractTermsFromFile, []);
        });

        const wordsFound = extractedTerms.map(function(el) {
			return el.word;
		});

		const linesFound = extractedTerms.map(function(el) {
			return el.line;
		});

		// const result = checkCommit
		// 	.filter(onlyAddedLines)
		// 	.map(removeFirstPlus)
		// 	.reduce(extractTerms, []);

		// const wordsFound = result.map(function(el) {
		// 	return el.word;
		// });
        //
		// const linesFound = result.map(function(el) {
		// 	return el.line;
		// });

		const isUnfriendlyComment = context.issue({
			body: `This PR contains some words that are considered problematic language, maybe you could try using an alternative term instead for more inclusive language? [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)
			The following terms were found: ${wordsFound}
			These terms were found on the following lines: ${linesFound}`,
		});

		if (extractedTerms.length > 0) {
			context.github.issues.createComment(isUnfriendlyComment);
		};

      // hasProhibittedTerm = regex.test(context.payload.pull_request.body);
      // // const prComment = context.issue({ body: 'Responding to PR!' })
      // // return context.github.issues.createComment(prComment)
      //
      // if (hasProhibittedTerm && !context.isBot) {
      //     const params = context.issue({body: 'Hey! blacklist is considered problematic language, maybe you could try using replacement instead to use more inclusive language? [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)'});
      //     return context.github.issues.createComment(params);
      // }
  })
}
