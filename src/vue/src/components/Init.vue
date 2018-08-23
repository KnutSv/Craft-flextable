<template>
  <div>
    <fieldset>
      <legend>{{ $t('TABLE_SIZE') }}</legend>
      <table role="presentation">
        <tr>
          <td><label :for="`ft_init_${_uid}_size_cols`" style="margin-right: 8px;">{{ $t('NUMBER_OF_COLS') }}</label></td>
          <td<input :id="`ft_init_${_uid}_size_cols`" v-model="cols" class="size-input--2" type="number" size="2" min="1"></td>
        </tr>
        <tr>
          <td><label :for="`ft_init_${_uid}_size_rows`" style="margin-right: 8px;">{{ $t('NUMBER_OF_ROWS') }}</label></td>
          <td><input :id="`ft_init_${_uid}_size_rows`" v-model="rows" class="size-input--2" type="number" size="2" min="0"></td>
        </tr>
      </table>
    </fieldset>
    <div class="init-btns">
      <button class="btn init-btns__btn" @click.stop.prevent="intTable('top')">
        <svg :id="`ft_init_${_uid}_icon_headertop`" :data-name="`ft_init_${_uid}_icon_headertop`" xmlns="http://www.w3.org/2000/svg" width="64" height="63" viewBox="0 0 64 63"><rect x="1" y="1" width="62" height="61" fill="#fff"/><rect x="2" y="2" width="60" height="14" fill="#afafaf"/><path d="M0,0V63H64V0ZM42,2V16H22V2ZM22,31V17H42V31Zm20,1V46H22V32Zm0,15V61H22V47ZM2,2H21V16H2ZM2,17H21V31H2ZM2,32H21V46H2ZM2,47H21V61H2ZM62,61H43V47H62Zm0-15H43V32H62Zm0-15H43V17H62Zm0-15H43V2H62Z" fill="#333f4e"/><path d="M62,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M2,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M32,1.5" fill="#333f4e"/></svg>
        <span class="init-btns__btn__text">{{ $t('BUTTON_CREATE_TABLE_HEADER_TOP') }}</span>
      </button>
      <button class="btn init-btns__btn" @click.stop.prevent="intTable('left')">
        <svg :id="`ft_init_${_uid}_icon_headerleft`" :data-name="`ft_init_${_uid}_icon_headerleft`" xmlns="http://www.w3.org/2000/svg" width="64" height="63" viewBox="0 0 64 63"><rect x="1" y="1" width="62" height="61" fill="#fff"/><rect x="2" y="2" width="19" height="59" fill="#afafaf"/><path d="M0,0V63H64V0ZM42,2V16H22V2ZM22,31V17H42V31Zm20,1V46H22V32Zm0,15V61H22V47ZM2,2H21V16H2ZM2,17H21V31H2ZM2,32H21V46H2ZM2,47H21V61H2ZM62,61H43V47H62Zm0-15H43V32H62Zm0-15H43V17H62Zm0-15H43V2H62Z" fill="#333f4e"/><path d="M62,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M2,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M32,1.5" fill="#333f4e"/></svg>
        <span class="init-btns__btn__text">{{ $t('BUTTON_CREATE_TABLE_HEADER_LEFT') }}</span>
      </button>
      <button class="btn init-btns__btn" @click.stop.prevent="intTable('none')">
        <svg :id="`ft_init_${_uid}_icon_noheader`" :data-name="`ft_init_${_uid}_icon_noheader`" xmlns="http://www.w3.org/2000/svg" width="64" height="63" viewBox="0 0 64 63"><rect x="1" y="1" width="62" height="61" fill="#fff"/><path d="M0,0V63H64V0ZM42,2V16H22V2ZM22,31V17H42V31Zm20,1V46H22V32Zm0,15V61H22V47ZM2,2H21V16H2ZM2,17H21V31H2ZM2,32H21V46H2ZM2,47H21V61H2ZM62,61H43V47H62Zm0-15H43V32H62Zm0-15H43V17H62Zm0-15H43V2H62Z" fill="#333f4e"/><path d="M62,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M2,62.5" fill="none" stroke="#333f4e" stroke-miterlimit="10"/><path d="M32,1.5" fill="#333f4e"/></svg>
        <span class="init-btns__btn__text">{{ $t('BUTTON_CREATE_TABLE_HEADER_NONE') }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'init',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      cols: 2,
      rows: 3
    }
  },
  methods: {
    intTable(mode) {
      this.$store.dispatch('initTable', {
        tableName: this.id,
        mode: mode,
        rows: this.rows,
        cols: this.cols
      })
    }
  },
  watch: {
    cols() {
      if( !this.cols || this.cols < 1 ) {
        this.cols = 1
      }
    },
    rows() {
      if( !this.rows || this.rows < 1 ) {
        this.rows = 1
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .btn {
    height: auto;
    margin: 5px 5px 0 0;
    padding-top: 8px;
    padding-bottom: 8px;
    text-align: center;
    white-space: normal;
  }

  .size-input--2 {
    width: 3em;
  }

  @media (max-width: 599px) {
    .btn {
      display: flex;
      width: 100%;
      text-align: left;
      align-items: center;

      svg {
        width: 24px;
        height: 23px;
        flex-shrink: 0;
      }
    }

      .init-btns__btn__text {
        margin-left: 8px;
      }
  }

  @media (min-width: 600px) {
    .init-btns {
      display: flex;
    }

    .init-btns__btn__text {
      display: block;
      max-width: 10em;
    }
  }

</style>
