<template>
<v-container fill-height>     
    <v-layout wrap align-center justify-center>
        <router-view></router-view>
    </v-layout>
</v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { budgetService } from "../_services";

export default {
  data: () => ({
    budgets: {}
  }),
  computed: {
    ...mapState({
      account: state => state.account
    })
  },
  methods: {
    ...mapActions("users", {
      getAllUsers: "getAll",
      deleteUser: "delete"
    })
  }
};
</script>