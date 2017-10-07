<template>
  <div class="analyser-wrap">
    <div class="analyser">
      <div class="analyses">
        <h4 class="analysis-title">
          Select an analysis:
        </h4>
        <button class="analysis-button" v-for="(analysis, index) in Analyses" :key="index"
                @click="selectAnalysis(analysis)">
          {{ analysis.title }}
        </button>
      </div>
      <div class="analysis-inputs" v-if="currentAnalysis">
        <template v-if="showInputs">
          <h4 class="analysis-title">
            Enter desired inputs:
          </h4>
          <div class="analysis-input" v-for="(input, index) in currentAnalysis.inputs" :key="index">
            <label :for="getInputId(input)">{{ input }}</label>
            <input :id="getInputId(input)" v-model="currentAnalysis.args[input]">
          </div>
        </template>
        <h4 class="analysis-title">
          Run the analysis:
        </h4>
        <button class="analysis-button" @click="runAnalysis(currentAnalysis)">Run</button>
      </div>
      <div class="results" ref="results"></div>
    </div>
  </div>
</template>

<script>
import Analyses from './analyses'

export default {
  computed: {
    document () {
      return this.$store.state.chapters
    },
    showInputs () {
      return (this.currentAnalysis &&
             this.currentAnalysis.inputs &&
             this.currentAnalysis.inputs.length)
    }
  },
  data () {
    return {
      Analyses,
      currentAnalysis: null
    }
  },
  methods: {
    getInputId (input) {
      return `input-${input}`
    },
    runAnalysis (analysis) {
      analysis.run(this.$refs.results, this.document, analysis.args)
    },
    selectAnalysis (analysis) {
      this.currentAnalysis = analysis
    }
  }
}
</script>

<style scoped>
.analyser-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.analyser {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.analyses {
  margin-bottom: 10px;
}

.analysis-title {
  margin-bottom: 8px;
  margin-top: 12px;
}

.analysis-button {
  margin-right: 6px;
}

.results {
  background-color: #FFF;
}
</style>
