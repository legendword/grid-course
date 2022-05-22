import Vue from 'vue'
import Vuex from 'vuex'

import ubc2021W from './course-lib/ubc-2021W.json'
import ubc2022S from './course-lib/ubc-2022S.json'

Vue.use(Vuex)

const sessions = {
  '2021W': ubc2021W,
  '2022S': ubc2022S
}

export const sessionNames = Object.keys(sessions)

export default new Vuex.Store({
  state: {
    session: '2021W',
    courses: ubc2021W
  },
  mutations: {
    updateSession(state, value) {
      if (sessions[value]) {
        state.session = value
        state.courses = sessions[value]
      }
    }
  },
  actions: {
    
  }
})
