import accountTypes from '../models/accountType'
import { app as server, knex, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import {
  alternateUser,
  createTestChapter,
  createTestDocument,
  createTestUser,
  createAlternateTestUser,
  deleteTestUser,
  getDocuments,
  getTestUserId,
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
const boundCreateAlternateTestUser = () => createAlternateTestUser(knex)
const boundDeleteTestUser = (email, deleteContentOnly = false) => deleteTestUser(knex, email, deleteContentOnly)
const boundGetDocuments = (email) => getDocuments(knex, email)
const boundGetTestUserId = () => getTestUserId(knex)
const boundMakeTestUserAdmin = () => makeTestUserAdmin(knex)
const boundMakeTestUserDemo = () => makeTestUserDemo(knex)
const boundMakeTestUserPremium = () => makeTestUserPremium(knex)
const boundCreateTestDocument = (overrideEmail) => createTestDocument(knex, overrideEmail)
const boundCreateTestChapter = () => createTestChapter(knex)
const boundSetTestUserPaymentDueDate = daysFromNow => setTestUserPaymentDueDate(knex, daysFromNow)
const boundSetTestUserResetKey = () => setTestUserResetKey(knex)
const boundSetTestUserStripeId = () => setTestUserStripeId(knex)
const boundSetTestUserVerifyKey = () => setTestUserVerifyKey(knex)

export {
  accountTypes,
  alternateUser,
  app,
  boundCreateTestChapter as createTestChapter,
  boundCreateTestDocument as createTestDocument,
  boundCreateTestUser as createTestUser,
  boundCreateAlternateTestUser as createAlternateTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundGetDocuments as getDocuments,
  boundMakeTestUserAdmin as makeTestUserAdmin,
  boundMakeTestUserDemo as makeTestUserDemo,
  boundMakeTestUserPremium as makeTestUserPremium,
  boundSetTestUserPaymentDueDate as setTestUserPaymentDueDate,
  boundSetTestUserResetKey as setTestUserResetKey,
  boundSetTestUserStripeId as setTestUserStripeId,
  boundSetTestUserVerifyKey as setTestUserVerifyKey,
  boundGetTestUserId as getTestUserId,
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
