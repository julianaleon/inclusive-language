/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log.info('Yay, the app was loaded!')

  const regex = RegExp('blacklist');
  var hasProhibittedTerm = false;

  app.on(['issues.opened', 'issues.edited'], async context => {
    app.log.info(context);
    const issueComment = context.issue({ body: 'Thanks for the issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async context => {
      hasProhibittedTerm = regex.test(context.payload.pull_request.body);
      // const prComment = context.issue({ body: 'Responding to PR!' })
      // return context.github.issues.createComment(prComment)

      // if (hasProhibittedTerm && !context.isBot) {
      if (hasProhibittedTerm) {
          const params = context.issue({body: 'Hey! blacklist is considered problematic language, maybe you could try using replacement instead to use more inclusive language? [Here\'s why.](https://confluence.expedia.biz/pages/viewpage.action?pageId=1607388080)'});
          return context.github.issues.createComment(params);
      }
  })


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
