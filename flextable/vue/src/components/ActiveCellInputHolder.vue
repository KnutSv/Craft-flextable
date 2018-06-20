<template>
  <div class="input-holder" :style="{top, left, width, height}" @click.stop="">
    <vue-editor :editorOptions="{modules: {toolbar: '#flextable-editor-toolbar'}}" @click.stop="keepData = true" @focus="focusIn" @blur="focusOut" @input="update()" ref="input"></vue-editor>
  </div>
  <!-- <textarea v-model="value" class="input-holder" :style="{top, left, width, height}" @click.stop="keepData = true" @focus="focusIn" @blur="focusOut" @input="update()" ref="input"></textarea> -->
</template>

<script>
import { VueEditor } from 'vue2-editor'

export default {
  name: 'active-cell-input-holder',
  props: {
    heightInt: {
      type: Number,
      required: true
    },
    leftInt: {
      type: Number,
      required: true
    },
    topInt: {
      type: Number,
      required: true
    },
    widthInt: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      hasFocus: false,
      heightPadding: 6,
      keepData: true,
      widthPadding: 12,
      value: ''
    }
  },
  computed: {
    activeElmCol() {
      return this.$store.state.activeElmCol
    },
    activeElmRow() {
      return this.$store.state.activeElmRow
    },
    height() {
      return `${this.heightInt - (this.heightPadding * 2) - 1}px`
    },
    left() {
      return `${this.leftInt + 2}px`
    },
    top() {
      return `${this.topInt + 2}px`
    },
    width() {
      return `${this.widthInt - (this.widthPadding * 2) - 1}px`
    }
  },
  components: {
    VueEditor
  },
  methods: {
    checkKey(event) {
      const arrowKeys = {
        ArrowUp: 'moveUp',
        ArrowRight: 'moveRight',
        ArrowDown: 'moveDown',
        ArrowLeft: 'moveLeft'
      }

      // If arrow keys are pressed choose the corresponding arrow key action
      if( Object.keys(arrowKeys).includes(event.key)) {
        event.preventDefault()
        this.$refs.input.quill.blur()
        this.$store.dispatch(arrowKeys[event.key])
      // Else tab through the cells, if shift is presses simultaneously move in other direction
      } else if( event.key === 'Tab' ) {
        event.preventDefault()
        this.$refs.input.quill.blur()
        this.$store.dispatch('next', !event.shiftKey)
      // Else if the textarea does not have focus, give it focus
      } else if(this.$refs.input !== document.activeElement) {
        this.keepData = false
        this.$refs.input.quill.focus()
      }
    },
    checkKeyUp(event) {

    },
    focusIn() {
      console.log(this.hasFocus)
      if( !this.hasFocus ) {

      } else {
        this.value = this.keepData ? this.$store.getters.activeCellContent : ''
        this.$refs.input.quill.setText(this.value)
        this.hasFocus = true
      }
    },
    focusOut() {
      console.log('focusout')
      this.value = ''
      this.keepData = true
      this.hasFocus = false
    },
    update() {
      this.$store.dispatch('setContent', this.$refs.input.quill.getText())
    }
  },
  mounted() {
    //window.addEventListener('keydown', this.checkKey)
  },
  beforeDestroy() {
    //window.removeEventListener('keydown', this.checkKey)
  }
}
</script>
<style lang="scss" scoped>
  .input-holder {
    position: absolute;
    border: 0;
    padding: 6px 12px;
    background: transparent;
    font-size: 15px;
    line-height: 24px;

    &:focus {
      outline: 0;
      background-color: #ecf2f9;
    }
  }
</style>
