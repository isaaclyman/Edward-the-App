import { app as server, sequelize } from '../server'
import request from 'supertest'
import test from 'ava'
import wrapTest from './_util'

const app = request(server)

test('express app was created', t => {
  t.truthy(server)
})

test('serves landing page', t => {
  return wrapTest(t,
    app.get('/')
    .expect(200)
    .expect(/<title>Edward/)
    .expect(/<body>/)
  )
})

test('connects to database', t => {
  return sequelize.authenticate().then(
    () => t.pass(),
    () => t.fail()
  )
})

test('serves static file', t => {
  return wrapTest(t,
    app.get('/static/index.css')
    .expect(200)
    .expect(/font-family/)
  )
})
