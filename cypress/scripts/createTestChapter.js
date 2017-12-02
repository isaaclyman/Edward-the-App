require('./setUp')
const util = require('../../test/_util')
const sequelize = require('../../db')
const guid = require('uuid/v1')

const chapId = guid()
let docId, docGuid
let userId

sequelize.query(`
    SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1
`, { type: sequelize.QueryTypes.SELECT }
).then(([{ id }]) => {
    userId = id
    const query = `
    SELECT id, guid FROM documents WHERE "userId" = ${userId} LIMIT 1
    `
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT }).then(([{ id, guid }]) => {
        docId = id
        docGuid = guid
    })
}).then(() => {
    const query = `
    INSERT INTO chapters (archived, content, guid, title, "createdAt", "updatedAt", "userId", "documentId")
    VALUES (false, NULL, '${chapId}', 'test', current_timestamp, current_timestamp, ${userId}, ${docId})
    `
    return sequelize.query(query, { type: sequelize.QueryTypes.INSERT })
}).then(() => {
    const query = `
    INSERT INTO chapter_orders ("ownerGuid", "order", "createdAt", "updatedAt", "userId")
    VALUES ('${docGuid}', ARRAY['${chapId}'::uuid], current_timestamp, current_timestamp, ${userId})
    `
    return sequelize.query(query, { type: sequelize.QueryTypes.INSERT })
}).then(() => {
    process.exit()
}, err => {
    console.error(err)
    process.exit(1)
})
