<template>
  <div class="composer-wrap">
    <div 
      class="composer" 
      v-if="hasChapters">
      <div class="map-wrap">
        <text-map 
          :editor-element="editorElement" 
          :data-stream="activeChapter.content"
          @select="selectMap" 
          :mark="mark"/>
      </div>
      <div class="editor-wrap">
        <tabs-list 
          :active-index="activeChapterIndex" 
          :data-array="allChapters" 
          :filter-tabs="isViewing"
          item-name="Chapter"
          @add="addChapter"
          @hover="hoverChapter"
          @unhover="unhoverChapter"
          @update:activeIndex="selectChapter"/>
        <div 
          class="below-tabs" 
          ref="editorContainer">
          <div 
            class="stats" 
            :class="{ 'active': showStats }">
            <div class="stats-content">
              <p>
                <b>{{ activeChapter.title }}</b>
              </p>
              <p>{{ chapterWordCount }} words</p>
              <p>{{ chapterParagraphCount }} paragraphs</p>
              <p>{{ chapterPageCount }} pages</p>
              <p>{{ chapterReadTimeMinutes }} minute read</p>
              <br>
              <p>
                <b>{{ documentTitle }} (Full document)</b>
              </p>
              <p>{{ documentWordCount }} words</p>
              <p>{{ documentPageCount }} pages</p>
              <p>{{ documentReadTimeMinutes }} minute read</p>
            </div>
          </div>
          <div class="define">
            <word-define :word="mark"/>
          </div>
          <quill-editor 
            ref="textEditor" 
            :content="activeChapter.content" 
            :content-id="activeChapter.guid"
            :scroll-to="scrollTo"
            :container="editorContainerNode"
            @update:content="updateContent"
            @update:selection="updateSelection"/>
        </div>
      </div>
      <div class="sidebar-wrap">
        <!-- Plans/Outlines/Workshops switch -->
        <div class="sidebar-options">
          <div class="plan-switch">
            <button 
              class="switch-label" 
              :class="{ 'active': sidebar === 'outline' }" 
              @click="switchOutline()">
              <div v-html="outlineSvg"/>
              <div class="switch-label-text">Outline</div>
            </button>
            <hr class="vert">
            <button 
              class="switch-label" 
              :class="{ 'active': sidebar === 'plan' }" 
              @click="switchPlans()">
              <div v-html="planSvg"/>
              <div class="switch-label-text">Plans</div>
            </button>
            <template v-if="isPremium">
              <hr class="vert">
              <button 
                class="switch-label" 
                :class="{ 'active': sidebar === 'workshop' }" 
                @click="switchWorkshops()">
                <div v-html="workshopSvg"/>
                <div class="switch-label-text">Workshops</div>
              </button>
            </template>
          </div>
          <div class="archived-filter">
            <input 
              id="showArchivedTopics" 
              type="checkbox" 
              v-model="filters.archived">
            <label for="showArchivedTopics">Show Archived</label>
          </div>
        </div>
        <!-- Document Plans -->
        <div 
          class="sidebar-content" 
          v-show="sidebar === 'plan'">
          <template v-if="hasPlans">
            <plans-list 
              :filter-plans="showPlan" 
              :filter-sections="showSection"/>
          </template>
          <template v-else>
            <div>No plans yet.</div>
            <div>
              <router-link to="/plan">Start planning</router-link>
            </div>
          </template>
        </div>
        <!-- Chapter Outlines -->
        <div 
          class="sidebar-content" 
          v-show="sidebar === 'outline'">
          <template v-if="hasTopics">
            <div class="topic-list-wrap">
              <topic-list 
                :chapter="activeChapter" 
                :filter-topics="showTopic" 
                :topics="allTopics"/>
            </div>
          </template>
          <template v-else>
            <div>No outline yet.</div>
            <div>
              <router-link to="/outline">Start outlining</router-link>
            </div>
          </template>
        </div>
        <!-- Workshops -->
        <div 
          class="sidebar-content" 
          v-show="sidebar === 'workshop'">
          <template v-if="hasWorkshops">
            <workshop-list 
              ref="workshopList" 
              :filter-workshops="showWorkshop"/>
          </template>
          <template v-else>
            <div>No workshops completed yet.</div>
            <div>
              <router-link to="/workshop/free-write">Do a free write</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else>
      <div>No chapters yet.</div>
      <div>
        <router-link to="/outline">Create one</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_CHAPTER, UPDATE_CHAPTER_CONTENT } from '../shared/chapters.store'
import Cache from '../shared/cache'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import Octicons from 'octicons'
import PlansList from '../shared/plansList.vue'
import QuillEditor from '../shared/quillEditor.vue'
import TabsList from '../shared/tabsList.vue'
import TextMap from './textMap.vue'
import TopicList from '../shared/topicList.vue'
import { UPDATE_SELECTION } from './composer.store'
import { ValidateTitle } from '../shared/validate'
import VueSwitch from 'vue-switches'
import WordDefine from './wordDefine.vue'
import WorkshopList from '../shared/workshopList.vue'

const planSwitch = new Cache('COMPOSER_PLAN_SWITCH')

export default {
  components: {
    PlansList,
    QuillEditor,
    TabsList,
    TextMap,
    TopicList,
    VueSwitch,
    WordDefine,
    WorkshopList,
  },
  computed: {
    activeChapter() {
      if (this.activeChapterIndex === -1) {
        return this.viewingChapters[0]
      }

      return this.allChapters[this.activeChapterIndex] || {}
    },
    allChapters() {
      return this.$store.state.chapters.chapters
    },
    allPlans() {
      return this.$store.state.chapters.plans || []
    },
    allTopics() {
      return this.$store.state.chapters.topics
    },
    allWorkshops() {
      return this.$store.state.workshop.workshops
    },
    chapterPageCount() {
      return this.getPageCount(this.textContent)
    },
    chapterParagraphCount() {
      return this.getParagraphCount(this.textContent)
    },
    chapterReadTimeMinutes() {
      return this.getReadTimeMinutes(this.textContent)
    },
    chapterWordCount() {
      return this.getWordCount(this.textContent)
    },
    documentFullText() {
      return (
        this.$store.state.chapters.chapters
          .map(chapter => chapter.content)
          .map(content => GetContentString(content))
          .join(' ')
      )
    },
    documentPageCount() {
      return this.getPageCount(this.documentFullText)
    },
    documentReadTimeMinutes() {
      return this.getReadTimeMinutes(this.documentFullText)
    },
    documentTitle() {
      return this.$store.state.document.currentDocument.name
    },
    documentWordCount() {
      return this.getWordCount(this.documentFullText)
    },
    hasChapters() {
      return this.viewingChapters && this.viewingChapters.length
    },
    hasPlans() {
      return this.allPlans && this.allPlans.length
    },
    hasTopics() {
      return this.allTopics && this.allTopics.length
    },
    hasWorkshops() {
      return this.allWorkshops && this.allWorkshops.length
    },
    isPremium() {
      return this.$store.state.user.user.isPremium
    },
    mark() {
      return this.selection.text
    },
    selection() {
      return this.$store.state.composer.selection
    },
    textContent() {
      return GetContentString(this.activeChapter.content)
    },
    viewingChapters() {
      return this.allChapters.filter(chapter => !chapter.archived)
    },
    viewingPlans() {
      return (this.allPlans
        .filter(plan => !plan.archived || this.filters.archived))
    },
  },
  data() {
    return {
      activeChapterIndex: -1,
      editorContainerNode: null,
      editorElement: null,
      filters: {
        archived: false,
      },
      newChapter: '',
      outlineSvg: Octicons['list-unordered'].toSVG({
        height: 25,
        width: 25,
      }),
      planSvg: Octicons.telescope.toSVG({
        height: 25,
        width: 25,
      }),
      workshopSvg: Octicons.tools.toSVG({
        height: 25,
        width: 25,
      }),
      scrollTo: {
        paragraphIndex: -1,
        searchTermIndex: -1,
      },
      sidebar: 'outline',
      showStats: false,
    }
  },
  methods: {
    addChapter(title) {
      if (!ValidateTitle('chapter', title)) {
        return
      }

      const chapter = {
        archived: false,
        content: null,
        guid: guid(),
        title,
        topics: {},
      }

      this.$store.commit(ADD_CHAPTER, { chapter })
    },
    getMasterTopic(chapterTopic) {
      return this.allTopics.find(topic => topic.guid === chapterTopic.guid)
    },
    getReadTimeMinutes(str) {
      return Math.ceil(this.getWordCount(str) / 275)
    },
    getPageCount(str) {
      return Math.ceil(this.getWordCount(str) / 300)
    },
    getParagraphCount(str) {
      return (str.match(/[\n]+/g) || []).length
    },
    getWordCount(str) {
      return (str.match(/[^\s]+/g) || []).length
    },
    hoverChapter() {
      this.showStats = true
    },
    isActive(index) {
      return index === this.activeChapterIndex
    },
    isViewing(chapter) {
      return !chapter.archived || this.filters.archived
    },
    selectChapter(index) {
      // If no active chapter has been set, default to the first one
      if (index === -1) {
        index = 0
      }

      // If viewing an archived chapter but "show archived" is false
      if (this.allChapters[index].archived && !this.filters.archived) {
        index = this.allChapters.indexOf(this.viewingChapters[0])
      }

      this.activeChapterIndex = index
    },
    selectMap(descriptor) {
      this.scrollTo = descriptor
    },
    showPlan(plan) {
      return this.viewingPlans.includes(plan)
    },
    showSection(section) {
      return !section.archived || this.filters.archived
    },
    showTopic(chapterTopic) {
      const masterTopic = this.getMasterTopic(chapterTopic)
      return !masterTopic || !masterTopic.archived || this.filters.archived
    },
    showWorkshop(workshop) {
      return !workshop.archived || this.filters.archived
    },
    switchOutline() {
      this.sidebar = 'outline'
      planSwitch.cacheSet('outline')
    },
    switchPlans() {
      this.sidebar = 'plan'
      planSwitch.cacheSet('plan')
    },
    switchWorkshops() {
      this.sidebar = 'workshop'
      planSwitch.cacheSet('workshop')
    },
    unhoverChapter() {
      this.showStats = false
    },
    updateContent({ content: newContent, contentId: guid }) {
      const chapter = this.allChapters.find(chapter => chapter.guid === guid)
      if (!chapter) {
        return
      }

      this.$store.commit(UPDATE_CHAPTER_CONTENT, {
        chapter,
        newContent,
      })
    },
    updateSelection(selection) {
      this.$store.commit(UPDATE_SELECTION, selection)
    },
  },
  mounted() {
    this.editorContainerNode = this.$refs.editorContainer
    this.editorElement = this.$refs.textEditor
    this.sidebar = planSwitch.cacheGet() || 'outline'

    const chapterGuid = this.$route.query.chapter
    if (chapterGuid) {
      const activeChapter = this.allChapters.find(chapter => chapter.guid === chapterGuid)
      if (activeChapter.archived) {
        this.filters.archived = true
      }

      this.selectChapter(this.allChapters.indexOf(activeChapter) || -1)
    }

    const workshopGuid = this.$route.query.workshop
    const workshopName = this.$route.query.workshopName
    if (workshopName && workshopGuid) {
      this.switchWorkshops()
      const activeWorkshop = this.allWorkshops.find(workshop => workshop.guid === workshopGuid)
      if (activeWorkshop.archived) {
        this.filters.archived = true
      }

      this.$refs.workshopList.selectWorkshopName(workshopName)
      this.$refs.workshopList.selectWorkshopGuid(workshopGuid)
    }

    this.$router.replace('/write')
  },
}
</script>

<style scoped>
.composer-wrap {
  display: flex;
  justify-content: center;
  min-height: 300px;
  width: 100%;
}

.composer {
  display: flex;
  flex: 1;
  max-width: 1500px;
}

.map-wrap {
  display: flex;
  height: 100%;
  margin-right: 20px;
  width: 160px;
  z-index: 25;
}

.editor-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-right: 20px;
  position: relative;
}

.below-tabs {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.stats {
  background-color: rgba(255, 255, 255, 0.9);
  bottom: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 100ms;
  width: 100%;
  z-index: 15;
}

.stats.active {
  opacity: 1;
}

.stats-content {
  height: 100%;
  padding: 12px;
  width: 100%;
}

.define {
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 15;

}

.sidebar-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  width: 300px;
}

.sidebar-content {
  overflow: auto;
}

.sidebar-options {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  min-height: 60px;
  max-height: 60px;
}

.plan-switch {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 35px;
  margin-bottom: 6px;
  margin-top: 6px;
}

.switch-label {
  align-items: center;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  fill: #888;
  flex-direction: column;
  font-size: 16px;
  margin: 0 4px;
  transition: color 100ms, fill 100ms;
}

.switch-label:hover {
  color: #000;
  fill: #000;
}

.switch-label.active {
  color: #000;
  fill: #000;
}

.switch-label-text {
  margin: 0 12px;
}

.archived-filter {
  align-items: center;
  align-self: flex-start;
  display: flex;
  flex-direction: row;
  margin-top: 8px;
}

.topic-list-wrap {
  overflow: auto;
}

/* MOBILE */
@media (max-width: 800px) {
  .map-wrap {
    display: none;
  }
}

@media (max-width: 700px) {
  .sidebar-wrap {
    display: none;
  }
}
</style>
