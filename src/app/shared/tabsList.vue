<template>
  <div class="tabs">
    <button v-for="(item, index) in dataArray" :key="item.guid" v-show="filterTabs(item)"
            class="button-tab" :class="{ 'active': isActive(index) }"
            @click="selectItem(index)"
            @mouseover="hoverItem(index)"
            @mouseout="unhoverItem()">
      {{ item.title }}
    </button>
    <button v-if="canAdd" @click="showNewItem" class="button-tab add-button" v-show="!showAddItem" v-html="addSvg"></button>
    <div class="button-tab add-tab" v-show="showAddItem" v-if="canAdd">
      <input class="tab-input" v-model="newItem" :placeholder="`New ${itemName}...`" @keyup.enter="addItem">
      <button class="button-green tab-internal-button" @click="addItem">
        <span class="u-center-all icon" v-html="saveSvg"></span> Save
      </button>
      <button class="button-red tab-internal-button" @click="cancelAddItem">
          <span class="u-center-all icon" v-html="cancelSvg"></span> Cancel
        </button>
    </div>
  </div>
</template>

<script>
import Cache from './cache'
import Octicons from 'octicons'

export default {
  created () {
    const cachedIndex = this.tabCache.cacheGet()
    if (cachedIndex && cachedIndex < this.dataArray.length) {
      this.selectItem(cachedIndex)
    } else {
      this.tabCache.cacheSet(0)
      this.selectItem(0)
    }
  },
  components: {},
  computed: {},
  data () {
    return {
      addSvg: Octicons.plus.toSVG({
        height: 14,
        width: 14
      }),
      cancelSvg: Octicons['circle-slash'].toSVG({
        height: 14,
        width: 14
      }),
      newItem: '',
      saveSvg: Octicons.check.toSVG({
        height: 14,
        width: 14
      }),
      showAddItem: false,
      tabCache: new Cache(`CURRENT_${this.itemName}_TAB`)
    }
  },
  methods: {
    addItem () {
      this.$emit('add', this.newItem)
      this.newItem = ''
      this.showAddItem = false
    },
    hoverItem (index) {
      this.$emit('hover', index)
    },
    isActive (index) {
      return index === this.activeIndex
    },
    selectItem (index) {
      this.$emit('update:activeIndex', index)
    },
    showNewItem () {
      this.showAddItem = true
    },
    cancelAddItem () {
      this.showAddItem = false
      this.newItem = ''
    },
    unhoverItem () {
      this.$emit('unhover')
    }
  },
  props: {
    activeIndex: {
      required: true,
      type: Number
    },
    dataArray: {
      required: true,
      type: Array
    },
    filterTabs: {
      required: true,
      type: Function
    },
    itemName: {
      required: true,
      type: String
    },
    canAdd: {
      required: false,
      default: true,
      type: Boolean
    }
  },
  watch: {
    activeIndex (index) {
      this.tabCache.cacheSet(index)
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 60px;
  min-height: 28px;
  overflow: auto;
}

.tab-input {
  background-color: rgba(255,255,255,0.8);
  border: none;
  height: 20px;
  margin-right: 6px;
}

.add-tab {
  background-color: #CCC;
  padding: 6px 6px;
}

.tab-internal-button {
  display: flex;
  fill: #FFF;
  padding: 2px 8px;
}

.tab-internal-button:not(:first-of-type) {
  margin-left: 6px;
}

.icon {
  display: inline-block;
  margin-right: 4px;
}
</style>
