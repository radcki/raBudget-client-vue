import { apiHandler } from '@/_services/apiHandler';
import * as signalR from '@aspnet/signalr';
import { VueConstructor } from 'vue/types/vue';
import { eBudgetHubEvent, eTransactionHubEvent, eAllocationHubEvent } from './types';

new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_APIURL}/hubs/transactions`, {
    accessTokenFactory: () => apiHandler.getAccessToken(),
  })
  .build();

class SignalrPlugin {
  *enumKeys(enumType) {
    for (const entry in enumType) {
      if (!isNaN(Number(entry))) continue;
      yield entry as string;
    }
  }

  install(Vue: VueConstructor) {
    const notificationHub = new Vue();
    Vue.prototype.$notificationHub = notificationHub;

    const transactionsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/transactions`, {
        accessTokenFactory: () => apiHandler.getAccessToken(),
      })
      .build();
    transactionsHubConnection.start();

    const budgetsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/budgets`, {
        accessTokenFactory: () => {
          const token = apiHandler.getAccessToken();
          return token;
        },
      })
      .build();
    budgetsHubConnection.start();

    const allocationsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/allocations`, {
        accessTokenFactory: () => apiHandler.getAccessToken(),
      })
      .build();
    allocationsHubConnection.start();

    for (const key of this.enumKeys(eBudgetHubEvent)) {
      budgetsHubConnection.on(key, payload => {
        notificationHub.$emit(key, payload);
      });
    }

    for (const key of this.enumKeys(eTransactionHubEvent)) {
      transactionsHubConnection.on(key, payload => {
        notificationHub.$emit(key, payload);
      });
    }

    for (const key of this.enumKeys(eAllocationHubEvent)) {
      allocationsHubConnection.on(key, payload => {
        notificationHub.$emit(key, payload);
      });
    }
  }
}

export default new SignalrPlugin();
