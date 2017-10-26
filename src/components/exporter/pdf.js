import pdfMake from 'pdfmake/build/pdfmake'
require('imports-loader?this=>window!pdfmake/build/vfs_fonts.js')

export const chaptersToPdf = (title, chapters) => {
  return new Promise((resolve) => {
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
          fontSize: 18
        },
        title: {
          fontSize: 40
        }
      }
    }

    const contentArrays = chapters.map(chapter => {
      const ops = (chapter.content && chapter.content.ops) || []
      const content = ops.map(op => {
        const text = op.insert
        const style = ['body']

        return { text, style }
      })

      content.unshift({
        text: chapter.title,
        style: 'chapterHeading',
        pageBreak: 'before'
      })

      return content
    })

    definition.content = definition.content.concat(...contentArrays)

    pdfMake.createPdf(definition).download(`${title}.pdf`)
    resolve()
  })
}
