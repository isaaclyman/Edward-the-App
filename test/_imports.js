import { app as server, sequelize, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import {
  createTestUser,
  deleteTestUser,
  makeTestUserPremium,
  route,
  stubRecaptcha,
  user,
  wrapTest
} from './_util'
import uuid from 'uuid/v1'

const app = request(server)
const getPersistentAgent = () => request.agent(server)
const boundCreateTestUser = async (overrideApp) => {
  await createTestUser(sequelize)
  return (
    (overrideApp || app).post(route('user/login'))
    .send(user)
    .expect(200)
    .then(() => {
      return user
    })
  )
}
const boundDeleteTestUser = deleteTestUser.bind(null, sequelize)
const boundMakeTestUserPremium = makeTestUserPremium.bind(null, sequelize)

export {
  app,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserPremium as makeTestUserPremium,
  getPersistentAgent,
  route,
  server,
  sequelize,
  serverReady,
  stubRecaptcha,
  test,
  user,
  uuid,
  wrapTest
}
