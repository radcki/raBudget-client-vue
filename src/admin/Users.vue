<template>
<v-container grid-list-md> 
    <v-layout wrap >
        <v-flex xs12 md6>
            <v-subheader class="headline">
                {{ $t('admin.users') }}
            </v-subheader>
        </v-flex>
        <v-flex xs12>
            <v-list class="elevation-1">
                <template v-for="(user, index) in users">
                    <v-list-tile :key="'user'+index">
                        <v-list-tile-avatar color="teal">
                            <span class="white--text">{{user.id}}</span>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{user.username}}</v-list-tile-title>
                            <v-list-tile-sub-title>{{user.email}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action-text>
                            <v-btn flat color="red" @click="accountDelete(user)">{{$t("general.delete")}}</v-btn>
                        </v-list-tile-action-text>
                    </v-list-tile>
                    <v-divider :key="'divider' + index" v-if="index != users.length-1"></v-divider>
                </template>
            </v-list>
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
            users: []
        }
    },
    computed: {
        ...mapState({
            account: state => state.account
        })       
    },
    created () {
        this.fetchUsers()
    },
    methods: {
        ...mapActions({
            dispatchError: "alert/error",
            dispatchSuccess: "alert/success",
        }),
        fetchUsers: function () {
            userService.getAll().then(response=>{
                if (response.ok) {
                    response.json().then(data=>{                        
                        this.users = data;
                    })
                }
            });
        },
        accountDelete: function (user) {
            this.$root.$confirm('account.deleteAccount', 'account.confirmRemove', { color: 'red', input: "password", width: 400, buttons: { yes: false, no: false, cancel: true,ok: true }})
                .then( (input) => {
                    if (input) {
                        userService.delete(user.id, input).then(response => {
                            if (response.ok) {
                                this.dispatchSuccess("admin.userDeleted")
                                this.fetchUsers();
                            } else {
                                this.dispatchError("admin.deletionFailure")
                            }
                        });
                    }             
                });
        }
    }
};
</script>