import accountTypes from '../models/accountType'
import { app as server, knex, serverReady } from '../server'
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
  await createTestUser(knex)
  return (
    (overrideApp || app).post(route('user/login'))
    .send(user)
    .expect(200)
    .then(() => {
      return user
    })
  )
}
const boundDeleteTestUser = email => deleteTestUser(knex, email)
const boundMakeTestUserPremium = () => makeTestUserPremium(knex)

export {
  accountTypes,
  app,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserPremium as makeTestUserPremium,
  getPersistentAgent,
  route,
  server,
  knex,
  serverReady,
  stubRecaptcha,
  test,
  user,
  uuid,
  wrapTest
}
