
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
          values = JSON.parse(input.val());

      this._addRow({
        parent: thead,
        cellType: '<th>',
        values: values[0]
      });

      for(var i = 1; i < values.length; i++) {
        this._addRow({
          parent: tbody,
          values: values[i]
        });
      }

      table.append(thead);
      table.append(tbody);

      this.table = table;
      this.tbody = tbody;

      input.after(table);

      $(document).click(function(){
        if(that.contextMenu || false) {
          that._removeContextMenu();
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
            cellType: '<td>',
            values: []
          },
          options = $.extend(defaultOptions, options || {}),
          //before = before || false,
          //values = typeof(values) === 'object' && values ? values : [],
          //cellType = cellType || '<td>',
          rowCount = typeof(table.rowCount) !== 'undefined' ? table.rowCount + 1 : 0,
          colCount = Object.keys(options.values).length || table.colCount || 2,
          row = $('<tr>').attr('data-row', rowCount);

      for(var i = 0; i < colCount; i++) {
        var cell = $(options.cellType);
        if(options.values) {
          cell.html(options.values['col' + (i + 1)])
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
    _addColumn : function(index, before) {
      var table = this,
          before = before || false,
          rows = this.table.find('tr');

      for(var i = 0; i < rows.length; i++) {
        var cell = $(rows[i]).children().eq(index),
            cellType = '<' + cell.prop('tagName').toLowerCase() + '>';

        if(before) {
          cell.before($(cellType));
        } else {
          cell.after($(cellType));
        }
      }
      table.colCount++;

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
    },
    _focus : function(el) {
      this._editMode(el);
    },
    _editMode : function(el) {
      var table = this,
          el = $(el),
          textarea = $('<textarea>').addClass('flextable__textarea');
      
      textarea.css('font-weight', el.css('font-weight')).val(el.text());

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
          colNum = parent.children().index(el),
          rowNum = parent.attr('data-row'),
          lineElm = $(this.table).find('[data-row=' + (parseInt(rowNum) + parseInt(operator)) + ']').first().children().eq(colNum);

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
      var input = this.el.parent().find('input').first(),
          valueArr = [];

      this.table.find('tr').each(function(){
        var rowObj = {},
            colNum = 1;

        $(this).find('td, th').each(function(){
          var colKey = 'col' + colNum,
              cellElm = $(this);
          // If the row has textarea (is in focus), just add the text before that
          rowObj[colKey] = cellElm.html().split("<textarea")[0];
          colNum++;
        });

        valueArr.push(rowObj);
      });

      input.val(JSON.stringify(valueArr));
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
          console.log((action !== 'addRowAbove'));
          table._addRow({
            parent: grandParent,
            index: grandParent.children().index(el.parent()),
            before: (action === 'addRowAbove')
          });
        });
      } 
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