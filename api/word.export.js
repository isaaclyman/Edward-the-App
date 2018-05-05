const docx = require('docx')
const { getChapters } = require('./chapter')
const { getStyledArrayFromChapters } = require('../utilities')

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/word/${route}`

  // GET params: guid, title, includeArchived
  app.get(route('export-chapters'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { guid, title, includeArchived } = req.query

    const numbering = new docx.Numbering();
    const numberedAbstract = numbering.createAbstractNumbering();
    numberedAbstract.createLevel(0, "number", "%1.", "left");
    let numberedConcrete

    const resetNumbering = function() {
      numberedConcrete = numbering.createConcreteNumbering(numberedAbstract)
    }

    const formatLine = function (line, paragraph) {  
      if (!Array.isArray(line.style) || !line.style.includes('ol')) {
        resetNumbering()
      }
      
      if (line.style === 'chapterHeading') {
        paragraph.heading1()
        return
      }

      for (const style of line.style) {
        switch (style) {
          case 'h1':
            paragraph.heading2()
            break
          case 'h2':
            paragraph.heading3()
            break
          case 'h3':
            paragraph.heading4()
            break
          case 'blockquote':
            paragraph.indent(720)
            break
          case 'ul':
            paragraph.bullet()
            break
          case 'ol':
            paragraph.setNumbering(numberedConcrete, 0)
            break
        }
      }
    }

    const formatSegment = function (segment, textRun) {
      for (const style of segment.style) {
        switch (style) {
          case 'bold':
            textRun.bold()
            break
          case 'italic':
            textRun.italic()
            break
          case 'underline':
            textRun.underline()
            break
          case 'strike':
            textRun.strike()
            break
        }
      }
    }

    const doc = new docx.Document({
      creator: 'Edward the App',
      title
    })

    const pTitle = new docx.Paragraph(title).title().pageBreak()
    doc.addParagraph(pTitle)

    resetNumbering()
    return getChapters(db, userId, guid).then(chapters => {
      if (!includeArchived) {
        return chapters.filter(chapter => !chapter.archived)
      }
      return chapters
    }).then(chapters => {
      const styledArray = getStyledArrayFromChapters(chapters)

      let lastPara = null
      for (let index = 0; index < styledArray.length; index++) {
        const line = styledArray[index]
        const para = new docx.Paragraph()

        if (typeof line.text === 'string') {
          para.addRun(new docx.TextRun(line.text))
        } else if (Array.isArray(line.text)) {
          for (const segment of line.text) {
            const run = new docx.TextRun(segment.text)
            formatSegment(segment, run)
            para.addRun(run)
          }
        }

        if (line.pageBreak === 'before' && lastPara) {
          lastPara.pageBreak()
        }
        
        formatLine(line, para)

        doc.addParagraph(para)

        lastPara = para
      }

      const exporter = new docx.ExpressPacker(doc, res)
      exporter.pack(title || 'Document')
    })
  })
}

module.exports = { registerApis }
