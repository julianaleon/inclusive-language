const terms = require('./prohibittedTerms');
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log.info('Yay, the app was loaded!')

  const regex = RegExp('blacklist');
  var hasProhibittedTerm = false;

  app.on(['issues.opened', 'issues.edited'], async context => {
    app.log.info(context);
    const issueComment = context.issue({ body: 'Thanks for the issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async context => {
        console.log(
			context.payload.pull_request.body,
			'****** what is going on ******',
		);

    	const owner = context.payload.repository.owner.login;
    	const repo = context.payload.repository.name;
        const pull_number = context.payload.number;

    	console.log(await context.pullRequests(), 'please work with await');

    	const files = await context.pullRequests().listFiles({
    		owner,
    		repo,
            pull_number
    	});

		console.log(files.data[0], '******* buuuuuuuum ******* ');

        const checkCommit = files.data[0].patch.split('\n');
		const onlyAddedLines = line => {
			return line.startsWith('+');
		};
		const removeFirstPlus = line => {
			return line.substring(1);
		};
		const extractBadWords = (ExtractedBadWordsArray, line) => {
			for (const badWord of terms) {
				if (line.includes(badWord)) {
					ExtractedBadWordsArray.push({
						word: badWord,
						line: line,
						index: line.indexOf(badWord),
						status: true,
						count: ExtractedBadWordsArray.length,
					});
				}
			}
			return ExtractedBadWordsArray;
		};

		const result = checkCommit
			.filter(onlyAddedLines)
			.map(removeFirstPlus)
			.reduce(extractBadWords, []);

		const wordsFound = result.map(function(el) {
			return el.word;
		});

		const linesFound = result.map(function(el) {
			return el.line;
		});

		const isUnfriendlyComment = context.issue({
			body: `💔 This PR contains some non inclusive or unfriendly terms.
			The following words were found: ${wordsFound}
			These words were found on the following lines: ${linesFound}`,
		});

		if (result[0].status) {
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


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
