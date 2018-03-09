<template>
  <div v-if="!begun" class="limit">
    <div class="limit-option">
      <input type="radio" id="wordLimit" name="limit" value="word" v-model="limitType">
      <label for="wordLimit">Set a word limit</label>
    </div>
    <div class="limit-option">
      <input type="radio" id="timeLimit" name="limit" value="time" v-model="limitType">
      <label for="timeLimit">Set a time limit</label>
    </div>
    <div class="limit-option">
      <input type="radio" id ="noLimit" name="limit" :value="null" v-model="limitType">
      <label for="noLimit">No limit</label>
    </div>
    <div class="set-limit" v-if="limitType">
      <input type="number" id="setLimit" v-model="limit">
      <label class="set-limit-label" for="setLimit">{{setLimitLabel}}</label>
    </div>
    <div class="begin">
      <button class="button-green" @click="begin()" :disabled="!valid">Begin</button>
    </div>
  </div>
  <div v-else class="counter" :class="{ 'expired': limitReached }">
    <div v-if="limitType === 'word'">
      {{ wordCount }} of {{ limit }} words written
    </div>
    <div v-else-if="limitType === 'time'">
      {{ timeDisplay }}
    </div>
    <div v-if="!limitReached && limitType !== null">
      <button class="button-link" @click="reset()">Cancel</button>
    </div>
    <div v-if="limitReached">
      <button class="button-link" @click="reset()">Set again</button>
    </div>
    <div v-if="limitType === null">
      <button class="button-link" @click="reset()">Set a limit</button>
    </div>
  </div>
</template>

<script>
const defaultLimit = {
  word: 500,
  time: 10
}

export default {
  computed: {
    secondsRemaining () {
      if (this.limitType !== 'time') {
        return 0
      }

      const limitSeconds = this.limit * 60
      return limitSeconds - this.elapsedSeconds
    },
    setLimitLabel () {
      switch (this.limitType) {
        case 'word':
          return 'word limit'
        case 'time':
          return 'minute limit'
      }
    },
    timeDisplay () {
      if (this.secondsRemaining > 30) {
        const minutesRemaining = Math.ceil(this.secondsRemaining / 60)

        if (minutesRemaining > 1) {
          return `${minutesRemaining} minutes left`
        } else {
          return `${minutesRemaining} minute left`
        }
      } else if (this.secondsRemaining > 0) {
        return `${this.secondsRemaining} seconds left`
      } else {
        return `Timer expired`
      }
    },
    valid () {
      return this.limitType === null || this.limit > 0
    },
    wordCount () {
      return (this.fullText.match(/[^\s]+/g) || []).length
    }
  },
  data () {
    return {
      begun: false,
      elapsedSeconds: 0,
      limit: 0,
      limitReached: false,
      limitType: null,
      timerInterval: null
    }
  },
  methods: {
    begin () {
      this.begun = true
      this.$emit('begin')

      if (this.limitType === 'time') {
        this.startTimer()
      }
    },
    clearTimer () {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }
    },
    reset () {
      this.clearTimer()
      this.begun = false
      this.limitReached = false
    },
    startTimer () {
      const startTime = new Date().getTime()
      this.timerInterval = setInterval(() => {
        const currentTime = new Date().getTime()
        this.elapsedSeconds = Math.round((currentTime - startTime) / 1000)
      }, 200)
    }
  },
  watch: {
    limitType (limitType, oldLimitType) {
      if (Number(this.limit) > 0 && Number(this.limit) !== defaultLimit[oldLimitType]) {
        return
      }

      switch (limitType) {
        case 'word':
          this.limit = 500
          return
        case 'time':
          this.limit = 10
          return
      }
    },
    secondsRemaining (seconds) {
      if (this.limitType !== 'time') {
        return
      }

      if (seconds <= 0) {
        this.clearTimer()
        this.limitReached = true
        this.$emit('limitReached')
      }
    },
    wordCount (count) {
      if (this.limitType !== 'word') {
        return
      }

      if (count >= this.limit) {
        this.limitReached = true
        this.$emit('limitReached')
      } else if (this.limitReached === true) {
        this.limitReached = false
      }
    }
  },
  props: {
    fullText: {
      required: true,
      type: String
    }
  },
  beforeDestroy () {
    this.clearTimer()
  }
}
</script>

<style scoped>
.limit {
  background-color: #FFF;
  border: 1px solid #ffeb3b;
  display: inline-block;
  margin: 20px 0;
  min-width: 250px;
  padding: 14px 12px;
}

.limit-option {
  margin-bottom: 4px;
}

.set-limit-label {
  margin-left: 4px;
}

.begin {
  margin-top: 12px;
}

.counter {
  color: #8bc34a;
  display: inline-block;
  font-size: 24px;
  margin: 20px 0;
  min-width: 250px;
  padding: 14px 0;
  transition: color 200ms;
}

.counter.expired {
  color: red;
}

.counter .button-link {
  padding: 6px 0;
}
</style>
