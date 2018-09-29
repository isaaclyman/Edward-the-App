<template>
  <div class="chip-list-wrap">
    <div class="chip-list">
      <draggable 
        v-model="reactiveArray" 
        :options="draggableOptions">
        <div 
          v-for="(chip, index) in reactiveArray" 
          class="chip" 
          :class="{ 'light': !isDeletable(chip) }" 
          v-show="filterChips(chip)"
          :key="index">
          <div 
            class="chip-content" 
            v-show="!showChipInput(index)">
            <span class="chip-draggable">
              {{ chip[nameProp] }}
            </span>
            <button 
              v-show="isDeletable(chip)" 
              class="button-icon chip-action-button action-rename" 
              @click="renameChip(index, chip[nameProp])" 
              v-html="editSvg"/>
            <button 
              v-show="isDeletable(chip)" 
              class="button-icon chip-action-button action-delete" 
              @click="deleteChip(index)" 
              v-html="deleteSvg"/>
            <button 
              v-show="!isDeletable(chip)" 
              class="button-icon chip-action-button action-restore" 
              @click="restoreChip(index)" 
              v-html="addSvg"/>
          </div>
          <div 
            class="chip-content" 
            v-if="showChipInput(index)">
            <input 
              class="chip-input" 
              v-model="chipValues[index]" 
              @keyup.enter="saveChipValue(index)" 
              :placeholder="chip[nameProp]">
            <button 
              class="button-green chip-add-button" 
              @click="saveChipValue(index)" 
              :disabled="!chipValues[index]">
              <span 
                class="u-center-all chip-add-svg" 
                v-html="saveSvg"/> Save
            </button>
            <button 
              class="button-red chip-add-button" 
              @click="cancelRename(index)">
              <span 
                class="u-center-all chip-add-svg" 
                v-html="cancelSvg"/> Cancel
            </button>
          </div>
        </div>
      </draggable>
    </div>
    <div class="chip">
      <div class="chip-content">
        <input 
          class="chip-input" 
          v-model="newChip" 
          @keyup.enter="addNewChip" 
          :placeholder="placeholder">
        <button 
          class="button-green chip-add-button" 
          @click="addNewChip" 
          :disabled="!newChip">
          <span 
            class="u-center-all chip-add-svg" 
            v-html="addSvg"/> Add
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Octicons from 'octicons'
import swal from 'sweetalert'

export default {
  components: {
    draggable,
  },
  computed: {
    placeholder() {
      return `New ${this.name}...`
    },
    reactiveArray: {
      get() {
        return this.dataArray
      },
      set(value) {
        this.$emit('rearrange', value)
      },
    },
  },
  data() {
    return {
      addSvg: Octicons.plus.toSVG({
        height: 14,
        width: 14,
      }),
      cancelSvg: Octicons['circle-slash'].toSVG({
        height: 14,
        width: 14,
      }),
      chipValues: [],
      deleteSvg: Octicons.x.toSVG({
        height: 14,
        width: 14,
      }),
      draggableOptions: {
        animation: 100,
        draggable: '.chip',
        group: this.name,
        handle: '.chip-draggable',
      },
      editSvg: Octicons.pencil.toSVG({
        height: 14,
        width: 14,
      }),
      newChip: '',
      saveSvg: Octicons.check.toSVG({
        height: 14,
        width: 14,
      }),
    }
  },
  methods: {
    addNewChip() {
      const isUnique = this.assertUnique(this.dataArray, this.nameProp, this.newChip)

      if (!isUnique) {
        return
      }

      this.$emit('add', this.newChip)
      this.newChip = ''
    },
    assertUnique(arr, propName, value) {
      const existing = arr.find(el => el[propName] === value)

      if (existing) {
        swal({
          icon: 'error',
          text: `Sorry, ${this.name.toLowerCase()} ${propName}s must be unique. "${value}" is already in use.
                 Please choose a different ${propName}.`,
        })
        return false
      }

      return true
    },
    cancelRename(index) {
      this.$set(this.chipValues, index, null)
    },
    deleteChip(index) {
      this.$emit('delete', { index })
    },
    renameChip(index, name) {
      this.$set(this.chipValues, index, name)
    },
    restoreChip(index) {
      this.$emit('restore', { index })
    },
    saveChipValue(index) {
      const otherChips = this.dataArray.slice()
      otherChips.splice(index, 1)
      const isUnique = this.assertUnique(otherChips, this.nameProp, this.chipValues[index])

      if (!isUnique) {
        return
      }

      this.$emit('update', { index, value: this.chipValues[index] })
      this.$set(this.chipValues, index, null)
    },
    showChipInput(index) {
      return typeof this.chipValues[index] === 'string'
    },
  },
  props: {
    dataArray: {
      required: true,
      type: Array,
    },
    filterChips: {
      required: true,
      type: Function,
    },
    isDeletable: {
      required: true,
      type: Function,
    },
    name: {
      required: true,
      type: String,
    },
    nameProp: {
      required: true,
      type: String,
    },
  },
}
</script>

<style scoped>
.chip-list-wrap {
  display: flex;
  flex-wrap: wrap;
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

.chip.light {
  background-color: #DEDEDE;
}

.chip-content {
  display: flex;
}

.chip-draggable {
  cursor: grab;
}

.chip.sortable-ghost {
  background-color: #333;
  color: #FFF;
  fill: #FFF;
}

.chip-input {
  background-color: rgba(255,255,255,0.8);
  border: none;
  height: 20px;
  margin-right: 6px;
}

.chip-add-button {
  display: flex;
  fill: #FFF;
  padding: 2px 8px;
}

.chip-add-button:not(:first-of-type) {
  margin-left: 6px;
}

.chip-add-svg {
  margin-right: 6px;
}

.chip-action-button {
  margin-left: 8px;
}
</style>
