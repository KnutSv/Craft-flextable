<template>
  <div v-if="id" :id="`flextable_${_uid}`">
    <input type="hidden" :id="id" :name="name" :value="JSON.stringify(data)">

    <init v-if="isEmpty" v-bind:id="id"></init>
    <div v-else>
      <div>
        <label v-bind:for="`caption_input_${_uid}`">{{ $t('CAPTION') }}</label>
        <input v-bind:value="caption" v-bind:id="`caption_input_${_uid}`" @input="updateCaption" class="text fullwidth" type="text">
      </div>
      <div style="margin-bottom: 16px;">
        <button @click.stop.prevent="addColumn">{{ $t('ADD_COLUMN') }}</button>
        <button @click.stop.prevent="addRow">{{ $t('ADD_ROW') }}</button>
      </div>
      <div id="flextable-editor-toolbar"></div>
      <div class="flextable-content">
        <div class="flextable-content-overflow">
          <table class="flextable">
            <tr v-for="(row, rowIndex) in rows">
              <template v-for="(cell, colIndex) in row">
                <th v-if="cell.type === 'th'" v-html="format(cell.text)" :class="{'align--right': cell.align == 'right', 'flextable__cell': true, 'flextable__cell--active': isActiveCell(rowIndex, colIndex)}" :ref="`cell_${rowIndex}_${colIndex}`" @click.stop="select(rowIndex, colIndex)" @click.right.prevent="helperMenu($event, rowIndex, colIndex)"></th>
                <td v-else v-html="format(cell.text)" :class="{'align--right': cell.align == 'right', 'flextable__cell': true, 'flextable__cell--active': isActiveCell(rowIndex, colIndex)}" :ref="`cell_${rowIndex}_${colIndex}`" @click.stop="select(rowIndex, colIndex)"  @click.right.prevent="helperMenu($event, rowIndex, colIndex)"></td>
              </template>
            </tr>
          </table>
          <active-cell-marker :activeElm="activeElm" :id="id"></active-cell-marker>
        </div>
        <helper-menu :id="id"></helper-menu>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import ActiveCellMarker from './components/ActiveCellMarker.vue'
import HelperMenu from './components/HelperMenu.vue'
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
/*    ...mapState(this.namespace, {
      activeElmCol: state => state.activeElmCol,
      activeElmRow: state => state.activeElmRow,
      meta: state => state.meta,
    }),*/
    ...mapState(['activeTable', 'activeElmCol', 'activeElmRow']),
    data() {
      return this.$store.getters['data'](this.id)
    },
    caption() {
      return this.data && this.data.meta.caption
    },
    activeElm() {
      const ref = `cell_${this.activeElmRow}_${this.activeElmCol}`
      const elm = this.$refs.hasOwnProperty(ref) ? this.$refs[ref][0] : null

      if(elm) {
        this.activeElmOldContent = elm.textContent
      }
      return elm
    },
    isEmpty() {
      return this.$store.getters['isEmpty'](this.id)
    },
    rows() {
      return this.data && this.data.thead.concat(this.data.tbody)
    }
  },
  components: {
    ActiveCellMarker,
    HelperMenu,
    Init
  },
  methods: {
    addColumn() {
      this.$store.dispatch('addColumn', {
        tableName: this.id,
        index: this.$store.getters['colNum'](this.id) - 1,
      })
    },
    addRow() {
      this.$store.dispatch('addRow', {
        tableName: this.id,
        index: this.$store.getters['rowNum'](this.id) - 1,
      })
    },
    checkKey(event) {
      if(event.key === 'Escape') {
        this.resetActive(false)
      }
    },
    format(string) {
      return string
      //return string.replace(/(?:\r\n|\r|\n)/g, '<br>')
    },
    helperMenu(event, rowIndex, colIndex) {
      //console.log(event.target.tagName)
      this.$store.commit('setHelperMenu', {
        type: event.target.tagName,
        top: event.layerY,
        left: event.layerX
      })
      this.select(rowIndex, colIndex, true)
    },
    isActiveCell(rowIndex, colIndex) {
      return this.activeTable === this.id && rowIndex === this.activeElmRow && colIndex === this.activeElmCol
    },
    resetActive(update = true) {
      if(!update) {
        this.$store.dispatch('setContent', this.activeElmOldContent)
      }
      this.$store.commit('resetHelperMenu')
      this.$store.commit('setActiveRow', null)
      this.$store.commit('setActiveCol', null)
      this.activeElmOldContent = ''
    },
    select(rowIndex, colIndex, keepMenu) {
      if( !keepMenu ) {
        this.$store.commit('resetHelperMenu')
      }

      this.$store.commit('setActiveTable', this.id)
      this.$store.commit('setActiveRow', rowIndex)
      this.$store.commit('setActiveCol', colIndex)
    },
    updateCaption(event) {
      this.$store.commit('setCaption', {
        tableName: this.id,
        value: event.target.value
      })
    }
  },
  mounted() {
    this.$store.commit('init', {
      tableName: this.id,
      value: this.value
    })
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
  }

    .flextable-content-overflow {
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
