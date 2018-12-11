<template>
<v-container fill-height>     
        <v-layout wrap align-center justify-center>
            <v-card raised width="400px">
                <v-card-title 
                    primary-title 
                    class="blue-grey darken-2 headline white--text">
                    {{ $t('account.logging') }}
                </v-card-title>


                <v-card-text>
                    <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
                        <v-text-field
                            v-model="username"
                            autocomplete="username"
                            :rules="requiredRule"
                            :label="$t('account.username')"
                            required                        
                        ></v-text-field>
                        <v-text-field
                            v-model="password"
                            autocomplete="current-password"
                            :append-icon="show ? 'visibility_off' : 'visibility'"
                            :rules="requiredRule"
                            :type="show ? 'text' : 'password'"
                            name="input-10-1"
                            :label="$t('account.password')"
                            counter
                            @click:append="show = !show"
                            @keydown.enter="handleSubmit"
                        ></v-text-field>

                        <v-btn
                            color="primary"
                            :disabled="!valid"
                            @click="handleSubmit">
                            {{ $t("account.signIn") }}
                        </v-btn>

                        <v-btn flat to="/register">{{ $t("account.register") }}</v-btn>
                    </v-form>
                    
                </v-card-text>
            </v-card>
        </v-layout>
</v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      valid: true,
      show: false,
      username: null,
      password: null,
      submitted: false,
      requiredRule: [v => !!v || this.$t("forms.requiredField")]
    };
  },
  computed: {
    ...mapState("account", ["status"]),    
  },
  watch: {
    "status.loggedIn": function(isLogged) {
      if (isLogged){
        this.$router.push("home");
      }
    }
  },
  created() {
    if (status.loggedIn){
      this.$router.push("home");
    }
  },
  methods: {
    ...mapActions("account", ["login", "logout"]),
    handleSubmit(e) {
      this.submitted = true;
      const { username, password } = this;
      if (username && password) {
        this.login({ username, password }).then(ok => {
          if (ok) {            
            this.$root.$emit("reloadBudgets");
          }
        });
      }
    }
  }
};
</script>