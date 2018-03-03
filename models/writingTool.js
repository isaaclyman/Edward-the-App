const createTool = function (name, displayName, description) {
  return { name: name, displayName: displayName, description: description }
}

const tools = {
  FREE_WRITE: createTool('FREE_WRITE', 'Free Writing',
    'Warm up with a brief writing session. No prompts, no rules. Limit by time or word count.'),
  NOVEL_QUICKSTART: createTool('NOVEL_QUICKSTART', 'Novel Quickstart',
    'Answer a few basic prompts to get ideas flowing for your novel.'),
  CHARACTER_WORKSHOP: createTool('CHARACTER_WORKSHOP', 'Character Workshop',
    'Get to know your characters by responding to curated prompts.'),
  SETTING_WORKSHOP: createTool('SETTING_WORKSHOP', 'Setting Workshop',
    'Build a stronger sense of place by exploring the setting of your novel.'),
  PLOT_WORKSHOP: createTool('PLOT_WORKSHOP', 'Plot Workshop',
    'Figure out what happens next by responding to curated prompts.'),
  WRITERS_UNBLOCK: createTool('WRITERS_UNBLOCK', 'Writer\'s Unblock',
    'Got writer\'s block? Get moving again by doing a random word incorporation exercise.')
}

module.exports = tools
