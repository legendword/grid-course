import Vue from 'vue'
import Vuex from 'vuex'

// import ubc2021W from './course-lib/ubc-2021W.json'
import ubc2022S from './course-lib/ubc-2022S.json'
import ubc2022W from './course-lib/ubc-2022W.json'
import ubc2024W from './course-lib/ubc-2024W.json'

Vue.use(Vuex)

const sessions = {
  // '2021W': ubc2021W,
  '2022W': ubc2022W,
  '2022S': ubc2022S,
  '2024W': ubc2024W,
}

export const sessionNames = Object.keys(sessions)

export default new Vuex.Store({
  state: {
    session: '2024W',
    courses: ubc2024W,
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
