<template>
  <div :id="`flextable_${_uid}`">
    <input type="hidden" :id="id" :name="name" :value="JSON.stringify(data)">

    <init v-if="$store.getters.isEmpty"></init>
    <div v-else>
      <div style="margin-bottom: 16px;">
        <button @click.stop.prevent="$store.dispatch('addColumn')">{{ $t('ADD_COLUMN') }}</button>
        <button @click.stop.prevent="$store.dispatch('addRow')">{{ $t('ADD_ROW') }}</button>
      </div>
      <div id="flextable-editor-toolbar"></div>
      <div class="flextable-content">
        <table class="flextable">
          <tr v-for="(row, rowIndex) in rows">
            <template v-for="(cell, colIndex) in row">
              <th v-if="cell.type === 'th'" v-html="format(cell.text)" v-bind:class="{'align--right': cell.align == 'right', 'flextable__cell': true, 'flextable__cell--active': isActiveCell(rowIndex, colIndex)}" :ref="`cell_${rowIndex}_${colIndex}`" @click.stop="select(rowIndex, colIndex)"></th>
              <td v-else v-html="format(cell.text)" v-bind:class="{'align--right': cell.align == 'right', 'flextable__cell': true, 'flextable__cell--active': isActiveCell(rowIndex, colIndex)}" :ref="`cell_${rowIndex}_${colIndex}`" @click.stop="select(rowIndex, colIndex)"></td>
            </template>
          </tr>
        </table>
        <active-cell-marker v-bind:activeElm="activeElm"></active-cell-marker>
      </div>
    </div>
  </div>
</template>

<script>
import ActiveCellMarker from './components/ActiveCellMarker.vue'
import Init from './components/Init.vue'

export default {
  name: 'flextable',
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      activeElmOldContent: ''
    }
  },
  computed: {
    activeElm() {
      const ref = `cell_${this.activeElmRow}_${this.activeElmCol}`
      const elm = this.$refs.hasOwnProperty(ref) ? this.$refs[ref][0] : null
      if(elm) {
        this.activeElmOldContent = elm.textContent
      }
      return elm
    },
    activeElmCol() {
      return this.$store.state.activeElmCol
    },
    activeElmRow() {
      return this.$store.state.activeElmRow
    },
    data() {
      return this.$store.getters.data
    },
    rows() {
      return this.data.thead.concat(this.data.tbody)
    }
  },
  components: {
    ActiveCellMarker,
    Init
  },
  methods: {
    checkKey(event) {
      if(event.key === 'Escape') {
        this.resetActive(false)
      }
    },
    format(string) {
      return string
      //return string.replace(/(?:\r\n|\r|\n)/g, '<br>')
    },
    isActiveCell(rowIndex, colIndex) {
      return rowIndex === this.activeElmRow && colIndex === this.activeElmCol
    },
    resetActive(update = true) {
      if(!update) {
        this.$store.dispatch('setContent', this.activeElmOldContent)
      }

      this.$store.commit('setActiveRow', null)
      this.$store.commit('setActiveCol', null)
      this.activeElmOldContent = ''
    },
    select(rowIndex, colIndex) {
      this.$store.commit('setActiveRow', rowIndex)
      this.$store.commit('setActiveCol', colIndex)
    }
  },
  mounted() {
    this.$store.commit('init', this.value)
    window.addEventListener('click', this.resetActive)
    window.addEventListener('keydown', this.checkKey)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.resetActive)
    window.removeEventListener('keydown', this.checkKey)
  }
}
</script>

<style lang="scss" scoped>
  .align--left {
    text-align: left;
  }
  .align--center {
    text-align: center;
  }
  .align--right {
    text-align: right;
  }

  .flextable-content {
    position: relative;
    margin: -1px;
    padding: 1px;
    overflow: auto;
  }

  .fextable .flextable__cell {
    transition: background-color 0.2s;
  }

  .flextable .flextable__cell--active {
    background-color: #ecf2f9;
  }
</style>
