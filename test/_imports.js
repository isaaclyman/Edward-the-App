import { app as server, sequelize, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import { stubRecaptcha, wrapTest } from './_util'

const app = request(server)
const getPersistentAgent = () => request.agent(server)

export {
  app,
  getPersistentAgent,
  server,
  sequelize,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
}
