import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeElmCol: null,
    activeElmRow: null,
    activeTable: null,
    helperMenu: null,
    data: {}
  },
  getters: {
    activeCell( state, getters ) {
      if( state.activeElmCol == null ||state.activeElmRow == null ) { return null }
      const data = getters.data()
      return data && data[getters.getRowPart()][getters.getRowIndex()][state.activeElmCol]
    },
    activeCellContent( state, getters ) {
      return getters.activeCell && getters.activeCell.text
    },
    colNum: ( state, getters ) => ( tableName = state.activeTable ) => {
      const data = getters.data( tableName )
      return data && data.tbody.length ? data.tbody[0].length : data.thead.length ? data.thead[0].length : 0
    },
    data: ( state ) => ( tableName = state.activeTable ) => {
      return state.data.hasOwnProperty(tableName) && state.data[tableName]
    },
    getRowIndex: ( state, getters ) => ( rowIndex = state.activeElmRow, tableName = state.tableName ) => {
      const data = getters.data( tableName )
      return data && getters.isRowInHeader( rowIndex, tableName ) ? rowIndex : rowIndex - data.thead.length
    },
    getRowPart: ( state, getters ) => ( rowIndex = state.activeElmRow, tableName = state.tableName ) => {
      return getters.isRowInHeader( rowIndex, tableName ) ? 'thead' : 'tbody'
    },
    isColInHeader: ( state, getters ) => ( colIndex = state.activeElmCol, tableName = state.tableName) => {
      const data = getters.data( tableName )
      return data && data.tbody.length && data.tbody[0].length > colIndex ? data.tbody[0][colIndex].type === 'th' : false
    },
    isEmpty: ( state, getters ) => ( tableName = state.activeTable ) => {
      const data = getters.data( tableName )

      return !data || ( (!data.tbody || !data.tbody.length ) && ( !data.thead || !data.thead.length ) )
    },
    isFirstCol: ( state ) => ( colIndex = state.activeElmCol ) => {
      return colIndex === 0
    },
    isFirstRow: ( state ) => ( rowIndex = state.activeElmCol ) => {
      return rowIndex === 0
    },
    isLastCol: ( state, getters ) => ( colIndex = state.activeElmCol, tableName = state.activeTable ) => {
      return colIndex === (getters.colNum( tableName ) - 1)
    },
    isLastRow: ( state, getters ) => ( rowIndex = state.activeElmCol, tableName = state.activeTable ) => {
      return rowIndex === getters.rowNum( tableName ) - 1
    },
    isRowInHeader: ( state, getters ) => ( rowIndex = state.activeElmRow, tableName = state.activeTable ) => {
      const data = getters.data( tableName )
      return data && rowIndex <= data.thead.length - 1
    },
    makeCell: (state) => (text = '', type = 'td', align = 'left') => {
      return { type, text, align }
    },
    rowNum: ( state, getters ) => ( tableName = state.activeTable )  => {
      const data = getters.data( tableName )
      return data && data.thead.length + data.tbody.length
    }
  },
  mutations: {
    addBodyRow(state, options) {
      if( !options.tableName ) { return null }
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset
      state.data[options.tableName].tbody.splice(index, 0, options.row)
    },
    addColumn(state, options) {
      if( !options.tableName ) { return null }
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset

      state.data[options.tableName].thead.map( row => row.splice( index, 0, Object.assign({}, options.thCell) ) )
      state.data[options.tableName].tbody.map( row => row.splice( index, 0, Object.assign({}, options.cell) ) )
      state.data[options.tableName].tfoot.map( row => row.splice( index, 0, Object.assign({}, options.cell) ) )
    },
    addHeaderRow(state, options) {
      if( !options.tableName ) { return null }
      const offset = options.offset || options.before ? 0 : 1
      // If the cell is to be added before, we add 0 making the cell take the current index's place
      // otherwise the cell is to be added after the selected cell and we add 1 (+Boolean => Int)
      const index = options.index + offset
      state.data[options.tableName].thead.splice(index, 0, options.row)
    },
    init(state, data) {
      if( !data || !data.hasOwnProperty('tableName') || !data.hasOwnProperty('value') ) {
        return false
      }

      const defaultValues = {
        thead: [],
        tbody: [],
        tfoot: [],
        meta: {
          caption: ''
        }
      }

      let newData = {}

      Object.keys(defaultValues).forEach(attribute => {
        if(data.value && data.value.hasOwnProperty(attribute)) {
          newData[attribute] = data.value[attribute]
        }
      })

      Vue.set(state.data, data.tableName, Object.assign(defaultValues, newData))
    },
    removeBodyRow(state, options) {
      state.data[options.tableName].tbody.splice(options.row, 1)

      // Reset active since often causes issues
      state.activeElmCol = null
      state.activeElmRow = null
      state.helperMenu = null
    },
    removeColumn(state, options) {
      const table = state.data[options.tableName]

      table.thead = table.thead.map(row => {
        return row.filter((col, colIndex) => colIndex !== options.col)
      })

      table.tbody = table.tbody.map(row => {
        return row.filter((col, colIndex) => colIndex !== options.col)
      })

      if( table.tbody.length === 0 ) {
        state.activeElmCol = null
        state.activeElmRow = null
        state.helperMenu = null
      } else if( options.col >= state.tbody.length - 1 ) {
        state.activeElmCol = state.tbody.length - 2
      }
    },
    removeHeaderRow(state, options) {
      state.data[options.tableName].thead.splice(options.row, 1)

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
    setActiveTable(state, tableName) {
      state.activeTable = tableName
    },
    setCaption(state, options) {
      if(!options.tableName) {return false}
      Vue.set(state.data[options.tableName].meta, 'caption', options.value.toString())
    },
    setCellAlignBody(state, data) {
      Vue.set(state.data[data.tableName].tbody[data.rowIndex][data.colIndex], 'align', data.align)
    },
    setCellAlignHeader(state, data) {
      Vue.set(state.data[data.tableName].thead[data.rowIndex][data.colIndex], 'align', data.align)
    },
    setCellTypeBody(state, data) {
      Vue.set(state.data[data.tableName].tbody[data.rowIndex][data.colIndex], 'type', data.type)
    },
    setCellTypeHeader(state, data) {
      Vue.set(state.data[data.tableName].thead[data.rowIndex][data.colIndex], 'type', data.type)
    },
    setContent(state, data) {
      if( !('part' in data)  || !(data.part in state.data[data.tableName]) || !('row' in data) || !('col' in data) ) { return }

      Vue.set(state.data[data.tableName][data.part][data.row][data.col], 'text', data.text )
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
    addColumn({ commit, state, getters }, options) {
      const defaultOptions = {
        index: getters.colNum() - 1, // Default index is last index,
        before: false,
        tableName: state.activeTable
      }
      options = Object.assign(defaultOptions, options)

      options.cell = getters.makeCell()
      options.thCell = getters.makeCell('', 'th')

      commit('addColumn', options)
    },
    addRow({ commit, state, getters }, options) {
      const defaultOptions = {
        index: getters.rowNum() - 1, // Default index is last index,
        before: false,
        tableName: state.activeTable
      }

      options = Object.assign(defaultOptions, options)
      options.header = getters.isRowInHeader(options.index, options.tableName)

      options.index = getters.getRowIndex(options.index, options.tableName)

      options.row = []

      for (var j = 0; j < getters.colNum(options.tableName); j++) {
        options.row.push(getters.makeCell('', options.header || getters.isColInHeader(j, options.tableName) ? 'th' : 'td'))
      }

      commit(options.header ? 'addHeaderRow' : 'addBodyRow', options)
    },
    deleteColumn({ commit, getters}, options) {
      if( !options.tableName ) { return false }
      commit('removeColumn', options)
    },
    deleteRow({ commit, getters}, options) {
      if( !options.tableName ) { return false }
      commit(getters.isRowInHeader(options.row, options.tableName) ? 'removeHeaderRow' : 'removeBodyRow', {
        tableName: options.tableName,
        row: getters.getRowIndex(options.row, options.tableName)
      })
    },
    initTable({ commit, state, getters }, options) {
      if( !options.tableName ) { return null }

      const initCols = options.cols || 2
      const initRows = options.rows || 3
      const tableName = options.tableName

      console.log(options)

      if( options.mode === 'top' ) {
        let headerRow = []
        for (var j = 0; j < initCols; j++) {
          headerRow.push(getters.makeCell('', 'th'))
        }
        commit('addHeaderRow', {
          tableName: tableName,
          index: 0,
          row: headerRow
        })

        for (var i = 0; i < initRows - 1; i++) {
          let row = []

          for (var j = 0; j < initCols; j++) {
            row.push(getters.makeCell())
          }

          commit('addBodyRow', {
            tableName: tableName,
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
            tableName: tableName,
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
            tableName: tableName,
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
      const row = getters.isFirstRow(activeRow) ? getters.rowNum() - 1 : activeRow - 1
      commit('setActiveRow', row)
    },
    next({ commit, state, getters }, forwards = true) {
      let activeCol = state.activeElmCol
      let activeRow = state.activeElmRow
      const isLastCol = getters.isLastCol(activeCol)
      const isFirstCol = getters.isFirstCol(activeCol)

      const col = forwards ? ( isLastCol ? 0 : activeCol + 1 ) : ( isFirstCol ? getters.colNum() - 1 : activeCol - 1 )
      // If the active cell is at the bottom right, move row to top
      // else if the col is to the far right move to next row
      // else stay at the same row
      const row = forwards ? ( isLastCol && getters.isLastRow(activeRow) ? 0 : isLastCol ? activeRow + 1 : activeRow ) : ( isFirstCol && getters.isFirstRow(activeRow) ? getters.rowNum() - 1 : isFirstCol ? activeRow - 1 : activeRow )

      commit('setActiveCol', col)

      if( row != state.activeElmRow ) {
        commit('setActiveRow', row)
      }
    },
    setCellAlignment({ commit, getters }, options) {
      console.log(options)
      if( options && options.tableName && options.rowIndex !== null && options.colIndex !== null && options.align !== null ) {
        options.header = getters.isRowInHeader(options.rowIndex)
        options.rowIndex = options.header ? options.rowIndex : getters.getRowIndex(options.rowIndex)
        commit(options.header ? 'setCellAlignHeader' : 'setCellAlignBody', options)
      }
    },
    setCellType({ commit, getters }, options) {
      if( options && options.tableName && options.rowIndex !== null && options.colIndex !== null && options.type !== null ) {
        options.header = getters.isRowInHeader(options.rowIndex)
        options.rowIndex = options.header ? options.rowIndex : getters.getRowIndex(options.rowIndex)
        commit(options.header ? 'setCellTypeHeader' : 'setCellTypeBody', options)
      }
    },
    setContent({ commit, state, getters }, options) {
      if( !options.tableName ) { return false }
      commit('setContent', {
        part: getters.getRowPart(),
        row: getters.getRowIndex(),
        col: state.activeElmCol,
        tableName: options.tableName,
        text: options.value,
      })
    }
  }
})
