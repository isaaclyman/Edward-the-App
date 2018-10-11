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

export const checkDocuments = (app, expectFn) => {
  return wrapTest(
    app.get(route('documents'))
    .expect(200)
    .expect(response => {
      expect(Array.isArray(response.body)).toBeTruthy()
      expectFn(response.body)
    })
  )
}
