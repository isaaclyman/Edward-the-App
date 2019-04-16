const createAccountType = function (name, displayName, description) {
  return { name: name, displayName: displayName, description: description }
}

const accountTypes = {
  DEMO: createAccountType('DEMO', 'Demo Account',
    'This is a demo. Your data is not stored and will be lost if you refresh the page or close this tab.'),
  LIMITED: createAccountType('LIMITED', 'Dreamer Account',
    'All data is stored insecurely on your computer\'s hard drive and may be lost if your browsing data is cleared.\
    Your maximum storage limit is probably 5MB (about 2,500 pages).'),
  PREMIUM: createAccountType('PREMIUM', 'Author Account',
    'Your data is stored on our servers. Your storage limit is 20MB (about 10,000 pages).'),
  GOLD: createAccountType('GOLD', 'Bestseller Account',
    'Your data is stored on our servers. Your storage limit is 250MB (about 125,000 pages).'),
  ADMIN: createAccountType('ADMIN', 'Admin Account', 'You know who you are.')
}

module.exports = accountTypes
