<template>
  <div class="magnifier-wrap" :class="{ 'show': show }" ref="wrap">
    <div class="magnifier" ref="magnifier"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cachedHtml: '',
      magnifyRadius: 50,
      scale: 2,
      show: false,
      wrapElBoundingClientRect: null
    }
  },
  destroyed () {
    this.magnifyEl.removeEventListener('mousemove', this.mouseMove)
    this.magnifyEl.removeEventListener('mouseleave', this.mouseLeave)
  },
  methods: {
    getRelativeCoords (event, bounds) {
      // https://stackoverflow.com/a/33347664/4347245
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      return { x, y }
    },
    mouseLeave () {
      this.show = false
    },
    mouseMove (event) {
      if (this.cachedHtml !== this.html) {
        this.cachedHtml = this.html
      }

      let { x: left, y: top } = this.getRelativeCoords(event, this.magnifyEl.getBoundingClientRect())
      left = -(left - 50)
      top = -(top - 50)

      const magnifierStyle = this.$refs.magnifier.style
      magnifierStyle.left = `${left}px`
      magnifierStyle.top = `${top}px`

      this.show = true
    },
    refresh () {
      const clone = this.magnifyEl.cloneNode(true)
      const magnifier = this.$refs.magnifier
      magnifier.innerHTML = ''
      magnifier.appendChild(clone)
    }
  },
  mounted () {
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
      type: String
    },
    magnifyEl: {
      required: true
    },
    mark: {
      required: true
    },
    wrapEl: {
      required: true
    }
  },
  watch: {
    cachedHtml () {
      this.refresh()
    },
    mark () {
      this.refresh()
    }
  }
}
</script>

<style scoped>
.magnifier-wrap {
  background-color: rgba(255,255,255,0.8);
  border: 1px solid #CCC;
  height: 100px;
  left: 170px;
  opacity: 0;  
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: opacity 250ms;
  width: 100px;
}

.magnifier-wrap.show {
  opacity: 0.9;
}

.magnifier {
  font-size: 2px;
  position: absolute;
  /* transform: scale(1); */
  width: 145px;
}

.magnifier /deep/ p {
  margin: 0;
  padding: 0.8px 2px;
}
</style>
