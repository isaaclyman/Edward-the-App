import { app, server, knex } from './_imports'

test('express app was created', () => {
  expect(server).toBeTruthy()
})

test('serves landing page', () => {
  return (
    app.get('/')
    .expect(200)
    .expect(/<title>Edward/)
    .expect(/<body>/)
  )
})

test('connects to database', done => {
  return knex.raw('SELECT 1 AS test').then(
    () => {},
    err => done.fail(err)
  );
})

test('serves static file', () => {
  return (
    app.get('/public/index.css')
    .expect(200)
    .expect(/font-family/)
  )
})
