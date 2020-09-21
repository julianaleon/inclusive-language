const prohibitedTerms = require('./prohibitedTerms');
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

        let checkCommit = index => {
            return files.data[index].patch.split('\n');
        }

        // Only look for new code additions to the file
		let onlyAddedLines = line => {
			return line.startsWith('+');
		};

		let removeFirstPlus = line => {
			return line.substring(1);
		};

        // Determines if term from the prohibitedTerms list is included in the new file additions
		let extractTermsFromFile = (extractedTerms, line) => {
			for (const term of Object.keys(prohibitedTerms)) {
				if (line.toLowerCase().includes(term)) {
					extractedTerms.push({
						word: term,
						line: line,
						index: line.indexOf(term)
					});
				}
			}
            return extractedTerms;
		};

        // Iterate over each file changed in PR
        files.data.forEach((file, i) => {
            // console.log(
            //     files.data[i],
            //     '******** File',i,'data ********'
            // );

            let result = checkCommit(i)
    			.filter(onlyAddedLines)
    			.map(removeFirstPlus)
    			.reduce(extractTermsFromFile, []);

            // If prohibited terms found in file, add the results to the total array
            if (result) {
                // Adds the name of the file the extracted term was found in
                result.filename = files.data[i].filename;
                allExtractedTerms.push(result);
            };
        });

        // Generate formatted comment for PR response
        const guidanceComment = formatComment(allExtractedTerms);

		if (allExtractedTerms.length > 0 && !context.isBot) {
			context.github.issues.createComment(
                context.issue({body: guidanceComment})
            );
		};
  })
}
