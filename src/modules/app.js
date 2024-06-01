import { baseApi } from '@utilities/axios'
import socket from '@utilities/socket'

export default () => ({
  metaModule: true,
  name: 'app',

  metaStates: {
    mode: 'light',
    session: false,
    history: [],
    inqueues: [],
    ticketsDoneCount: 0,
    inqueuesCount: 0,
    currentTicket: null,
    showTransferModal: false,
    availCounters: []
  },

  metaMutations: {
    SET_MODE: (state, { payload }) => {
      state.mode = payload
    },

    SET_SESSION: (state, { payload }) => {
      state.session = payload
    },

    SET_HISTORY: (state, { payload }) => {
      state.history = payload
    },

    SET_TICKETS_DONE_COUNT: (state, { payload }) => {
      state.ticketsDoneCount = payload
    },

    SET_IN_QUEUES: (state, { payload }) => {
      state.inqueues = payload
    },

    SET_IN_QUEUES_COUNT: (state, { payload }) => {
      state.inqueuesCount = payload
    },

    SET_CURRENT_TICKET: (state, { payload }) => {
      state.currentTicket = payload
    },

    SET_SHOW_TRANSFER_MODAL: (state, { payload }) => {
      state.showTransferModal = payload
    },

    SET_AVAIL_COUNTERS: (state, { payload }) => {
      state.availCounters = payload
    }
  },

  metaGetters: {

  },

  metaActions: {
    async initSession ({ commit, state, rootState }, session) {
      try {
        if (!session && state.currentTicket) {
          throw new Error(`Cannot end session, currently serving a ticket.`)
        }

        await baseApi.post('/qms/counters/modify', {
          filter: {
            column: 'id',
            value: rootState.login.user.id,
            data: {
              session: session ? 1 : 0
            }
          }
        })

        commit('SET_SESSION', session)
      } catch (error) {
        console.log('sessionStart error:', error.message)
        throw error
      }
    },

    async initCurrentTicket ({ commit, rootState }) {
      try {
        const res = await baseApi.post('/qms/queues/list', {
          is_first: true,
          filter: {
            fields: [
              {
                column: 'serve_by',
                value: rootState.login.user.id,
              },
              {
                column: 'status',
                value: 'serving'
              }
            ]
          }
        })

        commit('SET_CURRENT_TICKET', res.data)
      } catch (error) {
        console.log('initCurrentTicket error:', error.message)
        throw error
      }
    },

    async getHistory ({ commit, rootState }) {
      try {
        // const [midnight, lastminute] = [
        //   new Date(new Date().setHours(0,0,0)),
        //   new Date(new Date().setHours(23,59,59))
        // ]

        const res = await baseApi.post('/qms/queues/list', {
          filter: {
            fields: [
              {
                column: 'serve_by',
                value: rootState.login.user.id
              },
              {
                column: 'status',
                value: 'done'
              }
              // {
              //   column: 'completed_at',
              //   operator: 'between',
              //   value: [midnight, lastminute]
              // }
            ],
            sort: { direction: 'desc' }
          }
        })

        commit('SET_HISTORY', res.data)
        commit('SET_TICKETS_DONE_COUNT', res.data.length)
      } catch (error) {
        console.log('getHistory error:', error.message)
        throw error
      }
    },

    async getInQueues ({ commit }) {
      try {
        const res = await baseApi.post('/qms/queues/list', {
          filter: {
            column: 'status',
            value: 'waiting'
          }
        })

        commit('SET_IN_QUEUES', res.data)
        commit('SET_IN_QUEUES_COUNT', res.data.length)
      } catch (error) {
        console.log('getInQueues error:', error.message)
        throw error
      }
    },

    async doneTicket ({ commit, state, rootState }) {
      try {
        await Promise.all([
          baseApi.post('/qms/queues/modify', {
            filter: {
              column: 'id',
              value: state.currentTicket.id,
              data: {
                status: 'done',
                completed_at: new Date()
              }
            }
          }),

          baseApi.post('/qms/counters/modify', {
            filter: {
              column: 'id',
              value: rootState.login.user.id,
              data: {
                serving: 0
              }
            }
          })
        ])

        commit('SET_CURRENT_TICKET', null)
      } catch (error) {
        console.log('doneTicket error:', error.message)
        throw error
      }
    },

    async getTicket ({ commit, rootState }, type) {
      try {
        const res = await baseApi.post(`/qms/queue/${type}`, {
          id: rootState.login.user.id
        })

        commit('SET_CURRENT_TICKET', res.data)

        socket.emit('call-again', {
          counter: rootState.login.user.id,
          ticket: res.data.ticket
        })
      } catch (error) {
        console.log('getTicket error:', error.message)
        throw error
      }
    },

    async transferTicket ({ commit, state, rootState }, params) {
      try {
        await Promise.all([
          baseApi.post('/qms/counters/modify', {
            filter: {
              column: 'id',
              value: rootState.login.user.id,
              data: {
                serving: 0
              }
            }
          }),

          baseApi.post('/qms/counters/modify', {
            filter: {
              column: 'id',
              value: params.user_id,
              data: {
                serving: state.currentTicket.id
              }
            }
          }),

          baseApi.post('/qms/queues/modify', {
            filter: {
              column: 'id',
              value: state.currentTicket.id,
              data: {
                serve_by: params.user_id
              }
            }
          })
        ])

        commit('SET_CURRENT_TICKET', null)
      } catch (error) {
        console.log('transferTicket error:', error.message)
        throw error
      }
    },

    async getAvailCounter ({ commit, rootState }) {
      try {
        const res = await baseApi.post('/qms/counters/list', {
          filter: {
            fields: [
              {
                column: 'id',
                operator: '!=',
                value: rootState.login.user.id
              },
              {
                column: 'session',
                value: 1
              },
              {
                column: 'serving',
                value: 0
              }
            ]
          }
        })
        
        commit('SET_AVAIL_COUNTERS', res.data)
        return res.data
      } catch (error) {
        console.log('getAvailCounter error:', error.message)
        throw error
      }
    }
  }
})