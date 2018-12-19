<template>
    <v-select
        :items="items"
        v-model="selected"
        :multiple="multiple"
        :label="label"
        item-text="name"
        item-value="categoryId"
        return-object
        single-line
        append-icon="keyboard_arrow_down"
        :class="!multiple ? '' : 'caption'"
        :rules="rules"
        :persistent-hint="persistentHint"
        :hint="hint">

        <v-list-tile 
            :color="categoriesSelected != 'none' ? 'blue darken-2' : ''" 
            slot="prepend-item" 
            v-if="multiple"
            ripple 
            @click="toggleSelectedCategories">
            <v-list-tile-action>
                <v-icon color="blue darken-2" v-if="categoriesSelected == 'all'">
                    check_box
                </v-icon>
                <v-icon color="blue darken-2"  v-if="categoriesSelected == 'some'">                                      
                    indeterminate_check_box
                </v-icon>
                <v-icon v-if="categoriesSelected == 'none'">
                    check_box_outline_blank
                </v-icon>
            </v-list-tile-action>
            <v-list-tile-title >
                {{$t("general.selectAll")}}
            </v-list-tile-title>
        </v-list-tile>
        <v-divider v-if="multiple" slot="prepend-item" class="mt-2"></v-divider>

        <template slot="item" slot-scope="data">
            <v-list-tile-action v-if="data.item">
                <v-icon>{{ data.item.icon }}</v-icon>
            </v-list-tile-action>
                <span>{{ data.item.name }}</span>
         
        </template>

        <template slot="selection" slot-scope="{ item, index }">
            <span v-if="multiple && index > 0">,&nbsp;</span>
            <v-list-tile-action v-if="!multiple" >
                <v-icon>{{ item.icon}}</v-icon>
            </v-list-tile-action>  
            <span>{{ item.name }}</span>
        </template>
        
    </v-select>
</template>
<script>
export default {
    name: "VCategorySelect",
    props: {
        label: String, 
        rules: Array, 
        hint: String, 
        persistentHint: Boolean,
        items: {
            type: [Array, Object]
        },
        value: {
            type: [Array, Object]
        },
        multiple: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            model : this.value,
            requiredRule: [v => !!v || this.$t("forms.requiredField")]
        }        
    },
    watch: {
        value: function(value) {this.model = value}
    },
    computed: {
        selected: {
            get() {return this.model},
            set(value) {
                this.model = value
                this.$emit('input', value)
            }
        },
        categoriesSelected: function() {
            if (!this.multiple || !this.items || !this.selected || this.selected.length == 0){
                return "none";
            }
            var n = this.selected.length;
            var total = this.items.length;
            return (n == total ? "all" : "some" );
        }
    },
    methods: {
        toggleSelectedCategories() {
            if (this.categoriesSelected == "all") {
                this.selected = [];        
            } else {
                this.selected = this.items.slice();
            }
        }
    }
}
</script>
