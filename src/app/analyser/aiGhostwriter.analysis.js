import { GetContentString } from '../shared/deltaParser'
import Text from 'markov-chains-text'
import * as d3 from 'd3'

const AiGhostwriter = ({ el, maxHeight, maxWidth }, chapters) => {
  const fullText = chapters.map(chapter => GetContentString(chapter.content)).join(' ')

  if (fullText.length < 1500) {
    throw new Error(`You don't have enough content for the A.I. to work with. Write some more content in chapters and try again.`)
  }

  const fakeText = new Text(fullText)
  const sentence = fakeText.makeSentence({ tries: 50 })

  el.innerHTML = ''
  const parent = d3.select(el)
  parent.append('p').append('strong').text('A.I. generated sentence:')

  if (sentence instanceof Error) {
    parent.append('p').style('max-width', '600px').append('em')
      .text(`Failed to generate unique text. Please try again. The more content in chapters you've written, the more often this will work.`)
    return
  }

  parent.append('p').style('max-width', '600px').text(sentence)
}

export default AiGhostwriter
