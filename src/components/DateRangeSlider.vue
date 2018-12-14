<template>
    <v-container fluid grid-list-sm class="pa-0">
        <v-layout row wrap >         
            <v-flex xs6 style="width: 120px">
                <v-menu
                    ref="minMenu"
                    :close-on-content-click="false"
                    v-model="minMenu"
                    :nudge-right="40"
                    :return-value.sync="selectedMin"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                    >
                <v-text-field
                    slot="activator"
                    v-model="selectedMin"
                    :label="$t('general.fromDate')"
                    :rules="requiredRule"
                    readonly
                ></v-text-field>
                <v-date-picker 
                    :min="min"
                    :max="max"
                    v-model="selectedMin" 
                    @input="$refs.minMenu.save(selectedMin)"></v-date-picker>
                </v-menu>
            </v-flex>

            <v-flex xs6 style="width: 120px" >
                <v-menu
                ref="maxMenu"
                :close-on-content-click="false"
                v-model="maxMenu"                      
                :nudge-right="40"
                :return-value.sync="selectedMax"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
                >
                <v-text-field
                    slot="activator"
                    v-model="selectedMax"
                    :label="$t('general.toDate')"
                    :rules="requiredRule"
                    readonly
                ></v-text-field>
                <v-date-picker 
                    :min="min"
                    :max="max" 
                    v-model="selectedMax" 
                    @input="$refs.maxMenu.save(selectedMax)"></v-date-picker>

                </v-menu>
            </v-flex>
            <v-flex xs12>
                <v-range-slider
                v-model="sliderValue"
                :max="rangeDiff"
                :min="0"
                :step="1"
                ></v-range-slider>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
export default {
    name: "VDateRangeSlider",
    props: {
        min: String,
        max: String,
        value: Array,
        step: String
    },
    data() {
        return {
            sliderValue: [null,null],
            selectedMin: this.value[0],
            selectedMax: this.value[1],
            minMenu: false,
            maxMenu: false,
            requiredRule: [v => !!v || this.$t("forms.requiredField")]
        }
    },
    computed: {
        format(){
            if (this.step == "days") {
                return "YYYY-MM-DD"
            } else if (this.step == "months") {
                return "YYYY-MM"
            }
        },
        minMoment(){return this.$moment(this.min)},
        maxMoment(){return this.$moment(this.max)},
        rangeDiff(){return this.maxMoment.diff(this.minMoment, this.step)},
        selectedMinMoment(){return this.$moment(this.selectedMin)},
        selectedMaxMoment(){return this.$moment(this.selectedMax)},
        selectedMinInt(){return this.selectedMinMoment.diff(this.minMoment, this.step)},
        selectedMaxInt(){return this.selectedMaxMoment.diff(this.minMoment, this.step)},

        result(){return [this.selectedMin, this.selectedMax]}
    },
    mounted(){
        this.sliderValue = [this.selectedMinInt, this.selectedMaxInt]
    },
    watch: {        
        'sliderValue.0': function(min) {
            this.selectedMin = this.intToDate(min)
        },
        'sliderValue.1': function(max) {
            this.selectedMax = this.intToDate(max)
        },
        "selectedMin" : function(){
            this.sliderValue = [this.selectedMinInt, this.sliderValue[1]];
        },
        "selectedMax" : function(){
            this.sliderValue = [this.sliderValue[0], this.selectedMaxInt];
        },
        result: function(value){
            this.$emit('input', value)
        }
    },
    methods:{
        intToDate(value){
            return this.$moment(this.min).add(value, this.step.substr(0,1)).format(this.format)
        }
    }
}
</script>
