require('./setUp')
const util = require('../../test/_util')
const sequelize = require('../../db')
const guid = require('uuid/v1')

const docId = guid()
let userId

sequelize.query(`
    SELECT id FROM users WHERE email = '${util.user.email}'
`, { type: sequelize.QueryTypes.SELECT }).then(([{ id }]) => {
    userId = id
    const query = `
    INSERT INTO documents (guid, name, "createdAt", "updatedAt", "userId")
    VALUES ('${docId}', 'test', current_timestamp, current_timestamp, ${userId})
    `
    return sequelize.query(query, { type: sequelize.QueryTypes.INSERT })
}).then(() => {
    const query = `
    INSERT INTO document_orders ("order", "createdAt", "updatedAt", "userId")
    VALUES (ARRAY['${docId}'::uuid], current_timestamp, current_timestamp, ${userId})
    `
    return sequelize.query(query, { type: sequelize.QueryTypes.INSERT })
}).then(() => {
    process.exit()
}, err => {
    console.error(err)
    process.exit(1)
})
