<template>
  <v-container fill-height>
    <v-layout wrap align-center justify-center>
      <v-card raised width="400px">
        <v-card-title
          primary-title
          class="blue-grey darken-2 headline white--text"
        >{{ $t('account.logging') }}</v-card-title>

        <v-card-text>
          <span class="body-1" v-html="$t('account.emailNotVerified')"></span>
          <v-text-field
            v-model="verificationCode"
            :rules="requiredRule"
            :label="$t('account.verificationCode')"
            required
          ></v-text-field>
          <a @click="requestCode">{{ $t('account.sendEmailVerification') }}</a>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submitCode">{{ $t("account.verifyEmail") }}</v-btn>
          <v-progress-linear :indeterminate="true" v-if="$wait.is('login')"></v-progress-linear>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { userService } from '../_services/user.service'

export default {
  data () {
    return {
      verificationCode: null,
      requiredRule: [v => !!v || this.$t('forms.requiredField')]
    }
  },
  computed: {
    ...mapState({
      user: state => state.account.user
    })
  },
  watch: {
    'user.emailVerified': function (ifVerified) {
      if (ifVerified) {
        this.$router.push('home')
      }
    }
  },
  created () {
    if (this.user.emailVerified) {
      this.$router.push('home')
    }
  },
  methods: {
    ...mapActions({
      dispatchInfo: 'alert/info',
      verifyEmail: 'account/verifyEmail'
    }),
    requestCode () {
      userService.requestEmailConfirmationCode().then(response => {
        if (response.ok) {
          this.dispatchInfo('account.emailVerificationSent')
        } else {
          this.dispatchError('account.emailVerificationSendingError')
        }
      }).catch(() => {
        this.dispatchError('account.emailVerificationSendingError')
      })
    },
    submitCode () {
      if (!this.verificationCode) {

      } else {
        this.verifyEmail(this.verificationCode).then(confirmed => {
          if (confirmed) {
            this.$router.push('home')
          }
        })
      }
    }
  }
}
</script>
