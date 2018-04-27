const officegen = require('officegen')
const { getChapters } = require('./chapter')

const getOpts = function(attributes) {
  if (!attributes) {
    return {}
  }

  
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/word/${route}`

  // POST { guid, title }
  app.post(route('export'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { guid, title } = req.body
    const docx = officegen({
      type: 'docx',
      creator: 'Edward the App',
      title
    })

    getChapters(db, userId, guid).then(chapters => {
      const docJson = []
      docJson.push({
        type: 'text',
        val: title,
        opt: {
          font_size: 40
        }
      })
      
      for (const chapter of chapters) {
        docJson.push({
          type: 'pagebreak'
        }, [{
          type: 'text',
          val: chapter.title,
          opt: {
            font_size: 20
          }
        }])

        const ops = (chapter.content && chapter.content.ops) || []
        for (const op of ops) {
          const insert = op.insert
          const opt = getOpts(op.attributes)
        }
      }
    })
  })
}

module.exports = { registerApis }
