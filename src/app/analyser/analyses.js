/*
Analysis: {
  description String,
  inputs String[],
  run (resultsWindow HTMLElement, document Delta, args Object),
  title String
}
*/

import CommonWords from './commonWords.analysis'
import * as d3 from 'd3'
import swal from 'sweetalert'
import WordOverTime from './wordOverTime.analysis'

const clearPrevious = (el) => {
  el.innerHTML = ''
}

const makeSvg = (el) => {
  const maxHeight = 400
  const maxWidth = el.offsetWidth
  const g = d3.select(el)
    .append('svg')
    .style('background-color', '#FFF')
    .attr('height', maxHeight)
    .attr('width', maxWidth)
    .append('g')

  return { g, maxHeight, maxWidth }
}

const safelyRunAnalysis = (analysisFn, args, onError) => {
  try {
    analysisFn(...args)
  } catch (e) {
    swal({
      icon: 'error',
      text: e
    })
    onError()
  }
}

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
  run (resultsWindow, { chapters }) {
    clearPrevious(resultsWindow)

    const unarchivedChapters = chapters.filter(chapter => !chapter.archived && !!chapter.content)

    safelyRunAnalysis(
      CommonWords,
      [makeSvg(resultsWindow), unarchivedChapters],
      () => clearPrevious(resultsWindow)
    )
  },
  title: 'Most common words'
}

const wordOverTime = {
  description: 'Track your usage of a specific word in each chapter',
  inputs: ['Word'],
  run (resultsWindow, { chapters }, args) {
    if (!validateArgs(this.inputs, args)) {
      return
    }
    clearPrevious(resultsWindow)

    const unarchivedChapters = chapters.filter(chapter => !chapter.archived && !!chapter.content)

    safelyRunAnalysis(
      WordOverTime,
      [makeSvg(resultsWindow), unarchivedChapters, args],
      () => clearPrevious(resultsWindow)
    )
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
