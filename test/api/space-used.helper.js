import {
  createTestDocument,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  stubRecaptcha,
  test
} from '../_imports'
import { getUsersOverLimit } from '../../api/space-used.helper'

stubRecaptcha(test)

test('get users who are using any space', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await createTestUser(app)
  await makeTestUserPremium()
  await createTestDocument()

  return getUsersOverLimit('PREMIUM', 1).then(users => {
    t.true(users.length > 0)
  })
})
