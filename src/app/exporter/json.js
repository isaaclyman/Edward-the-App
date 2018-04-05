import FileSaver from 'file-saver'

export const backupToJsonFile = (title, backup) => {
  return new Promise((resolve) => {
    const json = JSON.stringify(backup)
    const blob = new Blob([json], { type: 'application/json' })
    const today = new Date()
    const date = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`

    if (window && window._integration) {
      window._pdfSuccess = true
      return resolve()
    }

    FileSaver.saveAs(blob, `${title}--${date}.json`)
    resolve()
  })
}

export const jsonFileToBackup = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const json = reader.result
        resolve(JSON.parse(json))
      } catch (e) {
        reject(e)
      }
    }
    reader.readAsText(file)
  })
}
