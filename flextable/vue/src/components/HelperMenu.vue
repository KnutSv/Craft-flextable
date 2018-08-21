<template>
  <div v-if="helperMenu" class="helper-menu" v-bind:style="`top: ${helperMenu.top}px; left: ${helperMenu.left}px;`">
    <button @click.prevent.stop="handle_add_col_after" class="helper-menu__button">{{ $t('HELPER_MENU_ADD_COLUMN_AFTER') }}</button>
    <button @click.prevent.stop="handle_add_col_before" class="helper-menu__button">{{ $t('HELPER_MENU_ADD_COLUMN_BEFORE') }}</button>
    <button @click.prevent.stop="handle_add_row_above" class="helper-menu__button">{{ $t('HELPER_MENU_ADD_ROW_ABOVE') }}</button>
    <button @click.prevent.stop="handle_add_row_below" class="helper-menu__button">{{ $t('HELPER_MENU_ADD_ROW_BELOW') }}</button>

    <button @click.prevent.stop="handle_align_cell_left" v-if="!alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_LEFT') }}</button>
    <button @click.prevent.stop="handle_align_cell_right" v-if="alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_RIGHT') }}</button>
    <button @click.prevent.stop="handle_align_col_left" v-if="!alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_COL_LEFT') }}</button>
    <button @click.prevent.stop="handle_align_col_right" v-if="alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_COL_RIGHT') }}</button>
    <button @click.prevent.stop="handle_align_row_left" v-if="!alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_ROW_LEFT') }}</button>
    <button @click.prevent.stop="handle_align_row_right" v-if="alignLeft" class="helper-menu__button">{{ $t('HELPER_MENU_ALIGN_ROW_RIGHT') }}</button>

    <button @click.prevent.stop="handle_delete_col" v-bind:disabled="colNum === 1" class="helper-menu__button">{{ $t('HELPER_MENU_DELETE_COLUMN') }}</button>
    <button @click.prevent.stop="handle_delete_row" v-bind:disabled="rowNum === 1" class="helper-menu__button">{{ $t('HELPER_MENU_DELETE_ROW') }}</button>
    <button @click.prevent.stop="handle_make_body_cell" v-if="isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_BODY_CELL') }}</button>
    <button @click.prevent.stop="handle_make_body_col" v-if="isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_BODY_COLUMN') }}</button>
    <button @click.prevent.stop="handle_make_body_row" v-if="isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_BODY_ROW') }}</button>
    <button @click.prevent.stop="handle_make_header_cell" v-if="!isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_HEADER_CELL') }}</button>
    <button @click.prevent.stop="handle_make_header_col" v-if="!isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_HEADER_COLUMN') }}</button>
    <button @click.prevent.stop="handle_make_header_row" v-if="!isHeader" class="helper-menu__button">{{ $t('HELPER_MENU_MAKE_HEADER_ROW') }}</button>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'helper-menu',
  computed: {
    ...mapState(['activeElmCol', 'activeElmRow', 'helperMenu']),
    ...mapGetters(['activeCell', 'colNum', 'rowNum']),
    activeCellTextAlign() {
      return this.activeCell && this.activeCell.align
    },
    alignLeft() {
      return this.activeCellTextAlign && this.activeCellTextAlign === 'left'
    },
    isHeader() {
      return this.helperMenu.type === 'TH'
    }
  },
  methods: {
    addCol(before) {
      this.$store.dispatch('addColumn', {
        index: this.activeElmCol,
        before: before
      })
    },
    addRow(before) {
      this.$store.dispatch('addRow', {
        index: this.activeElmRow,
        before: before
      })
    },
    changeAlignmentCell(direction, row, col) {
      this.$store.dispatch('setCellAlignment', {
        rowIndex: row != null ? row : this.activeElmRow,
        colIndex: col != null ? col : this.activeElmCol,
        align: direction
      })
      this.$store.commit('resetHelperMenu')
    },
    changeAlignmentCol(direction) {
      for (var i = 0; i < this.rowNum; i++) {
        this.changeAlignmentCell(direction, i)
      }
    },
    changeAlignmentRow(direction) {
      for (var i = 0; i < this.colNum; i++) {
        this.changeAlignmentCell(direction, this.activeElmRow, i)
      }
    },
    changeCellType(type, row, col) {
      this.$store.dispatch('setCellType', {
        rowIndex: row != null ? row : this.activeElmRow,
        colIndex: col != null ? col : this.activeElmCol,
        type: type
      })
      this.$store.commit('resetHelperMenu')
    },
    changeCol(type) {
      for (var i = 0; i < this.rowNum; i++) {
        this.changeCellType(type, i)
      }
    },
    changeRow(type) {
      for (var i = 0; i < this.colNum; i++) {
        this.changeCellType(type, this.activeElmRow, i)
      }
    },
    handle_add_col_after() {
      // @param: false = do not add before current column
      this.addCol(false)
    },
    handle_add_col_before() {
      // @param: true = add before current column
      this.addCol(true)
      // When we insert a col before we need to update the active col index or else it will "move"
      this.$store.commit('setActiveCol', this.activeElmCol + 1)
    },
    handle_add_row_above() {
      this.addRow(true)
      //this.$store.commit('setActiveRow', this.activeElmRow + 1)
    },
    handle_add_row_below() {
      this.addRow(false)
    },
    handle_align_cell_left() {
      this.changeAlignmentCell('left')
    },
    handle_align_cell_right() {
      this.changeAlignmentCell('right')
    },
    handle_align_col_left() {
      this.changeAlignmentCol('left')
    },
    handle_align_col_right() {
      this.changeAlignmentCol('right')
    },
    handle_align_row_left() {
      this.changeAlignmentRow('left')
    },
    handle_align_row_right() {
      this.changeAlignmentRow('right')
    },
    handle_delete_col() {
      if( window.confirm( this.$t('CONFIRM_DELETE_COLUMN') ) ) {
        this.$store.dispatch('deleteColumn', this.activeElmCol)
      }
    },
    handle_delete_row() {
      if( window.confirm( this.$t('CONFIRM_DELETE_ROW') ) ) {
        this.$store.dispatch('deleteRow', this.activeElmRow)
      }
    },
    handle_make_body_cell() {
      this.changeCellType('td')
    },
    handle_make_body_col() {
      this.changeCol('td')
    },
    handle_make_body_row() {
      this.changeRow('td')
    },
    handle_make_header_cell() {
      this.changeCellType('th')
    },
    handle_make_header_col() {
      this.changeCol('th')
    },
    handle_make_header_row() {
      this.changeRow('th')
    }
  }
}
</script>
<style lang="scss" scoped>
  $gray: #e3e5e8;
  $light-gray: #f7f7f8;

  .helper-menu {
    position: absolute;
    z-index: 1000;
    border: 1px solid $gray;
    background-color: $light-gray;
    -webkit-box-shadow: 0 0 2px $gray;
    -moz-box-shadow: 0 0 2px $gray;
    box-shadow: 0 0 2px $gray;
  }

    .helper-menu__button {
      display: block;
      border: 0;
      border-radius: 0;
      padding: 0 8px;
      width: 100%;
      text-align: left;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      line-height: 24px;

      & + & {
        border-top: 1px solid $gray;
      }
    }
</style>
