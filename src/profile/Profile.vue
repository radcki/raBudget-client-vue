<template>
<v-container grid-list-md> 
    <v-layout wrap >
        <v-flex xs12 md6>
            <v-card>
                <v-card-title primary-title>
                    <v-subheader class="headline">
                        {{ $t('account.user') }}: {{ user.username }}
                    </v-subheader>
                </v-card-title>
                <v-card-text>
                    <v-form ref="formProfileUpdate" v-model="valid" @submit.prevent="handleProfileUpdate">
                        <v-text-field
                            v-model="user.email"
                            :rules="emailRule"
                            :label="$t('account.email')"
                            required>
                        </v-text-field>                    
                    </v-form>                   
                    
                </v-card-text>

                <v-card-actions>
                    <v-btn flat color="red" @click="accountDelete">{{$t('account.deleteAccount')}}</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn 
                        color="primary"                         
                        :disabled="!valid"
                        @click="handleProfileUpdate">
                        {{ $t('general.save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
        <v-flex xs12 md6>
            <v-card>
                <v-card-title primary-title>
                    <v-subheader class="headline">
                        {{ $t('account.passwordChange') }}
                        </v-subheader>
                </v-card-title>
                <v-card-text>
                    <v-form ref="formPassChange" v-model="validPasswordForm" @submit.prevent="handleProfileUpdate">
                        <v-text-field
                            v-model="password.oldpassword"
                            autocomplete="current-password"
                            :append-icon="show1 ? 'visibility_off' : 'visibility'"
                            :rules="requiredRule"
                            :type="show1 ? 'text' : 'password'"
                            :label="$t('account.oldpassword')"
                            counter
                            @click:append="show1 = !show1"
                        ></v-text-field>
                        <v-text-field
                            v-model="password.newpassword"
                            autocomplete="new-password"
                            :append-icon="show2 ? 'visibility_off' : 'visibility'"
                            :rules="passwordRule"
                            :type="show2 ? 'text' : 'password'"
                            :label="$t('account.newpassword')"
                            counter
                            @click:append="show2 = !show2"
                        ></v-text-field>
                        
                        <v-text-field
                            v-model="newpasswordConfirm"
                            autocomplete="new-password"
                            :append-icon="show3 ? 'visibility_off' : 'visibility'"
                            :rules="passwordMatch"
                            :type="show3 ? 'text' : 'password'"
                            :label="$t('account.newpasswordConfirm')"
                            counter
                            @click:append="show3 = !show3"
                        ></v-text-field>
                    </v-form>                
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                        color="primary"                         
                        :disabled="!validPasswordForm"
                        @click="handlePaswordChange">
                        {{ $t('general.save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
        
    </v-layout>
</v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { userService } from '../_services/user.service';

export default {
    data () {
        return {
            valid: true,
            validPasswordForm: true,
            show1: false,
            show2: false,
            show3: false,
            user: {
                id: null,
                email: null,
                username: null,
            },
            password: {
                oldpassword: null,
                newpassword: null,
            },
            newpasswordConfirm: null,
            emailRule: [
                v => !!v || this.$t('forms.requiredField'),
                v => {
                const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                return pattern.test(v) || this.$t('forms.incorrectEmail')
            }],
            requiredRule: [v => !!v || this.$t('forms.requiredField'),],
            passwordRule: [
                v => (v && v.length > 5) || this.$t('forms.tooShortPassword'),
                v => !!v || this.$t('forms.requiredField'),],
            passwordMatch: [
                v => !!v || this.$t('forms.requiredField'),
                v => this.password.newpassword == v || this.$t('forms.passwordDontMatch'),]
        }
    },
    computed: {
        ...mapState({
            account: state => state.account
        })       
    },
    created () {
        this.fetchProfile()
    },
    methods: {
        ...mapActions('users', {
            deleteUser: 'delete'
        }),
        ...mapActions('account', ['updateProfile', 'changePassword', 'logout']),
        fetchProfile () {
            userService.getProfile().then( data => {
                this.user.id = data.id
                this.user.email = data.email;
                this.user.username = data.username;
            });
        },
        handleProfileUpdate () {
            if (this.$refs.formProfileUpdate.validate()) {
                this.updateProfile(this.user);
            };
        },
        handlePaswordChange () {
            if (this.$refs.formPassChange.validate()) {
                this.changePassword(this.password).then( result => {
                    if (result == true ) {
                        this.$refs.formPassChange.reset()
                    }
                });                
            };
        },
        accountDelete () {
            this.$root.$confirm('account.deleteAccount', 'account.confirmRemove', { color: 'red', input: "password", width: 400, buttons: { yes: false, no: false, cancel: true,ok: true }})
                .then( (input) => {
                    if (input) {
                        userService.delete(this.user.id, input).then(response => {
                            if (response.ok) {
                                this.logout();
                                this.$router.push({name: "login"});
                            }
                        });
                    }             
                });
        }
    }
};
</script>