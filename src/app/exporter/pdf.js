import pdfMake from 'pdfmake/build/pdfmake.min'
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
        bold: {
          bold: true
        },
        blockquote: {
          margin: [10, 10, 0, 10]
        },
        chapterHeading: {
          fontSize: 20,
          margin: [5, 10]
        },
        h1: {
          fontSize: 18
        },
        h2: {
          fontSize: 16
        },
        h3: {
          fontSize: 14
        },
        italic: {
          italics: true
        },
        strike: {
          decoration: 'lineThrough'
        },
        title: {
          fontSize: 40
        },
        underline: {
          decoration: 'underline'
        }
      }
    }

    const splitContent = []

    function getNewLine () {
      return {
        text: [],
        style: []
      }
    }

    function getNewSegment (text, style) {
      return {
        text: text || '',
        style: style || []
      }
    }

    for (const chapter of chapters) {
      splitContent.push({
        text: chapter.title,
        style: 'chapterHeading',
        pageBreak: 'before'
      })

      let currentLine = getNewLine()
      const ops = (chapter.content && chapter.content.ops) || []
      for (const op of ops) {
        const insert = op.insert
        const { styles, lineStyles } = getStyles(op.attributes)

        if (lineStyles.length) {
          currentLine.style.push(...lineStyles)
        }

        if (insert === '\n') {
          splitContent.push(currentLine)
          currentLine = getNewLine()
          continue
        }

        if (insert.includes('\n')) {
          const [first, ...lines] = insert.split('\n')
          if (first) {
            const segment = getNewSegment(first, styles)
            currentLine.text.push(segment)
          }

          splitContent.push(currentLine)
          currentLine = getNewLine()

          for (let ix = 0; ix < lines.length - 1; ix++) {
            const line = lines[ix]
            const segment = getNewSegment(line, styles)
            currentLine.text.push(segment)

            splitContent.push(currentLine)
            currentLine = getNewLine()
          }

          const last = lines[lines.length - 1]
          const segment = getNewSegment(last, styles)
          currentLine.text.push(segment)

          continue
        }

        const segment = getNewSegment(insert, styles)
        currentLine.text.push(segment)
      }
    }

    let counter = 1
    splitContent.forEach(content => {
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

    pdfMake.createPdf(definition).download(`${title}.pdf`)
    resolve()
  })
}

const listMap = {
  'bullet': 'ul',
  'ordered': 'ol'
}
function getStyles (attributes) {
  const styles = []
  const lineStyles = []

  if (!attributes) {
    return { styles, lineStyles }
  }

  for (const attr in attributes) {
    if (['bold', 'italic', 'underline', 'strike'].includes(attr)) {
      styles.push(attr)
      continue
    }

    if (attr === 'header') {
      lineStyles.push(`h${attributes[attr]}`)
      continue
    }

    if (attr === 'blockquote') {
      lineStyles.push('blockquote')
      continue
    }

    if (attr === 'list') {
      lineStyles.push(listMap[attributes[attr]])
      continue
    }
  }

  return { styles, lineStyles }
}
