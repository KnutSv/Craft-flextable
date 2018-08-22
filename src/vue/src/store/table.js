import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeElmCol: null,
    activeElmRow: null,
    helperMenu: null,
    meta: {
      caption: ''
    },
    tbody: [],
    tfoot: [],
    thead: []
  },
  getters: {
    activeCell( state, getters ) {
      if( state.activeElmCol == null ||state.activeElmRow == null ) { return null }
      return state[getters.getRowPart()][getters.getRowIndex()][state.activeElmCol]
    },
    activeCellContent( state, getters ) {
      return getters.activeCell && getters.activeCell.text
    },
    colNum( state ) {
      return state.tbody.length ? state.tbody[0].length : state.thead.length ? state.thead[0].length : 0
    },
    data( state ) {
      return {
        thead: state.thead,
        tbody: state.tbody,
        tfoot: state.tfoot,
        meta: state.meta
      }
    },
    getRowIndex: ( state, getters ) => ( rowIndex = state.activeElmRow ) => {
      return getters.isRowInHeader(rowIndex) ? rowIndex : rowIndex - state.thead.length
    },
    getRowPart: ( state, getters ) => ( rowIndex = state.activeElmRow ) => {
      return getters.isRowInHeader(rowIndex) ? 'thead' : 'tbody'
    },
    isColInHeader: ( state ) => ( colIndex = state.activeElmCol) => {
      return state.tbody.length && state.tbody[0].length > colIndex ? state.tbody[0][colIndex].type === 'th' : false
    },
    isEmpty( state ) {
      return !state.thead.length && !state.tbody.length
    },
    isFirstCol: ( state, getters ) => ( colIndex = state.activeElmCol ) => {
      return colIndex === 0
    },
    isFirstRow: ( state, getters ) => ( rowIndex = state.activeElmCol ) => {
      return rowIndex === 0
    },
    isLastCol: ( state, getters ) => ( colIndex = state.activeElmCol ) => {
      return colIndex === (getters.colNum - 1)
    },
    isLastRow: ( state, getters ) => ( rowIndex = state.activeElmCol ) => {
      return rowIndex === getters.rowNum - 1
    },
    isRowInHeader: ( state ) => ( rowIndex = state.activeElmRow) => {
      return rowIndex <= state.thead.length - 1
    },
    makeCell: (state) => (text = '', type = 'td', align = 'left') => {
      return { type, text, align }
    },
    rowNum( state ) {
      return state.thead.length + state.tbody.length
    }
  },
  mutations: {
    addBodyRow(state, options) {
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset
      state.tbody.splice(index, 0, options.row)
    },
    addColumn(state, options) {
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset

      state.thead.map( row => row.splice( index, 0, Object.assign({}, options.thCell) ) )
      state.tbody.map( row => row.splice( index, 0, Object.assign({}, options.cell) ) )
      state.tfoot.map( row => row.splice( index, 0, Object.assign({}, options.cell) ) )
    },
    addHeaderRow(state, options) {
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset
      state.thead.splice(index, 0, options.row)
    },
    init(state, data) {
      if( !data ) {
        return false
      }

      const attributes = ['thead', 'tbody', 'tfoot', 'meta']

      attributes.forEach(attribute => {
        if(data.hasOwnProperty(attribute)) {
          state[attribute] = data[attribute]
        }
      })
    },
    removeBodyRow(state, index) {
      state.tbody.splice(index, 1)

      // Reset active since often causes issues
      state.activeElmCol = null
      state.activeElmRow = null
      state.helperMenu = null
    },
    removeColumn(state, index) {
      state.thead = state.thead.map(row => {
        return row.filter((col, colIndex) => colIndex !== index)
      })

      state.tbody = state.tbody.map(row => {
        return row.filter((col, colIndex) => colIndex !== index)
      })

      if( state.tbody.length === 0 ) {
        state.activeElmCol = null
        state.activeElmRow = null
        state.helperMenu = null
      } else if( index >= state.tbody.length - 1 ) {
        state.activeElmCol = state.tbody.length - 2
      }
    },
    removeHeaderRow(state, index) {
      state.thead.splice(index, 1)

      // Reset active since often causes issues
      state.activeElmCol = null
      state.activeElmRow = null
      state.helperMenu = null
    },
    resetHelperMenu(state) {
      state.helperMenu = null
    },
    setActiveCol(state, colIndex) {
      state.activeElmCol = colIndex
    },
    setActiveRow(state, rowIndex) {
      state.activeElmRow = rowIndex
    },
    setCaption(state, caption) {
      state.meta.caption = caption
    },
    setCellAlignBody(state, data) {
      Vue.set(state.tbody[data.rowIndex][data.colIndex], 'align', data.align)
    },
    setCellAlignHeader(state, data) {
      Vue.set(state.thead[data.rowIndex][data.colIndex], 'align', data.align)
    },
    setCellTypeBody(state, data) {
      Vue.set(state.tbody[data.rowIndex][data.colIndex], 'type', data.type)
    },
    setCellTypeHeader(state, data) {
      Vue.set(state.thead[data.rowIndex][data.colIndex], 'type', data.type)
    },
    setContent(state, data) {
      if( !('part' in data)  || !(data.part in state) || !('row' in data) || !('col' in data) ) { return }

      Vue.set(state[data.part][data.row][data.col], 'text', data.text )
    },
    setHelperMenu(state, data) {
      state.helperMenu = {
        type: data.type,
        top: data.top,
        left: data.left
      }
    }
  },
  actions: {
    addColumn({ commit, getters }, options) {
      const defaultOptions = {
        index: getters.colNum - 1, // Default index is last index,
        before: false
      }
      options = Object.assign(defaultOptions, options)

      options.cell = getters.makeCell()
      options.thCell = getters.makeCell('', 'th')

      commit('addColumn', options)
    },
    addRow({ commit, getters }, options) {
      const defaultOptions = {
        index: getters.RowNum - 1, // Default index is last index,
        before: false
      }

      options = Object.assign(defaultOptions, options)
      options.header = getters.isRowInHeader(options.index)

      options.index = getters.getRowIndex(options.index)

      options.row = []

      for (var j = 0; j < getters.colNum; j++) {
        options.row.push(getters.makeCell('', options.header || getters.isColInHeader(j) ? 'th' : 'td'))
      }

      commit(options.header ? 'addHeaderRow' : 'addBodyRow', options)
    },
    deleteColumn({ commit, getters}, colIndex) {
      commit('removeColumn', colIndex)
    },
    deleteRow({ commit, getters}, rowIndex) {
      commit(getters.isRowInHeader(rowIndex) ? 'removeHeaderRow' : 'removeBodyRow', getters.getRowIndex(rowIndex))
    },
    initTable({ commit, state, getters }, options) {
      const initCols = options.cols || 2
      const initRows = options.rows || 3

      if( options.mode === 'top' ) {
        let headerRow = []
        for (var j = 0; j < initCols; j++) {
          headerRow.push(getters.makeCell('', 'th'))
        }
        commit('addHeaderRow', {
          index: 0,
          row: headerRow
        })

        for (var i = 0; i < initRows - 1; i++) {
          let row = []

          for (var j = 0; j < initCols; j++) {
            row.push(getters.makeCell())
          }

          commit('addBodyRow', {
            index: i,
            row: row
          })
        }
      } else if( options.mode === 'left' ) {
        for (var i = 0; i < initRows; i++) {
          let row = []

          for (var j = 0; j < initCols; j++) {
            const cell = j === 0 ? getters.makeCell('', 'th') : getters.makeCell()
            row.push(cell)
          }

          commit('addBodyRow', {
            index: i,
            row: row
          })
        }
      } else {
        for (var i = 0; i < initRows; i++) {
          let row = []

          for (var j = 0; j < initCols; j++) {
            row.push(getters.makeCell())
          }

          commit('addBodyRow', {
            index: i,
            row: row
          })
        }
      }
    },
    moveDown({ commit, state, getters }) {
      let activeRow = state.activeElmRow
      const row = getters.isLastRow(activeRow) ? 0 : activeRow + 1
      commit('setActiveRow', row)
    },
    moveLeft({ dispatch }) {
      dispatch('next', false)
    },
    moveRight({ dispatch }) {
      dispatch('next', true)
    },
    moveUp({ commit, state, getters }) {
      let activeRow = state.activeElmRow
      const row = getters.isFirstRow(activeRow) ? getters.rowNum - 1 : activeRow - 1
      commit('setActiveRow', row)
    },
    next({ commit, state, getters }, forwards = true) {
      let activeCol = state.activeElmCol
      let activeRow = state.activeElmRow
      const isLastCol = getters.isLastCol(activeCol)
      const isFirstCol = getters.isFirstCol(activeCol)

      const col = forwards ? ( isLastCol ? 0 : activeCol + 1 ) : ( isFirstCol ? getters.colNum - 1 : activeCol - 1 )
      // If the active cell is at the bottom right, move row to top
      // else if the col is to the far right move to next row
      // else stay at the same row
      const row = forwards ? ( isLastCol && getters.isLastRow(activeRow) ? 0 : isLastCol ? activeRow + 1 : activeRow ) : ( isFirstCol && getters.isFirstRow(activeRow) ? getters.rowNum - 1 : isFirstCol ? activeRow - 1 : activeRow )

      commit('setActiveCol', col)

      if( row != state.activeElmRow ) {
        commit('setActiveRow', row)
      }
    },
    setCellAlignment({ commit, getters }, options) {
      if( options && options.rowIndex !== null && options.colIndex !== null && options.align !== null ) {
        options.header = getters.isRowInHeader(options.rowIndex)
        options.rowIndex = options.header ? options.rowIndex : getters.getRowIndex(options.rowIndex)
        commit(options.header ? 'setCellAlignHeader' : 'setCellAlignBody', options)
      }
    },
    setCellType({ commit, getters }, options) {
      if( options && options.rowIndex !== null && options.colIndex !== null && options.type !== null ) {
        options.header = getters.isRowInHeader(options.rowIndex)
        options.rowIndex = options.header ? options.rowIndex : getters.getRowIndex(options.rowIndex)
        commit(options.header ? 'setCellTypeHeader' : 'setCellTypeBody', options)
      }
    },
    setContent({ commit, state, getters }, text) {
      commit('setContent', {
        part: getters.getRowPart(),
        row: getters.getRowIndex(),
        col: state.activeElmCol,
        text: text
      })
    }
  }
})
