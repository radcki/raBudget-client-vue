<template>
  <v-container grid-list-md>
    <v-layout wrap>
      <v-flex xs12 md6>
        <v-subheader class="headline">{{ $t('admin.logs') }}</v-subheader>
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
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.debug')"
                          value="Debug"
                        ></v-checkbox>
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.information')"
                          value="Information"
                        ></v-checkbox>
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.warning')"
                          value="Warning"
                        ></v-checkbox>
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.error')"
                          value="Error"
                        ></v-checkbox>
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.critical')"
                          value="Critical"
                        ></v-checkbox>
                        <v-checkbox
                          hide-details
                          v-model="levels"
                          :label="$t('admin.none')"
                          value="None"
                        ></v-checkbox>
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
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="minDate" :label="$t('general.fromDate')" readonly></v-text-field>
                    </template>
                    <v-date-picker
                      :max="today"
                      v-model="minDate"
                      @input="$refs.minDateMenu.save(minDate)"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>

                <v-flex xs6 md5>
                  <v-menu
                    ref="maxDateMenu"
                    :close-on-content-click="false"
                    v-model="maxDateMenu"
                    :nudge-right="40"
                    :return-value.sync="maxDate"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="maxDate" :label="$t('general.fromDate')" readonly></v-text-field>
                    </template>
                    <v-date-picker
                      :max="today"
                      v-model="maxDate"
                      @input="$refs.maxDateMenu.save(maxDate)"
                    ></v-date-picker>
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
          :search="JSON.stringify(levels)"
          :custom-filter="customFilter"
          :loading="loading"
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
                <td :class="conditionalColor(item.level)+' lighten-2 text-xs-center'">
                  <span>{{item.level}}</span>
                </td>
                <td>
                  <span>{{item.message}}</span>
                </td>
                <td>
                  <span>{{item.name}}</span>
                </td>
                <td>
                  <span>{{item.timeStamp | dateFormat("dd MMMM yyyy HH:mm:ss", $dateLocales[$locale])}}</span>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { logsService } from '../_services/logs.service'
import { format, subMonths } from 'date-fns'

export default {
  data () {
    return {
      logs: [],
      loading: false,
      search: null,
      minDate: format(subMonths(new Date, 1), 'yyyy-MM-dd'),
      minDateMenu: false,
      maxDate: format(new Date, 'yyyy-MM-dd'),
      maxDateMenu: false,
      levels: ['Critical', 'Error', 'Warning', 'None'],
      headers: [
        {
          text: 'admin.userId',
          sortable: true,
          value: 'id'
        },
        {
          text: 'admin.level',
          sortable: true,
          value: 'level'
        },
        {
          text: 'admin.message',
          sortable: true,
          value: 'message'
        },
        {
          text: 'admin.name',
          sortable: true,
          value: 'name'
        },
        {
          text: 'admin.timestamp',
          value: 'timeStamp',
          sortable: true
        }
      ]
    }
  },
  computed: {
    ...mapState({
      account: state => state.account
    }),
    today: function () {
      return format(new Date(), 'yyyy-MM-dd')
    }
  },
  created () {
    this.fetchLogs()
  },
  watch: {
    minDate: function () {
      this.fetchLogs()
    },
    maxDate: function () {
      this.fetchLogs()
    }
  },
  methods: {
    ...mapActions({
      dispatchError: 'alert/error',
      dispatchSuccess: 'alert/success'
    }),
    fetchLogs: function () {
      this.loading = true
      logsService.getPeriod(this.minDate, this.maxDate).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.logs = data
            this.loading = false
          })
        }
        this.loading = false
      })
    },
    conditionalColor: function (value) {
      var v = value.toLowerCase()
      if (v === 'none') {
        return 'white'
      }
      if (v === 'critical') {
        return 'red white--text'
      }
      if (v === 'error') {
        return 'red white--text'
      }
      if (v === 'warning') {
        return 'amber white--text'
      }
      if (v === 'information') {
        return 'blue white--text'
      }
      if (v === 'debug') {
        return 'white'
      }
      if (v === 'trace') {
        return 'white'
      }
    },
    customFilter (value, search, item) {
      return this.levels.includes(item.level)
    }
  }
}
</script>
