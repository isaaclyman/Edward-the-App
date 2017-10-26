import pdfMake from 'pdfmake/build/pdfmake'
import 'pdfmake/build/vfs_fonts'

export const chaptersToPdf = (title, chapters) => {
  const definition = {
    content: [{
      text: title,
      style: 'title'
    }],
    styles: {
      body: {
        fontSize: 12
      },
      chapterHeading: {
        fontSize: 25
      },
      title: {
        fontSize: 40
      }
    }
  }

  const contentArrays = chapters.map(chapter => {
    const ops = chapter.content.ops
    const content = ops.map(op => {
      const text = op.insert
      const style = ['body']

      return { text, style }
    })

    content.unshift({
      text: chapter.title,
      style: 'chapterHeading'
    })
  })

  const content = definition.content.concat(...contentArrays)
  definition.content = content

  pdfMake.createPdf(definition).download(`${title}.pdf`)
}
