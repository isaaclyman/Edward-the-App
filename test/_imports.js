import { app as server, sequelize, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import { createTestUser, deleteTestUser, stubRecaptcha, wrapTest } from './_util'

const app = request(server)
const getPersistentAgent = () => request.agent(server)
const boundCreateTestUser = createTestUser.bind(null, app)
const boundDeleteTestUser = deleteTestUser.bind(null, sequelize)

export {
  app,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  getPersistentAgent,
  server,
  sequelize,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
}
