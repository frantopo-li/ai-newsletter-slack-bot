# AI Newsletter Slack Bot

Internal Slack bot that enables the `/ai-newsletter` command. Anyone in the
workspace can run it from any channel to share an AI tool, tip, skill or use
case they found useful, so that finding doesn't get lost in conversations.

Running the command instantly opens a native Slack form with a team selector, a
rich text field (bold, lists, links) and the option to attach one or more files.
On submit, the bot posts a message in the `#ai-newsletter` channel with the
author mentioned, their team, the formatted content and the files listed, and in
parallel triggers a Slack Workflow that saves a copy of that information
(author, team, content, files and date) to a Google Sheets spreadsheet, to keep
a historical and processable record.
