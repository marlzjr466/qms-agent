import { baseApi } from '@utilities/axios'

export default () => ({
  metaModule: true,
  name: 'login',

  metaStates: {
    counters: [],
    user: null
  },

  metaMutations: {
    SET_COUNTERS: (state, { payload }) => {
      state.counters = payload
    },

    SET_USER: (state, { payload }) => {
      state.user = payload
    },
  },

  metaGetters: {
    getAvailCounter (state) {
      return state.counters.filter(x => (x.id !== state.user.id) && x.session && !x.serving)
    }
  },

  metaActions: {
    async getCounters ({ commit }, params = {}) {
      try {
        const counters = await baseApi.post('/qms/counters/list', params)

        commit('SET_COUNTERS', counters.data)
      } catch (error) {
        console.log('getCounters error:', error)
        throw error
      }
    },

    async getUser ({ commit }, id) {
      try {
        const res = await baseApi.post('/qms/counters/list', {
          is_first: true,
          filter: {
            column: 'id',
            value: +id
          }
        })

        commit('SET_USER', res.data)
      } catch (error) {
        console.log('getUser error:', error)
        throw error
      }
    },

    async handleLogin ({ commit }, id) {
      try {
        const res = await baseApi.post('/qms/counters/login', {
          filter: {
            column: 'id',
            value: +id,
            data: {
              status: 1
            }
          }
        })

        commit('SET_USER', res.data)
      } catch (error) {
        console.log('handleLogin error:', error)
        throw error
      }
    },

    async handleLogout ({ state }) {
      try {
        await baseApi.post('/qms/counters/logout', {
          filter: {
            column: 'id',
            value: state.user.id,
            data: {
              status: 0
            }
          }
        })
      } catch (error) {
        console.log('handleLogout error:', error)
        throw error
      }
    }
  }
})