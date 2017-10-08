/*
Analysis: {
  description String,
  inputs String[],
  run (resultsWindow HTMLElement, document Delta, args Object),
  title String
}
*/

import swal from 'sweetalert'
import WordOverTime from './wordOverTime.analysis'

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

    WordOverTime(resultsWindow, document, args)
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
