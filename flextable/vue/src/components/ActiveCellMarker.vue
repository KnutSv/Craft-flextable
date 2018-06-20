<template>
  <div v-if="activeElm">
    <div class="marker marker--h" :style="{top, left, width}"></div>
    <div class="marker marker--v" :style="{top, left: right, height}"></div>
    <div class="marker marker--h" :style="{top: bottom, left, width}"></div>
    <div class="marker marker--v" :style="{top, left, height}"></div>
    <active-cell-input-holder :heightInt="heightInt" :leftInt="leftInt" :topInt="topInt" :widthInt="widthInt" @click.stop="test"></active-cell-input-holder>
  </div>
</template>

<script>
import debounce from 'debounce'

import ActiveCellInputHolder from './ActiveCellInputHolder.vue'

export default {
  name: 'active-cell-marker',
  props: {
    activeElm: {
      type: HTMLElement,
      required: false
    }
  },
  data() {
    return {
      windowWidth: window.innerWidth
    }
  },
  computed: {
    bottom() {
      return `${this.bottomInt}px`
    },
    bottomInt() {
      return this.topInt + this.activeElm.offsetHeight + 1
    },
    height() {
      return `${this.heightInt + 3}px`
    },
    heightInt() {
      const windowWidth = this.windowWidth
      const activeCellContent = this.$store.getters.activeCellContent
      return this.activeElm.offsetHeight
    },
    left() {
      return `${this.leftInt}px`
    },
    leftInt() {
      const windowWidth = this.windowWidth
      const activeCellContent = this.$store.getters.activeCellContent
      return this.activeElm.offsetLeft
    },
    right() {
      return `${this.rightInt}px`
    },
    rightInt() {
      return this.leftInt + this.activeElm.offsetWidth + 1
    },
    top() {
      return `${this.topInt}px`
    },
    topInt() {
      const windowWidth = this.windowWidth
      const activeCellContent = this.$store.getters.activeCellContent
      return this.activeElm.offsetTop
    },
    width() {
      return `${this.widthInt + 3}px`
    },
    widthInt() {
      const windowWidth = this.windowWidth
      const activeCellContent = this.$store.getters.activeCellContent
      return this.activeElm.offsetWidth
    }
  },
  components: {
    ActiveCellInputHolder
  },
  methods: {
    setWindowWidth: debounce(function() {
      console.log(window.innerWidth)
      this.windowWidth = window.innerWidth
    }, 200)
  },
  mounted() {
    window.addEventListener('resize', this.setWindowWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setWindowWidth)
  }
}
</script>
<style lang="scss" scoped>
  .marker {
    position: absolute;
    background-color: #0d78f2;
  }

  .marker--h {
    height: 2px;
  }

  .marker--v {
    width: 2px;
  }
</style>
