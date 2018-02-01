const stubbed = (response) => () => Promise.resolve(response || null)

class DemoStorageApi {
  // DOCUMENTS

  addDocument = stubbed()
  getAllDocuments = stubbed([])
  deleteDocument = stubbed()
  updateDocument = stubbed()

  // ARRANGE

  arrangeChapters = stubbed()
  arrangePlans = stubbed()
  arrangeSections = stubbed()
  arrangeTopics = stubbed()

  // DELETE

  deleteChapter = stubbed()
  deletePlan = stubbed()
  deleteSection = stubbed()
  deleteTopic = stubbed()

  // GET

  getAllChapters = stubbed([])
  getAllPlans = stubbed([])
  getAllTopics = stubbed([])

  // UPDATE

  updateChapter = stubbed()
  updatePlan = stubbed()
  updateSection = stubbed()
  updateTopic = stubbed()

  saveAllContent = stubbed()
}

export default DemoStorageApi
