<template>
  <div class="tabs">
    <button 
      v-for="(item, index) in dataArray" 
      :key="item.guid" 
      v-show="filterTabs(item)"
      class="button-tab" 
      :class="{ 'active': isActive(index) }"
      @click="selectItem(index)"
      @mouseover="hoverItem(index)"
      @mouseout="unhoverItem()">
      {{ item.title }}
    </button>
    <button 
      v-if="canAdd" 
      @click="showNewItem" 
      class="button-tab add-button" 
      v-show="!showAddItem">
      <span class="fas fa-plus"/>
    </button>
    <div 
      class="button-tab add-tab" 
      v-show="showAddItem" 
      v-if="canAdd">
      <input 
        class="tab-input" 
        v-model="newItem" 
        :placeholder="`New ${itemName}...`" 
        @keyup.enter="addItem">
      <button 
        class="button-green tab-internal-button" 
        @click="addItem"
        title="Save"
        v-tooltip="{ arrow: false }">
        <span class="fas fa-save"/>
      </button>
      <button 
        class="button-red tab-internal-button" 
        @click="cancelAddItem"
        title="Cancel"
        v-tooltip="{ arrow: false }">
        <span class="fas fa-times-circle"/>
      </button>
    </div>
  </div>
</template>

<script>
import Cache from './cache'
import Octicons from 'octicons'
import tooltip from '../shared/tooltip.directive'

export default {
  components: {},
  computed: {},
  directives: {
    tooltip
  },
  data() {
    return {
      addSvg: Octicons.plus.toSVG({
        height: 16,
        width: 16,
      }),
      cancelSvg: Octicons['circle-slash'].toSVG({
        height: 16,
        width: 16,
      }),
      newItem: '',
      saveSvg: Octicons.check.toSVG({
        height: 16,
        width: 16,
      }),
      showAddItem: false,
      tabCache: new Cache(`CURRENT_${this.itemName}_TAB`),
    }
  },
  methods: {
    addItem() {
      this.$emit('add', this.newItem)
      this.newItem = ''
      this.showAddItem = false
    },
    hoverItem(index) {
      this.$emit('hover', index)
    },
    isActive(index) {
      return index === this.activeIndex
    },
    selectItem(index) {
      this.$emit('update:activeIndex', index)
    },
    showNewItem() {
      this.showAddItem = true
    },
    cancelAddItem() {
      this.showAddItem = false
      this.newItem = ''
    },
    unhoverItem() {
      this.$emit('unhover')
    },
  },
  mounted() {
    const cachedIndex = this.tabCache.cacheGet()
    if (cachedIndex && cachedIndex < this.dataArray.length) {
      this.selectItem(cachedIndex)
    } else {
      this.selectItem(0)
    }
  },
  props: {
    activeIndex: {
      required: true,
      type: Number,
    },
    dataArray: {
      required: true,
      type: Array,
    },
    filterTabs: {
      required: true,
      type: Function,
    },
    itemName: {
      required: true,
      type: String,
    },
    canAdd: {
      required: false,
      default: true,
      type: Boolean,
    },
  },
  watch: {
    activeIndex(index) {
      this.tabCache.cacheSet(index)
    },
  },
}
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 16px;
  min-height: 40px;
  max-height: 82px;
  overflow: auto;
}

.button-tab {
  align-items: center;
  background-color: #F0F0F0;
  border: 2px solid #323232;
  border-radius: 12px;
  color: #323232;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-right: 8px;
  opacity: 1;
  padding: 6px 10px;
  transition: background-color 100ms;
}

.button-tab.active {
  background-color: #323232;
  color: #fff;
}

.button-tab:not(.active):hover {
  opacity: 0.7;
}

.add-button {
  background-color: #00866F;
  border-color: #00866F;
  color: #fff;
  fill: #fff;
}

.tab-input {
  background-color: #fff;
  border: 2px solid #323232;
  height: 32px;
  margin-right: 6px;
}

.add-tab {
  background-color: transparent;
  border: none;
  padding: 0;
}

.add-tab:hover {
  opacity: 1 !important;
}

.tab-internal-button {
  align-items: center;
  display: flex;
  color: #fff;
  height: 32px;
  justify-content: center;
  padding: 0;
  width: 32px;
}

.tab-internal-button:not(:first-of-type) {
  margin-left: 6px;
}

.icon {
  display: inline-block;
  margin-right: 4px;
}
</style>
