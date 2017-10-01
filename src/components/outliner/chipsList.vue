<template>
  <div>
    <div class="chip-list">
      <div v-for="(chip, index) in dataArray" class="chip" :class="{ 'light': !isDeletable(chip) }" v-show="filterChips(chip)" :key="index">
        <div class="chip-content">
          {{ chip[nameProp] }}
          <button v-show="isDeletable(chip)" class="button-icon chip-delete-button" @click="deleteChip(index)" v-html="deleteSvg"></button>
          <button v-show="!isDeletable(chip)" class="button-icon chip-delete-button" @click="restoreChip(index)" v-html="addSvg"></button>
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
import swal from 'sweetalert'

export default {
  computed: {
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
      const isUnique = this.assertUnique(this.dataArray, this.nameProp, this.newChip)

      if (!isUnique) {
        swal({
          icon: 'error',
          text: `Sorry, ${this.name.toLowerCase()} ${this.nameProp}s must be unique.
                 Please choose a different ${this.nameProp}.`
        })
        return
      }

      this.$emit('add', this.newChip)
      this.newChip = ''
    },
    assertUnique (arr, propName, value) {
      const existing = arr.find(el => el[propName] === value)
      return !existing
    },
    deleteChip (index) {
      this.$emit('delete', { index })
    },
    restoreChip (index) {
      this.$emit('restore', { index })
    }
  },
  props: {
    dataArray: {
      required: true,
      type: Array
    },
    filterChips: {
      required: true,
      type: Function
    },
    isDeletable: {
      required: true,
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

.chip.light {
  background-color: #DEDEDE;
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
