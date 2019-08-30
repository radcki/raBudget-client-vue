<template>
  <v-container fill-height>
    <v-layout wrap align-center justify-center>
      <v-card raised width="600px">
        <v-card-title
          primary-title
          class="blue-grey darken-2 headline white--text"
        >{{ $t('account.passwordReset') }}</v-card-title>

        <v-card-text>
          <v-form ref="formPassChange" v-model="validPasswordForm" @submit.prevent="resetPassword">
            <v-text-field
              v-model="email"
              :rules="emailRule"
              :label="$t('account.email')"
              required
            ></v-text-field>

            <v-checkbox
              v-model="haveCode"
              :label="$t('account.haveCode')"
            ></v-checkbox>

            <template v-if="haveCode">
              <v-text-field
                v-model="verificationCode"
                :rules="requiredRule"
                :label="$t('account.verificationCode')"
                required
              ></v-text-field>
              <v-text-field
                  v-model="newpassword"
                  autocomplete="new-password"
                  :append-icon="show ? mdiEyeOff : mdiEye"
                  :rules="passwordRule"
                  :type="show ? 'text' : 'password'"
                  :label="$t('account.newpassword')"
                  counter
                  @click:append="show = !show"
                ></v-text-field>

                <v-text-field
                    v-model="newpasswordConfirm"
                    autocomplete="new-password"
                    :append-icon="show2 ? mdiEyeOff : mdiEye"
                    :rules="passwordMatch"
                    :type="show2 ? 'text' : 'password'"
                    :label="$t('account.newpasswordConfirm')"
                    counter
                    @click:append="show2 = !show2"
                ></v-text-field>
              </template>

            </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn textto="/login">{{ $t('account.logging') }}</v-btn>
          <v-btn v-if="haveCode" color="primary" @click="resetPassword">{{ $t("account.changePassword") }}</v-btn>
          <v-btn v-else color="primary" @click="passwordChangeRequest">{{ $t("account.requestPasswordReset") }}</v-btn>
          <v-progress-linear :indeterminate="true" v-if="$wait.is('processing')"></v-progress-linear>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { userService } from '../_services/user.service'
import { mdiEye, mdiEyeOff } from '@mdi/js'

export default {
  data () {
    return {
      email: null,
      haveCode: false,
      newpassword: null,
      show: false,
      show2: false,
      newpasswordConfirm: null,
      validPasswordForm: false,
      verificationCode: null,
      requiredRule: [v => !!v || this.$t('forms.requiredField')],
      emailRule: [
        v => !!v || this.$t('forms.requiredField'),
        v => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(v) || this.$t('forms.incorrectEmail')
        }
      ],
      passwordRule: [
        v => (v && v.length > 5) || this.$t('forms.tooShortPassword'),
        v => !!v || this.$t('forms.requiredField')
      ],
      passwordMatch: [
        v => !!v || this.$t('forms.requiredField'),
        v =>
          this.newpassword == v || this.$t('forms.passwordDontMatch')
      ],
      mdiEye,
      mdiEyeOff
    }
  },
  watch: {
    haveCode: function () {
      this.newpassword = null
      this.newpasswordConfirm = null
      this.$refs.formPassChange.resetValidation()
    }
  },
  methods: {
    ...mapActions({
      dispatchInfo: 'alert/info',
      dispatchError: 'alert/error',
      dispatchSuccess: 'alert/success'
    }),

    passwordChangeRequest () {
      if (this.email) {
        this.$wait.start('processing')
        userService.requestPasswordReset(this.email).then(response => {
          if (response.ok) {
            this.$wait.end('processing')
            this.dispatchInfo('account.emailVerificationSent')
            this.haveCode = true
          } else {
            this.$wait.end('processing')
            this.dispatchError('account.emailVerificationSendingError')
          }
        }).catch(() => {
          this.$wait.end('processing')
          this.dispatchError('account.emailVerificationSendingError')
        })
      }
    },
    resetPassword () {
      if (this.$refs.formPassChange.validate()) {
        this.$wait.start('processing')
        userService.submitPasswordResetCode(this.email, this.verificationCode, this.newpassword)
          .then(response => {
            if (response.ok) {
              this.$wait.end('processing')
              this.dispatchSuccess('account.passwordResetSuccess')
              this.$router.push('/login')
            } else {
              this.$wait.end('processing')
              this.dispatchError('account.passwordResetError')
            }
          }).catch(() => {
            this.$wait.end('processing')
            this.dispatchError('account.passwordResetError')
          })
      }
    }
  }
}
</script>
