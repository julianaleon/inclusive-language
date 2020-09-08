/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log.info('Yay, the app was loaded!')

  app.on('issues.opened, issues.edited', async context => {
    app.log.info(context);
    const issueComment = context.issue({ body: 'Thanks for the issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('pull_request.opened, pull_request.edited', async context => {
      const prComment = context.issue({ body: 'Responding to PR!' })
      return context.github.issues.createComment(prComment)
  })


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
