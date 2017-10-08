/*
Analysis: {
  description String,
  inputs String[],
  run (resultsWindow HTMLElement, document Delta, args Object),
  title String
}
*/

import * as d3 from 'd3'
import { GetWordArray } from './deltaParser'
import swal from 'sweetalert'

const validateArgs = (inputs, args) => {
  for (const input of inputs) {
    if (!args[input]) {
      swal({
        icon: 'error',
        text: `Please fill in all required inputs.`
      })
      return false
    }
  }
  return true
}

const wordFrequency = {
  description:
    `Find your top 10 most frequently used words (ignoring common English words like "the")`,
  inputs: null,
  run (resultsWindow, document, args) {
    // Run the analysis
    console.log(args)
  },
  title: 'Most common words'
}

const wordOverTime = {
  description: 'Track your usage of a specific word over time',
  inputs: ['Word'],
  run (resultsWindow, document, args) {
    if (!validateArgs(this.inputs, args)) {
      return
    }

    const chapterResults = []
    const unarchivedChapters = document.chapters.filter(chapter => !chapter.archived && !!chapter.content)

    for (const chapter of unarchivedChapters) {
      const words = GetWordArray(chapter.content)
      const frequency = words.filter(word => word.toLowerCase() === args['Word'].toLowerCase()).length
      chapterResults.push({
        frequency,
        title: chapter.title
      })
    }

    const frequencies = chapterResults.map(result => result.frequency)
    const domain = [Math.min(...frequencies), Math.max(...frequencies)]
    const margin = { bottom: 20, left: 30, top: 20, right: 30 }
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
      .call(d3.axisBottom(x))

    g.append('g')
      .attr('transform', `translate(0, 0)`)
      .call(d3.axisLeft(y))

    d3.line()
      .x((d, index) => x(index))
      .y(d => d.frequency)
  },
  title: 'Word over time'
}

const all = [
  wordFrequency,
  wordOverTime
].map(analysis => {
  analysis.args = {}
  return analysis
})

export default all
