<template>
  <v-container grid-list-md>
    <v-layout wrap>
      <v-flex xs12 md6>
        <v-subheader class="headline">{{ $t('admin.users') }}</v-subheader>
      </v-flex>
      <v-flex xs12>
        <v-list class="elevation-1" v-if="$vuetify.breakpoint.xs">
          <template v-for="(user, index) in users">
            <v-list-item :key="'user'+index">
              <v-list-item-action>
                <span>{{user.id}}</span>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{user.username}}</v-list-item-title>
                <v-list-item-subtitle>{{user.email}}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" text color="primary" @click="openEditDialog(user)" icon>
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{$t("general.edit")}}</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action-text>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" text color="primary" @click="accountDelete(user)" icon>
                      <v-icon>delete_forever</v-icon>
                    </v-btn>
                  </template>
                  <span>{{$t("general.delete")}}</span>
                </v-tooltip>
              </v-list-item-action-text>
            </v-list-item>
            <v-divider :key="'divider' + index" v-if="index != users.length-1"></v-divider>
          </template>
        </v-list>
        <v-layout row justify-end v-if="$vuetify.breakpoint.smAndUp">
          <v-flex xs4>
            <v-text-field
              v-model="search"
              :append-icon="mdiMagnify"
              :label="$t('general.search')"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="users"
          :search="search"
          class="elevation-1"
          hide-default-header
          must-sort
          sort-by
          footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:header="{ props }">
            <th v-for="header in props.headers" :key="header.text">{{$t(header.text)}}</th>
          </template>

          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <span>{{item.id}}</span>
                </td>
                <td>
                  <v-chip
                    v-if="item.roles.filter((v)=>{return v==1}).length > 0"
                    small
                    color="red"
                    disabled
                    class="small white--text"
                  >{{$t("account.adminshort")}}</v-chip>
                  {{item.username}}
                </td>
                <td>{{item.email}}</td>
                <td>{{item.creationDate | moment("YYYY-MM-DD HH:mm:ss") }}</td>
                <td>
                  <v-btn
                    text
                    small
                    color="primary"
                    @click="openEditDialog(item)"
                  >{{$t("account.editProfile")}}</v-btn>
                  <v-btn
                    text
                    small
                    color="red"
                    @click="accountDelete(item)"
                  >{{$t("general.delete")}}</v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-flex>

      <v-dialog v-model="userEditDialog" max-width="700">
        <v-card>
          <v-toolbar dark color="primary" dense text>
            <v-toolbar-title class="white--text">{{$t('account.editProfile')}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn text icon @click="userEditDialog = false">
              <v-icon light>{{mdiClose}}</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-text-field v-model="userEdit.username" :label="$t('account.username')"></v-text-field>
            <v-text-field v-model="userEdit.email" :label="$t('account.email')"></v-text-field>
            <v-select :items="roles" v-model="userEdit.roles" :label="$t('account.roles')" multiple></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red"
              text="text"
              @click="userEditDialog = false"
            >{{ $t('general.cancel') }}</v-btn>
            <v-btn
              color="primary darken-1"
              text="text"
              @click.native="updateProfile()"
            >{{ $t('general.save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { userService } from "../_services/user.service";
import { mdiMagnify, mdiClose } from "@mdi/js"

export default {
  data() {
    return {
      users: [],
      search: null,
      userEditDialog: false,
      userEdit: {
        username: null,
        email: null,
        roles: []
      },
      roles: [
        { value: 0, text: this.$t("account.user") },
        { value: 1, text: this.$t("account.admin") }
      ],
      headers: [
        {
          text: "admin.userId",
          sortable: true,
          value: "id"
        },
        {
          text: "account.username",
          sortable: true,
          value: "username"
        },
        {
          text: "account.email",
          sortable: true,
          value: "email"
        },
        {
          text: "account.creationDate",
          sortable: true,
          value: "creationDate"
        },
        {
          text: "general.actions",
          sortable: false
        }
      ],
      mdiMagnify, mdiClose
    };
  },
  computed: {
    ...mapState({
      account: state => state.account
    })
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    fetchUsers: function() {
      userService.getAll().then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.users = data;
          });
        }
      });
    },
    accountDelete: function(user) {
      this.$root
        .$confirm("account.deleteAccount", "account.confirmRemove", {
          color: "red",
          input: "password",
          width: 400,
          buttons: { yes: false, no: false, cancel: true, ok: true }
        })
        .then(input => {
          if (input) {
            userService.delete(user.id, input).then(response => {
              if (response.ok) {
                this.dispatchSuccess("admin.userDeleted");
                this.fetchUsers();
              } else {
                this.dispatchError("admin.deletionFailure");
              }
            });
          }
        });
    },
    openEditDialog: function(user) {
      this.userEdit = user;
      this.userEditDialog = true;
    },
    updateProfile: function() {
      userService.adminUpdate(this.userEdit).then(response => {
        if (response.ok) {
          this.dispatchSuccess("general.changesSaved");
          this.userEditDialog = false;
        } else {
          this.dispatchError("general.changesNotSaved");
          response.json().then(error => {
            this.dispatchError(error.message);
          });
        }
      });
    }
  }
};
</script>