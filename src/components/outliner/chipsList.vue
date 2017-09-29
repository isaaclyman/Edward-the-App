<template>
  <div class="wrap">
    <h3>{{ name }}s</h3>
    <div class="add-chip">

    </div>
    <div class="chip-list">
      <div class="chip" v-for="chip in chips" v-show="filterChips(chip.data)" :key="chip.index">
        <div class="chip-content">
          {{ chip.data[nameProp] }}
          <button class="button-icon chip-delete-button" @click="deleteChip(chip)" v-html="deleteSvg"></button>
        </div>
      </div>
      <div class="chip">
        <div class="chip-content">
          <input class="chip-input" v-model="newChip" :placeholder="placeholder">
          <button class="button-green chip-add-button" @click="addNewChip" :disabled="!newChip">
            <span class="u-center-all chip-add-svg" v-html="addSvg"></span> Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Octicons from 'octicons'

export default {
  computed: {
    chips () {
      return this.dataArray.map((data, index) => ({ data, index }))
    },
    placeholder () {
      return `New ${this.name}...`
    }
  },
  data () {
    return {
      addSvg: Octicons.plus.toSVG({
        height: 14,
        width: 14
      }),
      deleteSvg: Octicons.x.toSVG({
        height: 14,
        width: 14
      }),
      newChip: ''
    }
  },
  methods: {
    addNewChip () {
      this.$emit('add', this.newChip)
      this.newChip = ''
    },
    deleteChip (chip) {
      this.$emit('delete', chip)
    }
  },
  props: {
    dataArray: {
      required: true,
      type: Array
    },
    filterChips: {
      type: Function
    },
    name: {
      required: true,
      type: String
    },
    nameProp: {
      required: true,
      type: String
    }
  }
}
</script>

<style scoped>
.wrap {
  border-left: 2px solid #e8cc84;
  margin: 10px 0;
  padding-left: 6px;
}

.chip-list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
}

.chip {
  background-color: #CCC;
  border-radius: 4px;
  display: inline-block;
  margin: 2px 3px;
  padding: 4px 6px;
}

.chip-content {
  display: flex;
}

.chip-input {
  background-color: rgba(255,255,255,0.8);
  border: none;
  height: 12px;
  margin-right: 6px;
}

.chip-add-button {
  display: flex;
  fill: #FFF;
  padding: 2px 8px;
}

.chip-add-svg {
  margin-right: 6px;
}

.chip-delete-button {
  margin-left: 8px;
}
</style>
