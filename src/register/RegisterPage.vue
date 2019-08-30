<template>
  <v-container fill-height>
    <v-layout wrap align-center justify-center>
      <v-card raised width="400px">
        <v-card-title
          primary-title
          class="blue-grey darken-2 headline white--text"
        >{{ $t('account.registering') }}</v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="user.email"
              :rules="emailRule"
              :label="$t('account.email')"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.username"
              :rules="requiredRule"
              autocomplete="username"
              :label="$t('account.username')"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              autocomplete="new-password"
              :append-icon="show ? mdiEyeOff : mdiEye"
              :rules="passwordRule"
              :type="show ? 'text' : 'password'"
              :label="$t('account.password')"
              counter
              @click:append="show = !show"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="primary"
            :disabled="!valid"
            @click="handleSubmit"
          >{{ $t('account.register') }}</v-btn>

          <v-btn textto="/login">{{ $t('account.logging') }}</v-btn>
          <v-progress-linear :indeterminate="true" v-if="$wait.is('register')"></v-progress-linear>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { mdiEye, mdiEyeOff } from '@mdi/js'

export default {
  data () {
    return {
      valid: true,
      show: false,
      submitted: false,
      requiredRule: [v => !!v || this.$t('forms.requiredField')],
      passwordRule: [
        v => !!v || this.$t('forms.requiredField'),
        v => (v && v.length > 5) || this.$t('forms.tooShortPassword')
      ],
      emailRule: [
        v => !!v || this.$t('forms.requiredField'),
        v => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(v) || this.$t('forms.incorrectEmail')
        }
      ],
      user: {
        email: null,
        username: null,
        password: null
      },
      mdiEye,
      mdiEyeOff
    }
  },
  computed: {
    ...mapState('account', ['status'])
  },
  methods: {
    ...mapActions('account', ['register']),
    handleSubmit (e) {
      this.submitted = true
      if (this.$refs.form.validate()) {
        this.$wait.start('register')
        this.register(this.user).then((success) => {
          this.$wait.end('register')
          if (success) {
            this.$router.push('login')
          }
        }).catch(() => {
          this.$wait.end('register')
        })
      }
    }
  }
}
</script>
