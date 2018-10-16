// Complete an array of promises in order, each one waiting for the previous one to resolve
function orderPromises(promiseFns) {
  if (!Array.isArray(promiseFns) || (promiseFns.length && typeof promiseFns[0] !== 'function')) {
    throw new TypeError(`orderPromises expects an array of functions. Received: ${JSON.stringify(promiseFns)}`)
  }

  if (!promiseFns.length) {
    return Promise.resolve()
  }

  const promise = promiseFns[0]()

  if (!promise.then) {
    throw new TypeError(`A function in the array passed to orderPromises did not return a promise. Returned: ${JSON.stringify(promise)}`)
  }

  return promise.then(() => orderPromises(promiseFns.slice(1)))
}

// getNewLine, getNewSegment, getStyles, getStyledArrayFromChapters:
// From an array of Edward chapters, produce an array of Line objects.
// Line { text: string | Segment[], style: string | string[], pageBreak: undefined | 'before' }
// Segment { text: string, style: string[] }
// Line style strings: h1|h2|h3|blockquote|ul|ol|chapterHeading
// Segment style strings: bold|italic|underline|strike

function getNewLine() {
  return {
    text: [],
    style: [],
  }
}

function getNewSegment(text, style) {
  return {
    text: text || '',
    style: style || [],
  }
}

const listMap = {
  bullet: 'ul',
  ordered: 'ol',
}
function getStyles(attributes) {
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

function getStyledArrayFromChapters(chapters) {
  const splitContent = []

  for (const chapter of chapters) {
    splitContent.push({
      text: chapter.title,
      style: 'chapterHeading',
      pageBreak: 'before',
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

  return splitContent
}

export {
  orderPromises,
  getStyledArrayFromChapters
}