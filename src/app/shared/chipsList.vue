<template>
  <div class="chip-list-wrap">
    <draggable 
      class="chip-list"
      v-model="reactiveArray" 
      :options="draggableOptions"
    >
      <div 
        v-for="(chip, index) in reactiveArray" 
        class="chip" 
        :class="{ 'light': !isDeletable(chip) }" 
        v-show="filterChips(chip)"
        :key="index"
      >
        <div 
          class="chip-content" 
          v-show="!showChipInput(index)"
        >
          <span class="chip-draggable">
            {{ chip[nameProp] }}
          </span>
          <button 
            v-show="isDeletable(chip)" 
            class="button-icon chip-action-button action-rename"
            @click="renameChip(index, chip[nameProp])"
            title="Rename"
            v-tooltip
          >
            <span class="fas fa-edit" />
          </button>
          <button 
            v-show="isDeletable(chip)" 
            class="button-icon chip-action-button action-delete" 
            @click="deleteChip(index)"
            title="Archive"
            v-tooltip
          >
            <span class="fas fa-archive" />
          </button>
          <button 
            v-show="!isDeletable(chip)" 
            class="button-icon chip-action-button action-restore"
            @click="restoreChip(index)"
            title="Un-archive"
            v-tooltip
          >
            <span class="fas fa-box-open" />
          </button>
        </div>
        <div 
          class="chip-content" 
          v-if="showChipInput(index)"
        >
          <input 
            class="chip-internal-input" 
            v-model="chipValues[index]" 
            @keyup.enter="saveChipValue(index)" 
            :placeholder="chip[nameProp]"
          >
          <button 
            class="button-green chip-internal-button" 
            @click="saveChipValue(index)" 
            :disabled="!chipValues[index]"
            title="Save"
            v-tooltip
          >
            <span class="u-center-all fas fa-save" />
          </button>
          <button 
            class="button-red chip-internal-button" 
            @click="cancelRename(index)"
            title="Cancel"
            v-tooltip
          >
            <span class="u-center-all fas fa-times-circle" />
          </button>
        </div>
      </div>
      <div slot="footer">
        <div class="chip-content">
          <input 
            class="chip-input" 
            v-model="newChip" 
            @keyup.enter="addNewChip" 
            :placeholder="placeholder"
          >
          <button 
            class="button-green chip-add-button" 
            @click="addNewChip" 
            :disabled="!newChip"
          >
            Add
          </button>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import swal from 'sweetalert'
import tooltip from '../shared/tooltip.directive'

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
      chipValues: [],
      draggableOptions: {
        animation: 100,
        draggable: '.chip',
        group: this.name,
        handle: '.chip-draggable',
      },
      newChip: ''
    }
  },
  directives: {
    tooltip
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
  flex-direction: row;
  flex-wrap: wrap;
}

.chip-list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
}

.chip {
  align-items: center;
  background-color: #323232;
  border: 2px solid #323232;
  border-radius: 12px;
  color: #fff;
  display: flex;
  fill: #fff;
  font-size: 16px;
  font-weight: bold;
  margin: 4px 8px 8px 0;
  opacity: 1;
  padding: 6px 10px;
  transition: background-color 100ms, color 100ms;
}

.chip.light {
  background-color: #DEDEDE;
  color: #323232;
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
  background-color: #fff;
  border: 2px solid #323232;
  color: #323232;
  font-weight: bold;
  height: 36px;
  margin-bottom: 4px;
  margin-right: 6px;
  padding: 8px 12px;
}

.chip-add-button {
  align-items: center;
  display: flex;
  fill: #FFF;
  font-size: 16px;
  margin-bottom: 4px;
  padding: 2px 8px;
}

.chip-add-button:not(:first-of-type) {
  margin-left: 6px;
}

.chip-internal-button {
  align-items: center;
  display: flex;
  font-size: 16px;
  justify-content: center;
  padding: 0;
  width: 32px;
}

.chip-internal-input {
  background-color: #fff;
  border: 2px solid #323232;
  color: #323232;
  font-weight: bold;
  height: 28px;
  margin-right: 6px;
  padding: 4px 8px;
}

.chip-internal-button:not(:first-of-type) {
  margin-left: 6px;
}

.chip-action-button {
  color: inherit;
  font-size: inherit;
  margin-left: 8px;
}
</style>
