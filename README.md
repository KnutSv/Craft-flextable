# FlexTable, a better table field type for Craft

This field type makes creating and editing tables in Craft a breeze.

## NOTE
This field type is under development, it is not ready for use yet!

## Features

* Edit tables like in Excel or other spreadsheet programs, enter creates a new line, tab adds a new column
* Creates accessible tables with table headers and table caption

## Templating
You can use the data returned from the field like so:
```
  <table>
    <thead>
      {% for row in entry.test.thead %}
        <tr>
          {% for cell in row %}
            <{{ cell.type }} class="{{ cell.align }}">{{ cell.text }}</{{ cell.type }}>
          {% endfor %}
        </tr>
      {% endfor %}
    </thead>
    <tbody>
      {% for row in entry.test.tbody %}
        <tr>
          {% for cell in row %}
            <{{ cell.type }} class="{{ cell.align }}">{{ cell.text }}</{{ cell.type }}>
          {% endfor %}
        </tr>
      {% endfor %}
    </tbody>
  </table>
```