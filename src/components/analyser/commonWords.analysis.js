import _ from 'lodash'
import * as d3 from 'd3'
import { GetWordArray } from './deltaParser'

const ignoredWords = `
  the a an
  and but not or
  I me we us you she her he him they them it
  I've I'll I'd we've we'll we'd you've you'll you'd
  she's she'll she'd he's he'll he'd they've they'll they'd
  it's it'll it'd
  I'm you're they're
  myself ourself ourselves yourself yourselves
  herself himself theirself theirselves themselves
  my mine our ours your yours hers his their theirs its
  to from of in for as with so at by on
  be being is was were would will
  do doing did done go going went
  have having had
  that those this these
  not
  what who which`
  .split(/\s/).map(str => str.toLowerCase())

const CommonWords = ({ g: svg, maxHeight, maxWidth }, chapters) => {
  const wordArray = [].concat(...chapters.map(
    chapter => GetWordArray(chapter.content)
      .map(word => word.toLowerCase())
      .filter(word => !ignoredWords.includes(word))
  ))
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
  const barInnerHeight = barHeight - (barPadding * 2)
  const barRightPad = 50

  const x = d3.scaleLinear()
  .domain([0, orderedFrequencies[0].frequency])
  .rangeRound([0, maxWidth - margin.left - margin.right - barRightPad])

  const y = index => index * barHeight

  const bar = g.selectAll('g').data(orderedFrequencies).enter().append('g')

  bar.append('rect')
  .attr('x', '0').attr('y', barPadding)
  .attr('height', barInnerHeight)
  .attr('width', d => x(d.frequency))
  .attr('fill', '#90caf9')

  bar.attr('transform', (d, i) => `translate(0, ${y(i)})`)
    .append('text')
    .text(d => d.word)
    .attr('font-size', '14')
    .attr('x', '5').attr('y', `${barInnerHeight}`)

  bar.append('text')
    .text(d => d.frequency)
    .attr('font-size', '14')
    .attr('x', d => x(d.frequency) + 6).attr('y', `${barInnerHeight}`)
}

export default CommonWords
