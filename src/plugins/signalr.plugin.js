import { apiHandler } from '../_services/apiHandler'
import * as signalR from '@aspnet/signalr'
import store from '../_store/index'

new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_APIURL}/hubs/transactions`, { accessTokenFactory: () => apiHandler.getAccessToken() })
  .build()

const signalrPlugin = {
  install (Vue) {

    const transactionsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/transactions`, { accessTokenFactory: () => apiHandler.getAccessToken() })
      .build()
    transactionsHubConnection.start()

    const budgetsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/budgets`, { accessTokenFactory: () => apiHandler.getAccessToken() })
      .build()
    budgetsHubConnection.start()
/*
    transactionsHubConnection.on('TransactionAdded', (newTransaction) => {
      store.dispatch('transactions/loadTransactionToStore', newTransaction)
    })

    transactionsHubConnection.on('TransactionRemoved', (transactionId) => {
      store.dispatch('transactions/unloadTransactionFromStore', transactionId)
    })

    transactionsHubConnection.on('TransactionUpdated', (updatedTransaction) => {
      store.dispatch('transactions/updateTransactionInStore', updatedTransaction)
    })

    budgetsHubConnection.on('BudgetAdded', (newBudget) => {
      store.dispatch('budgets/loadBudgetToStore', newBudget)
    })

    budgetsHubConnection.on('BudgetRemoved', (BudgetId) => {
      store.dispatch('budgets/unloadBudgetFromStore', BudgetId)
    })

    budgetsHubConnection.on('BudgetUpdated', (updatedBudget) => {
      store.dispatch('budgets/updateBudgetInStore', updatedBudget)
    })

    budgetsHubConnection.on('CategoryAdded', (newCategory) => {
      store.dispatch('budgets/reloadInitialized', newCategory.budget.id)
    })

    budgetsHubConnection.on('CategoryRemoved', (categoryId) => {
      store.dispatch('budgets/reloadInitialized')
    })

    budgetsHubConnection.on('CategoryUpdated', (updatedCategory) => {
      store.dispatch('budgets/reloadInitialized', updatedCategory.budget.id)
    })
    */
  }
}

export default signalrPlugin
