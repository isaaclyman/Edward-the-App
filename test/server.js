import server from '../server'
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
