import accountTypes from '../models/accountType'
import { app as server, knex, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import {
  createTestChapter,
  createTestDocument,
  createTestUser,
  deleteTestUser,
  makeTestUserAdmin,
  makeTestUserDemo,
  makeTestUserPremium,
  route,
  setTestUserPaymentDueDate,
  setTestUserResetKey,
  setTestUserStripeId,
  setTestUserVerifyKey,
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
const boundMakeTestUserAdmin = () => makeTestUserAdmin(knex)
const boundMakeTestUserDemo = () => makeTestUserDemo(knex)
const boundMakeTestUserPremium = () => makeTestUserPremium(knex)
const boundCreateTestDocument = () => createTestDocument(knex)
const boundCreateTestChapter = () => createTestChapter(knex)
const boundSetTestUserPaymentDueDate = daysFromNow => setTestUserPaymentDueDate(knex, daysFromNow)
const boundSetTestUserResetKey = () => setTestUserResetKey(knex)
const boundSetTestUserStripeId = () => setTestUserStripeId(knex)
const boundSetTestUserVerifyKey = () => setTestUserVerifyKey(knex)

export {
  accountTypes,
  app,
  boundCreateTestChapter as createTestChapter,
  boundCreateTestDocument as createTestDocument,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserAdmin as makeTestUserAdmin,
  boundMakeTestUserDemo as makeTestUserDemo,
  boundMakeTestUserPremium as makeTestUserPremium,
  boundSetTestUserPaymentDueDate as setTestUserPaymentDueDate,
  boundSetTestUserResetKey as setTestUserResetKey,
  boundSetTestUserStripeId as setTestUserStripeId,
  boundSetTestUserVerifyKey as setTestUserVerifyKey,
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
