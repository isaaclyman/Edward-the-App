import * as d3 from 'd3'
import { GetWordArray } from './deltaParser'

const WordOverTime = (resultsWindow, { chapters }, { Word: wordArg }) => {
  const chapterResults = []
  const unarchivedChapters = chapters.filter(chapter => !chapter.archived && !!chapter.content)

  for (const chapter of unarchivedChapters) {
    const words = GetWordArray(chapter.content)
    const frequency = words.filter(word => word.toLowerCase() === wordArg.toLowerCase()).length
    chapterResults.push({
      frequency,
      title: chapter.title
    })
  }

  const frequencies = chapterResults.map(result => result.frequency)
  const domain = [Math.min(...frequencies), Math.max(...frequencies)]
  const margin = { bottom: 40, left: 30, top: 20, right: 50 }
  const maxHeight = 400
  const maxWidth = resultsWindow.offsetWidth

  // Create svg and g and position with a 10px margin
  const g = d3.select(resultsWindow)
    .append('svg')
    .style('background-color', '#FFF')
    .attr('height', maxHeight)
    .attr('width', maxWidth)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const x = d3.scaleLinear()
    .domain([1, chapterResults.length])
    .rangeRound([0, maxWidth - margin.left - margin.right])

  const y = d3.scaleLinear()
    .domain(domain)
    .rangeRound([maxHeight - margin.bottom - margin.top, 0])

  g.append('g')
    .attr('transform', `translate(0, ${maxHeight - margin.bottom - margin.top})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(i => truncate(chapterResults[i - 1].title, 20))
    )
    .selectAll('text')
    .attr('transform', 'rotate(-8)')

  g.append('g')
    .attr('transform', `translate(0, 0)`)
    .call(d3.axisLeft(y))

  g.append('text')
    .attr('font-size', '12')
    .attr('x', '10')
    .attr('y', '5')
    .text('Occurrences')

  const line = d3.line()
    .x((d, index) => x(index + 1))
    .y(d => y(d.frequency))

  g.append('path')
    .datum(chapterResults)
    .attr('fill', 'none')
    .attr('stroke', '#0d47a1')
    .attr('stroke-linejoin', 'bevel')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', '2')
    .attr('d', line)
}

function truncate (str, length) {
  if (str.length < length) {
    return str
  }

  return `${str.substring(0, length)}...`
}

export default WordOverTime
