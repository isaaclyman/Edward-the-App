import {
  createTestChapter,
  createTestDocument,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  stubRecaptcha
} from '../_imports'
import { getUsersOverLimit } from '../../api/space-used.helper'

stubRecaptcha(test)

test('get users who are using any space', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await createTestUser(app)
  await makeTestUserPremium()
  await createTestDocument()
  await createTestChapter()

  return getUsersOverLimit('PREMIUM', 1).then(users => {
    expect(users.length > 0).toBe(true)
  });
})
