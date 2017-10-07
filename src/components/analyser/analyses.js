/*
Analysis: {
  inputs String[],
  run (resultsWindow HTMLElement, document Delta, args Object),
  title String
}
*/

const wordFrequency = {
  inputs: null,
  run (resultsWindow, document, args) {
    // Run the analysis
    console.log(args)
  },
  title: 'Word frequency'
}

const wordOverTime = {
  inputs: ['Word'],
  run (resultsWindow, document, args) {
    // Run the analysis
    console.log(args)
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
