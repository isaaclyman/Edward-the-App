import { app, server, knex, test, wrapTest } from './_imports'

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
  return knex.raw('SELECT 1 AS test').then(
    () => t.pass(),
    err => t.fail(err)
  )
})

test('serves static file', t => {
  return wrapTest(t,
    app.get('/static/index.css')
    .expect(200)
    .expect(/font-family/)
  )
})
