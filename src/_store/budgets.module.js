import { budgetService } from '../_services/budget.service'
import moment from 'moment'

const state = {
  budgets: []
}

const actions = {
  fetchBudgets ({commit, state}) {    
    return new Promise((resolve, reject) => {
      budgetService.userBudgets()
        .then(response => {
          if (response.ok) {
            response.json().then(
              data => {
                state.budgets = data.map(budget => {
                  return {...budget, startingDate: moment(budget.startingDate).format('YYYY-MM-DD')}
                })
                
                resolve(data)
              }
            )
          } else if (response.status == 404) {
            state.budgets = []
            resolve([])
          } else {
            state.budgets = []
            reject(response)
          }
        })
        .catch(error => {
          
          reject(error)
        })
    })
  },
  saveBudget ({ commit }, budget) {

  }
}

const mutations = {

}

export const budgets = {
  namespaced: true,
  state,
  actions,
  mutations
}
