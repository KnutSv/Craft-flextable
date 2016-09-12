
(function($) {
  'use strict';
  
  function Table(el, options) {

    // Bind element argument to object element
    this.el = el;

    // Extends defaults-options with user defined options
    this.options = $.extend( this.defaults, options || {} );

    // Let the fun begin!
    this._init();

    this._to_ascii = {
        '188': '44',
        '109': '45',
        '190': '46',
        '191': '47',
        '192': '96',
        '220': '92',
        '222': '39',
        '221': '93',
        '219': '91',
        '173': '45',
        '187': '61', //IE Key codes
        '186': '59', //IE Key codes
        '189': '45'  //IE Key codes
    };

    this.shiftUps = {
        "96": "~",
        "49": "!",
        "50": "@",
        "51": "#",
        "52": "$",
        "53": "%",
        "54": "^",
        "55": "&",
        "56": "*",
        "57": "(",
        "48": ")",
        "45": "_",
        "61": "+",
        "91": "{",
        "93": "}",
        "92": "|",
        "59": ":",
        "39": "\"",
        "44": "<",
        "46": ">",
        "47": "?"
    };
  };

  Table.prototype = {
    // Default options
    // Override in call "$(selector).example({option1: value1, option2: value2});" or "new mainExample($(selector),{option1: value1, option2: value2});"
    defaults : {
      //optionName: 'option value'
    },

    _init : function() {
      // Var to keep tab this-reference
      // Var shortcut to element
      var that = this,
          input = $(this.el),
          table = $('<table>').addClass('flextable'),
          thead = $('<thead>'),
          tbody = $('<tbody>'),
          values = JSON.parse(input.val()),
          rowLength = values && values.hasOwnProperty('tbody') ? values.tbody.length : 1;

      this._addRow({
        parent: thead,
        cellType: 'th',
        values: values && values.hasOwnProperty('thead') ? values.thead[0] : []
      });

      for(var i = 0; i < rowLength; i++) {
        this._addRow({
          parent: tbody,
          values: values && values.hasOwnProperty('tbody') ? values.tbody[i] : []
        });
      }

      table.append(thead);
      table.append(tbody);

      this.table = table;
      this.thead = thead;
      this.tbody = tbody;

      input.after(table);

      $(document).click(function(){
        if(that.contextMenu || false) {
          that._removeContextMenu();
          that.contextMenu = null;
        }
      });
    },
    //_addRow : function(parent, before, cellType, values) {
    /*
     * @option parent   <jQuery element> element to place row in, default tbody
     * @option before   <bool> if row shold be placed before or after index
     * @option index    <integer> index of row the new row should be placed before or after
     * @option cellType <string> '<td>' (default) or '<tr>' to populate row with
     * @option values   <array> array with values in this format {col1:value, col2:value, col3:value}
     */
    _addRow : function(options) {
      var table = this,
          defaultOptions = {
            parent: this.tbody,
            before: false,
            index: table.rowCount || 0,
            cellType: 'td',
            values: []
          },
          options = $.extend(defaultOptions, options || {}),
          rowCount = typeof(table.rowCount) !== 'undefined' ? table.rowCount + 1 : 0,
          colCount = options.values.length || table.colCount || 2,
          row = $('<tr>');



      for(var i = 0; i < colCount; i++) {
        var cellType = options.values.length ? options.values[i].type : options.cellType,
            cell = $('<' + cellType + '>');
        if(options.values.length) {
          cell.html(options.values[i].text).attr('align', options.values[i].align);
        }
        table._bindEvent(cell);
        row.append(cell);
      }

      table.rowCount = rowCount;
      table.colCount = colCount;

      if(options.parent.children().eq(options.index).length) {
        if(options.before) {
          options.parent.children().eq(options.index).before(row);
        } else {
          options.parent.children().eq(options.index).after(row);
        }
      } else {
        options.parent.append(row);
      }
      
    },
    _removeRow : function(index, parent) {
      var parent = parent || this.tbody;
      parent.children().eq(index).remove();
      this.rowCount--;

      this._updateFieldValue();
    },
    _addColumn : function(index, before) {
      var table = this,
          index = index || table.colCount - 1,
          before = before || false,
          rows = this.table.find('tr');

      for(var i = 0; i < rows.length; i++) {
        var cell = $(rows[i]).children().eq(index),
            cellType = '<' + table._getElementType(cell) + '>',
            newCell = $(cellType);

        table._bindEvent(newCell);

        if(before) {
          cell.before(newCell);
        } else {
          cell.after(newCell);
        }
      }
      table.colCount++;

      this._updateFieldValue();
    },
    _getElementType : function(element) {
      return element.prop('tagName').toLowerCase();
    },
    _removeColumn : function(index, parent) {
      var rows = this.table.find('tr');
      for(var i = 0; i < rows.length; i++) {
        $(rows[i]).children().eq(index).remove();
      }

      this.colCount--;

      this._updateFieldValue();
    },
    _bindEvent : function(el) {
      var table = this;
      
      el.click(function(e) {
        if(!el.find('textarea').length) {
          table._focus(el);
        }
      });

      el.contextmenu(function(e){
        if(!el.find('textarea').length) {
          e.preventDefault();
          table._removeContextMenu();
          table._showContextMenu(el, e.pageX, e.pageY);
        }
      });

      // Add this event only for first header row

      if(table._getElementType(el) === 'th') {
        el.mouseenter(function(e){
          table._showAlignmentMenu($(this));
        }).mouseleave(function(e){
          if(!table.alignmentMenu.is(':hover')) {
            table.alignmentMenu.remove();
          } else {
            table.alignmentMenu.mouseleave(function(){
              table.alignmentMenu.remove();
            });
          }
          
        });
      }

      el.bind('paste', function(e){
        var pastedData = e.originalEvent.clipboardData.getData('text'),
            pastedDataLines = pastedData.split('\n'),
            cell = el,
            row = el.parent(),
            cellIndex = row.children().index(cell);

        if(pastedDataLines[0].indexOf('\t') > -1) {
          el.find('textarea').blur();
          $.each(pastedDataLines, function(index, line){
            var tabs = line.split('\t');
            $.each(tabs, function(index, tab) {
              cell.html(tab);
              if(tabs.length > (index + 1)) {
                if(cell.is(':last-child')) {
                  table._addColumn();
                }
                cell = cell.next();
              }
            });
            if(pastedDataLines.length > (index + 1)) {
              if(table._getElementType(row.parent()) === 'thead') {
                row = table.table.find('tbody tr').eq(0);
              } else {
                if(row.is(':last-child')) {
                  table._addRow();
                }
                row =  row.next();
              }
              cell = row.children().eq(cellIndex);
            }
          });
          table._focus(cell);
          return false;
        }
        
      });
    },
    _focus : function(el) {
      this._editMode(el);
    },
    _editMode : function(el) {
      var table = this,
          el = $(el),
          textarea = $('<textarea>').addClass('flextable__textarea');
      
      textarea.css({'font-weight': el.css('font-weight'), 'text-align': el.attr('align') || 'left'}).val(el.text());

      $(el).append(textarea);

      textarea.keydown(function(e) {
        var textVal = $(this).val();
        if(!e.shiftKey && e.keyCode == 9 ) {
          e.preventDefault();
          table._nextCol(el, true);
        } else if(e.shiftKey && e.keyCode == 9) {
          e.preventDefault();
          table._prevCol(el);
        } else if( e.keyCode == 13 ) {
          e.preventDefault();
          table._nextLine(el, true);
        } else if(e.keyCode == 40) {
          table._nextLine(el, false);
        // } else if(e.keyCode == 37) {
        //   table._prevCol(el);
        } else if(e.keyCode == 38) {
          table._prevLine(el);
        // } else if(e.keyCode == 39) {
        //   e.preventDefault();
        //   table._nextCol(el);
        } else if(!e.metaKey && !e.ctrlKey) {

          // If characted is backspace, remove last character, else add it
          textVal = e.keyCode == 8 ? textVal.substring(0, textVal.length - 1) : textVal + table._getKeyPressVal(e);

          table._updateTextWhileEditing(el, textVal);
          //el.text($(this).val());
          table._updateFieldValue();

          // if(this.scrollHeight > $(this).outerHeight() ) {
          //   $(this).height(this.scrollHeight - 12);
          //   el.height(this.scrollHeight - 12);
          // };
        }
      });

      textarea.focus().blur(function() {
        el.text($(this).val());
        el.css('height', '');
        this.remove();
        table._updateFieldValue();
      });
    },
    _updateTextWhileEditing : function(el, val) {
      el.contents().filter(function() { return this.nodeType == 3; }).remove();
      el.prepend( document.createTextNode(val) );
    },
    _getKeyPressVal : function(event) {
      var character = event.which;

      if (this._to_ascii.hasOwnProperty(character)) {
        character = this._to_ascii[character];
      }
      
      if (!event.shiftKey && (character >= 65 && character <= 90)) {
        character = String.fromCharCode(character + 32);
      } else if (event.shiftKey && this.shiftUps.hasOwnProperty(character)) {
        character = this.shiftUps[character];
      } else if (96 <= character && character <= 105) {
        character = String.fromCharCode(character - 48);
      }else {
        character = String.fromCharCode(character);
      }

      return character;
    },
    _nextLine : function(el, create) {
      var parent = el.parent(),
          create = typeof(create) !== 'undefined' ? create : false,
          nextLineElm = this._getLine(el, 1);

      if(nextLineElm.length) {
        this._focus(nextLineElm);
      } else if(create) {
        this._addRow();
        this._nextLine(el);
      }
    },
    _prevLine : function(el) {
      var prevLineElm = this._getLine(el, -1);

      if(prevLineElm.length) {
        this._focus(prevLineElm);
      }
    },
    _getLine : function(el, operator) {
      var parent = el.parent(),
          grandParent = parent.parent(),
          colNum = parent.children().index(el),
          rowNum = grandParent.children().index(parent),
          newRow = rowNum + parseInt(operator),
          lineElm = grandParent.children().eq(newRow).children().eq(colNum);

      if(grandParent[0] === this.tbody[0] && newRow < 0) {
        lineElm = this.thead.find('tr').last().children().eq(colNum);
      } else if(grandParent[0] === this.thead[0] && newRow === grandParent.children().length) {
        lineElm = this.tbody.find('tr').first().children().eq(colNum);
      }

      return lineElm;
    },
    _nextCol : function(el, create) {
      var create = typeof(create) !== 'undefined' ? create : false,
          nextColElm = el.next();

      if(nextColElm.length) {
        this._focus(nextColElm);
      } else if(create) {
        this._addColumn(el.parent().children().index(el));
        this._nextCol(el);
      }
    },
    _prevCol : function(el) {
      var prevColElm = el.prev();

      if(prevColElm) {
        this._focus(prevColElm);
      }
    },
    _updateFieldValue : function() {
      var table = this,
          input = this.el.parent().find('input').first(),
          valueArr = {
            thead: [],
            tbody: []
          };

      this.table.find('thead tr').each(function(){
        valueArr.thead.push(buildRow(this));
      });

      this.table.find('tbody tr').each(function(){
        valueArr['tbody'].push(buildRow(this));
      });

      function buildRow(tr) {
        var row = [];

        $(tr).find('th, td').each(function(){
          var elm = $(this);
          row.push({
            type: table._getElementType(elm),
            text: table._cleanHtml(elm.html()),
            align: elm.attr('align') || 'left'
          });
        });

        return row;
      }

      input.val(JSON.stringify(valueArr));
    },
    _cleanHtml : function(html) {
      return html.split("<textarea")[0];
    },
    _showContextMenu : function(el, x, y) {
      var menu = $('<div>').addClass('flextable__contextmenu').css({'top': y + 'px', 'left': x + 'px'}),
          options = [
            {
              icon: 'add-row-above',
              text: 'Add row above',
              action: 'addRowAbove'
            },{
              icon: 'add-row-bellow',
              text: 'Add row bellow',
              action: 'addRowBellow'
            },{
              type: 'separator'
            },{
              icon: 'add-column-right',
              text: 'Add column to the right',
              action: 'addColRight'
            },{
              icon: 'add-column-left',
              text: 'Add column to the left',
              action: 'addColLeft'
            },{
              type: 'separator'
            }, {
              icon: 'remove-row',
              text: 'Remove row',
              action: 'removeRow'
            }, {
              icon: 'remove-col',
              text: 'Remove column',
              action: 'removeCol'
            }
          ];

      for(var i = 0; i < options.length; i++) {
        var option = options[i],
            optionType = option.type || 'action';
        if(optionType === 'action') {
          var btn = $('<button>').addClass('flextable__contextmenu__btn').attr('data-flexicon', option.icon).text(option.text);
          this._contextMenuClick(btn, option.action, el);
          menu.append(btn);
        } else if(optionType === 'separator') {
          var separator = $('<hr>');
          menu.append(separator);
        }
      }

      this.contextMenu = menu;

      $('body').append(menu);
    },
    _removeContextMenu : function() {
      if(this.contextMenu) {
        this.contextMenu.remove();
      }
      this.contextMenu = null;
    },
    _contextMenuClick : function(btn, action, el) {
      var table = this;

      if(action === 'addRowBellow' || action === 'addRowAbove') {
        btn.click(function() {
          var grandParent = el.parent().parent();
          table._addRow({
            parent: grandParent,
            index: grandParent.children().index(el.parent()),
            before: (action === 'addRowAbove')
          });
        });
      } else if(action === 'addColRight' || action === 'addColLeft') {
        btn.click(function(){
          table._addColumn(el.parent().children().index(el), (action === 'addColLeft'));
        });
      } else if(action === 'removeRow') {
        btn.click(function(){
          table._removeRow(el.parent().parent().children().index(el.parent()));
        })
      } else if(action === 'removeCol') {
        btn.click(function(){
          table._removeColumn(el.parent().children().index(el));
        })
      }
    },
    _showAlignmentMenu : function(el) {
      var container = $('<div>').addClass('flextable__alignmenu').css({'top': (el.offset().top - 17) + 'px', 'left': el.offset().left + 'px', 'width': (el.outerWidth() + 1) + 'px'}),
          buttons = [
            {
              'icon': 'leftAlign',
              'text': 'Left',
              'action': 'left'
            },{
              'icon': 'centerAlign',
              'text': 'Center',
              'action': 'center'
            },{
              'icon': 'rightAlign',
              'text': 'Right',
              'action': 'right'
            }
          ];

      for(var i = 0; i < buttons.length; i++) {
        var btn = buttons[i],
            btnElm = $('<button>')
              .addClass('flextable__alignmenu__btn')
              .attr('data-flexicon', btn.icon)
              .text(btn.text);
        this._alignmentMenuClick(btnElm, btn.action, el);
        container.append(btnElm);
      }

      this.alignmentMenu = container;
      $('body').append(container);
    },
    _alignmentMenuClick : function(btn, action, cell) {
      var that = this;
      btn.click(function(){
        var cellIndex = cell.parent().children().index(cell);

        that.table.find('tr').each(function(){
          $(this).children().eq(cellIndex).attr('align', action);
        });

        that._updateFieldValue();
      });
    }
  };

  // Add object to global namespace
  // This makes it accessible outside the function
  // We can prefix this value to prevent name conflicts
  window.flexTable = Table;
})(jQuery);

// Create a jquery method which creates a new mainExample object for each instance
(function($) {
  'use strict';

  $.fn.flextable = function( options ) {
    return this.each( function() {
      new flexTable($(this), options);
    });
  };
})(jQuery);