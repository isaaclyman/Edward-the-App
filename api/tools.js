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
      order: tool.order,
      title: tool.title,
      tool_name: tool.toolName,
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
  }).select({
    archived: 'archived',
    createdDate: 'created_at',
    guid: 'guid',
    toolName: 'tool_name'
  })
}

const getToolContent = function (db, userId, docGuid, toolName, toolGuids) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return db.knex('tool_content').where({
    tool_name: toolName,
    document_id: docId(),
    user_id: userId
  }).whereIn('guid', toolGuids).select({
    archived: 'archived',
    content: 'content',
    createdDate: 'created_at',
    date: 'date',
    guid: 'guid',
    order: 'order',
    title: 'title',
    toolName: 'tool_name'
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, guid }
  app.post(route('tool-content/delete'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const docGuid = req.body.documentGuid
    const guid = req.body.guid

    const docId = () => getDocId(db.knex, userId, docGuid)

    return db.knex('tool_content').where({
      guid: guid,
      document_id: docId(),
      user_id: userId
    }).del().then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, tools: [{
  //   guid, title, toolName, content, archived, date
  // }] }
  app.post(route('tool-content/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { documentGuid, tools } = req.body

    Promise.all(tools.map(tool => updateToolContent(db, userId, documentGuid, tool))).then(() => {
      res.status(200).send(`Tool contents updated.`)
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
  app.post(route('tool-content/by-guids'), isPremiumUser, (req, res, next) => {
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
