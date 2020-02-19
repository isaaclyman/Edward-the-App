<template>
  <div 
    class="magnifier-wrap" 
    :class="{ 'show': show }" 
    ref="wrap"
  >
    <div 
      class="magnifier" 
      ref="magnifier"
    >
      <div 
        class="magnifier-content map" 
        ref="magnifierContent"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cachedHtml: '',
      magnifyRadius: 50,
      scale: 5,
      show: false,
      wrapElBoundingClientRect: null,
    }
  },
  destroyed() {
    this.magnifyEl.removeEventListener('mousemove', this.mouseMove)
    this.magnifyEl.removeEventListener('mouseleave', this.mouseLeave)
  },
  methods: {
    getRelativeCoords(event, bounds) {
      // https://stackoverflow.com/a/33347664/4347245
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      return { x, y }
    },
    mouseLeave() {
      this.show = false
    },
    mouseMove(event) {
      if (this.cachedHtml !== this.html) {
        this.cachedHtml = this.html
      }

      let { x: magLeft, y: magTop } = this.getRelativeCoords(event, this.magnifyEl.getBoundingClientRect())
      magLeft = this.transformCoord(magLeft, 65)
      magTop = this.transformCoord(magTop, 30)

      const magnifierStyle = this.$refs.magnifier.style
      magnifierStyle.left = `${magLeft}px`
      magnifierStyle.top = `${magTop}px`

      let { y: wrapTop } = this.getRelativeCoords(event, this.wrapElBoundingClientRect)
      const wrapStyle = this.$refs.wrap.style
      wrapStyle.top = `${wrapTop - 60}px`

      this.show = true
    },
    refresh() {
      const clone = this.magnifyEl.cloneNode(true)
      const content = this.$refs.magnifierContent
      content.innerHTML = ''
      content.appendChild(clone)
    },
    transformCoord(value, adjust) {
      return -(value * this.scale) + adjust
    },
  },
  mounted() {
    const instance = this

    this.$nextTick(() => {
      this.wrapElBoundingClientRect = this.wrapEl.getBoundingClientRect()

      this.magnifyEl.addEventListener('mousemove', instance.mouseMove)
      this.magnifyEl.addEventListener('mouseleave', instance.mouseLeave)
    })
  },
  props: {
    html: {
      required: true,
      type: String,
    },
    magnifyEl: {
      required: true,
      type: null
    },
    mark: {
      required: true,
      type: String
    },
    wrapEl: {
      required: true,
      type: null
    },
  },
  watch: {
    cachedHtml() {
      this.refresh()
    },
    mark() {
      this.refresh()
    },
  },
}
</script>

<style scoped>
.magnifier-wrap {
  background-color: #FFF;
  border: 1px solid #CCC;
  height: 120px;
  left: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: opacity 100ms;
  width: 300px;
}

.magnifier-wrap.show {
  opacity: 1;
}

.magnifier {
  font-size: 2px;
  position: absolute;
  width: 145px;
}

.magnifier-content {
  transform: scale(5);
  transform-origin: top left;
}
</style>
