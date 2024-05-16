// import { baseApi } from '@utilities/axios'

export default () => ({
  metaModule: true,
  name: 'app',

  metaStates: {
    mode: 'light',
    user: null
  },

  metaMutations: {
    SET_MODE: (state, { payload }) => {
      state.mode = payload
    }
  },

  metaGetters: {

  },

  metaActions: {

  }
})