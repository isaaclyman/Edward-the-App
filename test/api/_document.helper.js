import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addDocument = async (app, name) => {
  const document = {
    guid: uuid(),
    name
  }

  await (
    app.post(route('document/add'))
    .send(document)
  )

  return document
}

export const checkDocuments = (t, app, expectFn) => {
  return wrapTest(t,
    app.get(route('documents'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}
