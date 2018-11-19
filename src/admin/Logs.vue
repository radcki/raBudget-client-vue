<template>
<v-container grid-list-md> 
    <v-layout wrap >
        <v-flex xs12 md6>
            <v-subheader class="headline">
                {{ $t('admin.logs') }}
            </v-subheader>
        </v-flex>
        <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap> 

                    <v-flex xs12 md2>
                        <v-container fluid grid-list-sm class="pa-0">
                        <v-layout row wrap> 
                            <v-flex xs6>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.debug')" value="Debug"></v-checkbox>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.information')" value="Information"></v-checkbox>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.warning')" value="Warning"></v-checkbox>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.error')" value="Error"></v-checkbox>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.critical')" value="Critical"></v-checkbox>
                            <v-checkbox hide-details v-model="levels" :label="$t('admin.none')" value="None"></v-checkbox>
                        </v-flex>
                            
                        </v-layout>
                        </v-container>
                    </v-flex>                 

                    <v-flex xs6 md5>
                        <v-menu
                            ref="minDateMenu"
                            :close-on-content-click="false"
                            v-model="minDateMenu"                      
                            :nudge-right="40"
                            :return-value.sync="minDate"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px">
                            <v-text-field
                                slot="activator"
                                v-model="minDate"
                                :label="$t('general.fromDate')"
                                readonly></v-text-field>
                            <v-date-picker 
                                :max="today"
                                v-model="minDate" 
                                @input="$refs.minDateMenu.save(minDate)"></v-date-picker>
                        </v-menu>
                    </v-flex>

                    <v-flex xs6 md5>
                        <v-menu
                        ref="maxDateMenu"
                        :close-on-content-click="false"
                        v-model="maxDateMenu"                      
                        :nudge-right="40"
                        :return-value.sync="maxDate"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px">
                        <v-text-field
                            slot="activator"
                            v-model="maxDate"
                            :label="$t('general.fromDate')"
                            readonly></v-text-field>
                        <v-date-picker 
                            :max="today"
                            v-model="maxDate" 
                            @input="$refs.maxDateMenu.save(maxDate)"></v-date-picker>
                        </v-menu>
                    </v-flex>
                        

                </v-layout>
            </v-container>
          </v-card-text>  
        </v-card> 
      </v-flex>

        <v-flex xs12>
            
             <v-data-table
                :headers="headers"
                :items="logs"
                :search="levels"
                :custom-filter="customFilter"
                :loading="loading"
                class="elevation-1"
                must-sort                
                disable-initial-sort
                :rows-per-page-items="[15,25,50,{text: $t('general.all'), value: -1}]"
                >
                <template slot="headerCell" slot-scope="props">
                {{$t(props.header.text)}}
                </template>
                <template slot="items" slot-scope="props">
                    <td><span>{{props.item.id}}</span></td>
                    <td :class="conditionalColor(props.item.level)+' lighten-2 text-xs-center'"><span>{{props.item.level}}</span></td>
                    <td><span>{{props.item.message}}</span></td>
                    <td><span>{{props.item.name}}</span></td>
                    <td><span>{{props.item.timeStamp | moment("DD MMMM YYYY HH:mm:ss")}}</span></td>
                </template>
                </v-data-table>
        </v-flex>
        
    </v-layout>
</v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { logsService } from "../_services/logs.service";

export default {
  data() {
    return {
      logs: [],
      loading: false,
      search: null,
      minDate: this.$moment()
        .subtract(1, "month")
        .format("YYYY-MM-DD"),
      minDateMenu: false,
      maxDate: this.$moment().format("YYYY-MM-DD"),
      maxDateMenu: false,
      levels: ["Critical", "Error", "Warning", "None"],
      headers: [
        {
          text: "admin.userId",
          sortable: true,
          value: "id"
        },
        {
          text: "admin.level",
          sortable: true,
          value: "level"
        },
        {
          text: "admin.message",
          sortable: true,
          value: "message"
        },
        {
          text: "admin.name",
          sortable: true,
          value: "name"
        },
        {
          text: "admin.timestamp",
          value: "timeStamp",
          sortable: true
        }
      ]
    };
  },
  computed: {
    ...mapState({
      account: state => state.account
    }),
    today: function() {
      return this.$moment().format("YYYY-MM-DD");
    }
  },
  created() {
    this.fetchLogs();
  },
  watch: {
    minDate: function() {
      this.fetchLogs();
    },
    maxDate: function() {
      this.fetchLogs();
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    fetchLogs: function() {
      this.loading = true;
      logsService.getPeriod(this.minDate, this.maxDate).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.logs = data;
            this.loading = false;
          });
        }
        this.loading = false;
      });
    },
    conditionalColor: function(value) {
      var v = value.toLowerCase();
      if (v === "none") {
        return "white";
      }
      if (v === "critical") {
        return "red white--text";
      }
      if (v === "error") {
        return "red white--text";
      }
      if (v === "warning") {
        return "amber white--text";
      }
      if (v === "information") {
        return "blue white--text";
      }
      if (v === "debug") {
        return "white";
      }
      if (v === "trace") {
        return "white";
      }
    },
    customFilter(items, search, filter) {
      return items.filter(v => {
        return this.levels.includes(v.level);
      });
    }
  }
};
</script>