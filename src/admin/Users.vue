<template>
<v-container grid-list-md> 
    <v-layout wrap >
        <v-flex xs12 md6>
            <v-subheader class="headline">
                {{ $t('admin.users') }}
            </v-subheader>
        </v-flex>
        <v-flex xs12>
            <v-list class="elevation-1" v-if="$vuetify.breakpoint.xs">
                <template v-for="(user, index) in users">
                    <v-list-tile :key="'user'+index">
                        <v-list-tile-action>
                            <span>{{user.id}}</span>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>{{user.username}}</v-list-tile-title>
                            <v-list-tile-sub-title>{{user.email}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <v-tooltip bottom>
                                <v-btn slot="activator" flat color="primary" @click="openEditDialog(user)" icon>
                                    <v-icon>edit</v-icon>
                                </v-btn>
                                <span>{{$t("general.edit")}}</span>
                            </v-tooltip>
                        </v-list-tile-action>
                        <v-list-tile-action-text>
                            <v-tooltip bottom>
                                <v-btn slot="activator" flat color="red" @click="accountDelete(user)" icon>
                                    <v-icon>delete_forever</v-icon>
                                </v-btn>
                                <span>{{$t("general.delete")}}</span>
                            </v-tooltip>
                        </v-list-tile-action-text>
                    </v-list-tile>
                    <v-divider :key="'divider' + index" v-if="index != users.length-1"></v-divider>
                </template>
            </v-list>
            <v-layout row justify-end v-if="$vuetify.breakpoint.smAndUp">
                <v-flex xs4>
                <v-text-field                    
                    v-model="search"
                    append-icon="search"               
                    :label="$t('general.search')"
                    single-line 
                    hide-details></v-text-field>
                </v-flex>
            </v-layout>
             <v-data-table
                v-if="$vuetify.breakpoint.smAndUp"
                :headers="headers"
                :items="users"
                :search="search"
                class="elevation-1"
                must-sort                
                disable-initial-sort
                :rows-per-page-items="[15,25,50,{text: $t('general.all'), value: -1}]"
                >
                <template slot="items" slot-scope="props">
                    <td>
                        <span>{{props.item.id}}</span>
                    </td>
                    <td>
                        <v-chip v-if="props.item.roles.filter((v)=>{return v==1}).length > 0" small color="red" disabled class="small white--text">
                            {{$t("account.adminshort")}}
                        </v-chip>
                        {{props.item.username}}                        
                    </td>
                    <td>{{props.item.email}}</td>
                    <td>{{props.item.creationDate | moment("YYYY-MM-DD HH:mm:ss") }}</td>
                    <td>            
                        <v-btn flat small color="primary" @click="openEditDialog(props.item)">{{$t("account.editProfile")}}</v-btn>         
                        <v-btn flat small color="red" @click="accountDelete(props.item)">{{$t("general.delete")}}</v-btn>         
                    </td>
                </template>
                </v-data-table>
        </v-flex>

        <v-dialog v-model="userEditDialog" max-width="700">
            <v-card>
                <v-card-text>
                    <v-text-field v-model="userEdit.username" :label="$t('account.username')"></v-text-field>
                    <v-text-field v-model="userEdit.email" :label="$t('account.email')"></v-text-field>
                    <v-select :items="roles" v-model="userEdit.roles" multiple></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" flat="flat" @click="userEditDialog = false">{{ $t('general.cancel') }}</v-btn>
                    <v-btn color="primary darken-1" flat="flat" @click.native="updateProfile()">{{ $t('general.save') }}</v-btn>        
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { userService } from '../_services/user.service';

export default {
    data () {
        return {
            users: [],
            search: null,
            userEditDialog: false,
            userEdit: {
                username: null,
                email: null,
                roles: []
            },
            roles:[
                {value: 0, text: this.$t('account.user')},
                {value: 1, text: this.$t('account.admin')},
            ],
            headers: [
                {
                    text: this.$t("admin.userId"),
                    sortable: true,
                    value: 'id'
                },
                {
                    text: this.$t("account.username"),
                    sortable: true,
                    value: 'username'
                },                
                {
                    text: this.$t("account.email"),
                    sortable: true,
                    value: 'username'
                },
                {
                    text: this.$t("account.creationDate"),
                    sortable: true,
                    value: 'creationDate'
                },          
                {
                    text: this.$t("general.actions"),
                    sortable: false
                }
                ],
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
        },
        openEditDialog: function (user) {
            this.userEdit = user;
            this.userEditDialog = true;
        },
        updateProfile: function () {
            userService.adminUpdate(this.userEdit)
                .then( response => {
                    if (response.ok){
                        this.dispatchSuccess('general.changesSaved')
                        this.userEditDialog = false;
                    } else {
                        this.dispatchError('general.changesNotSaved')
                        response.json()
                            .then( error => {
                                this.dispatchError(error.message)                  
                            }); 
                    }
                });
        }
    }
};
</script>