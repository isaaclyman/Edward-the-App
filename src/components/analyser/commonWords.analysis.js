import _ from 'lodash'
import * as d3 from 'd3'
import { GetWordArray } from './deltaParser'

const CommonWords = ({ g: svg, maxHeight, maxWidth }, chapters) => {
  const wordArray = [].concat(...chapters.map(chapter => GetWordArray(chapter.content)))
  const wordDict = _.chain(wordArray).groupBy(word => word).value()

  const frequencies = []
  for (var key of Object.keys(wordDict)) {
    if (!wordDict.hasOwnProperty(key)) {
      return
    }

    frequencies.push({
      frequency: wordDict[key].length,
      word: key
    })
  }

  const orderedFrequencies = _.chain(frequencies).orderBy([obj => obj.frequency], ['desc']).take(10).value()

  const margin = { bottom: 20, left: 20, top: 20, right: 20 }
  const g = svg.attr('transform', `translate(${margin.left}, ${margin.top})`)

  const barHeight = (maxHeight - margin.bottom - margin.top) / orderedFrequencies.length
  const barPadding = 6

  const x = d3.scaleLinear()
  .domain([0, orderedFrequencies[0].frequency])
  .rangeRound([0, maxWidth - margin.left - margin.right])

  const y = index => index * barHeight

  const bar = g.selectAll('g').data(orderedFrequencies).enter().append('g')

  bar.attr('transform', (d, i) => `translate(0, ${y(i)})`)
    .append('text')
    .text(d => d.word)

  bar.append('rect')
    .attr('x', '0').attr('y', barPadding)
    .attr('height', barHeight - (barPadding * 2))
    .attr('width', d => x(d.frequency))
    .attr('fill', '#0d47a1')
}

export default CommonWords
