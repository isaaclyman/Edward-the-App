const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getDocId = utilities.getDocId

const updateToolContent = function (db, userId, docGuid, tool) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  // Upsert the tool content
  return utilities.upsert(db.knex, 'tool_content', {
    where: {
      guid: tool.guid,
      document_id: docId(),
      user_id: userId
    },
    insert: ts(db.knex, {
      archived: tool.archived,
      content: tool.content,
      date: tool.date,
      guid: tool.guid,
      tool_name: tool.name,
      user_id: userId,
      document_id: docId()
    }),
    getUpdate: dbTool => {
      const update = {
        archived: tool.archived,
        // Only update content if it has changed
        content: !isEqual(dbTool.content, tool.content) ? tool.content : undefined
        // Never update tool name or date
      }

      return ts(db.knex, update, true)
    }
  })
}

const getToolContentList = function (db, userId, docGuid) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return db.knex('tool_content').where({
    document_id: docId(),
    user_id: userId
  }).select('guid', 'tool_name', 'archived', 'created_at')
}

const getToolContent = function (db, userId, docGuid, toolName, toolGuids) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return db.knex('tool_content').where({
    tool_name: toolName,
    document_id: docId(),
    user_id: userId
  }).whereIn('guid', toolGuids).select()
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, toolGuid }
  app.post(route('tool-content/delete'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const docGuid = req.body.documentGuid
    const toolGuid = req.body.toolGuid

    const docId = () => getDocId(db.knex, userId, docGuid)

    return db.knex('tool_content').where({
      guid: toolGuid,
      document_id: docId(),
      user_id: userId
    }).del().then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, tool: {
  //   guid, name, content, archived, date
  // } }
  app.post(route('tool-content/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { documentGuid, tool } = req.body

    updateToolContent(db, userId, documentGuid, tool).then(() => {
      res.status(200).send(`Tool content for "${tool.name}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET (list of all tool contents)
  app.get(route('tool-content/list/:documentGuid'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentGuid = req.params.documentGuid

    getToolContentList(db, userId, documentGuid).then(toolContentList => {
      res.status(200).send(toolContentList)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, toolName, guids: uuid[] }
  // (get a tool's contents that match a list of guids)
  app.get(route('tool-content/by-guids'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentGuid = req.body.documentGuid
    const toolName = req.body.toolName
    const guids = req.body.guids

    getToolContent(db, userId, documentGuid, toolName, guids).then(toolContents => {
      res.status(200).send(toolContents)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { updateToolContent, registerApis }
