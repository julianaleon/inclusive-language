const prohibittedTerms = require('./prohibittedTerms');
const { Octokit } = require("@octokit/rest");
const { formatComment } = require("./utils");

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log.info('App loaded!')

  const octokit = new Octokit({
      // auth: "secret123",
      userAgent: 'be-inclusive'
  });

  app.on(['issues.opened'], async context => {
    app.log.info(context);
    const issueComment = context.issue({ body: 'Thanks for opening an issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on(['pull_request.opened', 'pull_request.synchronize'], async context => {
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

        const allExtractedTerms = [];

        var checkCommit = index => {
            return files.data[index].patch.split('\n');
        }

        // Only look for new code additions to the file
		var onlyAddedLines = line => {
			return line.startsWith('+');
		};

		var removeFirstPlus = line => {
			return line.substring(1);
		};

        // Determines if term from the prohibittedTerms list is included in the new file additions
		var extractTermsFromFile = (extractedTerms, line) => {
			for (const term of prohibittedTerms) {
				if (line.includes(term)) {
					extractedTerms.push({
						word: term,
						line: line,
						index: line.indexOf(term),
						count: extractedTerms.length
					});
				}
			}
            return extractedTerms;
		};

        // Iterate over each file changed in PR
        files.data.forEach((file, i) => {
            console.log(
                files.data[i],
                '******** File',i,'data ********'
            );

            var result = checkCommit(i)
    			.filter(onlyAddedLines)
    			.map(removeFirstPlus)
    			.reduce(extractTermsFromFile, []);

            console.log(result);

            // If prohibitted terms found in file, add the results to the total array
            if (result) {
                allExtractedTerms.push(result);
            };
        });

        // TODO: uncomment
        // const guidanceComment = formatComment(allExtractedTerms);

        var wordsFound = [];
        var linesFound = [];

        allExtractedTerms.forEach((result, i) => {
            wordsFound = wordsFound.concat(
                allExtractedTerms[i].map(function(el) {
                   return el.word;
                })
            );

            linesFound = linesFound.concat(
                allExtractedTerms[i].map(function(el) {
    			    return el.line;
                })
            );
        });

		const guidanceComment = context.issue({
			body: `# Inclusive Language Report\n This PR contains some words that are considered problematic, you should try using an alternative term instead for more inclusive language. [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)\n
			The following terms were found: ${wordsFound}
			These terms were found on the following lines: ${linesFound}`,
		});

		if (allExtractedTerms.length > 0 && !context.isBot) {
			// context.github.issues.createComment(
            //     context.issue({body: guidanceComment})
            // );
            context.github.issues.createComment(guidanceComment);
		};
  })
}
