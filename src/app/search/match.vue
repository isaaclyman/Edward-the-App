<template>
  <p class="match">
    <span v-if="!match.atHead">...</span>
    <span v-text="formattedPre"/>
    <em v-text="formattedQuery"/>
    <span v-text="formattedPost"/>
    <span v-if="!match.atTail">...</span>
  </p>
</template>

<script>
import trimEnd from 'lodash/trimEnd'
import trimStart from 'lodash/trimStart'

export default {
  computed: {
    formattedPre() {
      return trimStart(this.match.pre).replace(/\n/g, ' ¶ ')
    },
    formattedQuery() {
      return this.match.query.replace(/\n/g, ' ¶ ')
    },
    formattedPost() {
      return trimEnd(this.match.post).replace(/\n/g, ' ¶ ')
    },
  },
  props: {
    match: {
      required: true,
      type: Object,
    },
  },
}
</script>

<style scoped>
.match {
  line-height: 1.2em;
  margin: 2px 0;
}
</style>
