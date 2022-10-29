const createWorkshop = function (name, displayName, description, route, available) {
  return { name: name, displayName: displayName, description: description, route: route, available: available }
}

const workshops = {
  FREE_WRITE: createWorkshop('FREE_WRITE', 'Free Writing',
    'Warm up with a brief writing session. No prompts, no rules. Limit by time or word count.',
    '/workshop/free-write', true),
  NOVEL_QUICKSTART: createWorkshop('NOVEL_QUICKSTART', 'Novel Quickstart',
    'Answer a few basic prompts to get ideas flowing for your novel.',
    '/workshop/novel-quickstart', true),
  WRITERS_UNBLOCK: createWorkshop('WRITERS_UNBLOCK', 'Writer\'s Unblock',
    'Got writer\'s block? Get moving again by doing a word incorporation exercise.',
    '/workshop/unblock', true),
  PLOT_WORKSHOP: createWorkshop('PLOT_WORKSHOP', 'Plot & Character Workshop',
    'Figure out what happens next and develop your characters by responding to curated prompts.',
    '/workshop/plot', true),
  SETTING_WORKSHOP: createWorkshop('SETTING_WORKSHOP', 'Setting Workshop',
    'Build a stronger sense of place by exploring the setting of your novel.',
    '/workshop/setting', true)
}

module.exports = workshops
