import { app as server, sequelize, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import {
  addDocument,
  addTopic,
  createTestUser,
  deleteTestUser,
  makeTestUserPremium,
  stubRecaptcha,
  wrapTest
} from './_util'
import uuid from 'uuid/v1'

const app = request(server)
const getPersistentAgent = () => request.agent(server)
const boundCreateTestUser = createTestUser.bind(null, app)
const boundDeleteTestUser = deleteTestUser.bind(null, sequelize)
const boundMakeTestUserPremium = makeTestUserPremium.bind(null, sequelize)

export {
  addDocument,
  addTopic,
  app,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserPremium as makeTestUserPremium,
  getPersistentAgent,
  server,
  sequelize,
  serverReady,
  stubRecaptcha,
  test,
  uuid,
  wrapTest
}