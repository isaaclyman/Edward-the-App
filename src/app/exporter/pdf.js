import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import FileSaver from 'file-saver'
import { getStyledArrayFromChapters } from '../../../utilities'

pdfMake.vfs = pdfFonts.pdfMake.vfs

export const chaptersToPdf = (title, chapters) => new Promise((resolve) => {
  const definition = {
    content: [{
      text: title,
      style: 'title',
    }],
    styles: {
      body: {
        fontSize: 12,
      },
      bold: {
        bold: true,
      },
      blockquote: {
        margin: [10, 10, 0, 10],
      },
      chapterHeading: {
        fontSize: 20,
        margin: [5, 10],
      },
      h1: {
        fontSize: 18,
      },
      h2: {
        fontSize: 16,
      },
      h3: {
        fontSize: 14,
      },
      italic: {
        italics: true,
      },
      strike: {
        decoration: 'lineThrough',
      },
      title: {
        fontSize: 40,
      },
      underline: {
        decoration: 'underline',
      },
    },
  }

  const splitContent = getStyledArrayFromChapters(chapters)

  let counter = 1
  splitContent.forEach((content) => {
    if (content.style.includes('ul')) {
      content.ul = [{ text: content.text }]
      counter = 1
      content.text = null
    } else if (content.style.includes('ol')) {
      content.ol = [{ text: content.text }]
      content.start = counter++
      content.text = null
    } else {
      counter = 1
    }
    return content
  })

  definition.content = definition.content.concat(...splitContent)

  pdfMake.createPdf(definition).getBlob((blob) => {
    if (window && window._integration) {
      window._pdfSuccess = true
      return resolve()
    }
    FileSaver.saveAs(blob, `${title}.pdf`)
    resolve()
  })
})
