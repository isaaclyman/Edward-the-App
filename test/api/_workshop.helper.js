import {
  app,
  route,
  uuid
} from '../_imports'
import writingWorkshops from '../../models/writingWorkshop'

const guids = ['8104b1fb-c177-4ca1-b995-a75dcbe6911c', '2ae71a48-7873-4316-bf18-d9ee0e461799']

export const workshops = [{
  guid: guids[0],
  workshopName: writingWorkshops.CHARACTER_WORKSHOP.name,
  content: { ops: [{ insert: '1' }] },
  title: 'Workshop 1',
  order: 0,
  archived: false,
  date: new Date()
}, {
  guid: guids[1],
  workshopName: writingWorkshops.CHARACTER_WORKSHOP.name,
  content: { ops: [{ insert: '2' }] },
  title: 'Workshop 2',
  order: 1,
  archived: false,
  date: new Date()
}]

export async function addWorkshops(app, docGuid) {
  await (
    app.post(route(`workshop-content/update`))
    .send({ documentGuid: docGuid, workshops: workshops })
    .expect(200)
  )

  return workshops
}
