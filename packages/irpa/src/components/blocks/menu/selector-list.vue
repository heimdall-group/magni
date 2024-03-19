<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

  const props = defineProps({
    search: {
      type: String,
      default: '',
      require:  true,
    },
    active: {
      type: Number,
      default: 0,
      require:  true,
    }
  });
  const emits = defineEmits(['click', 'update:active'])
  const { t, locale } = useI18n();

  const types = ref([
    'heading_1',
    'heading_2',
    'heading_3',
    'page',
    'paragraph',
    'to_do',
    'bulleted_list',
    'toggle_list',
    'table',
    'code',
    'quote',
    'toggle_heading_1',
    'toggle_heading_2',
    'toggle_heading_3',
    'columns_2',
    'columns_3',
    'columns_4',
    'columns_5',
  ]);


  
  const getSearchStrings = () => {
    const obj: {[key: string]: {title: string, desc: string}} = {};
    types.value.forEach((type) => {
      obj[type] = {
        title: t(`block-type-${type}-title`).toLowerCase(),
        desc: t(`block-type-${type}-desc`).toLowerCase(),
      }
    })
    return obj;
  };
  
  const sortBasedOnSearch = () => {
    if (props.search) {
      return types.value.filter(type => JSON.stringify(searchWords.value[type]).includes(props.search));
    }
    return types.value;
  }
  const filteredTypes = computed(sortBasedOnSearch);
  const searchWords = ref(getSearchStrings());
  watch(locale, () => searchWords.value = getSearchStrings(), { immediate: true })
  watch(() => props.search, sortBasedOnSearch, { immediate: true });
</script>

<template>
  <v-list>
    {{ search }}
    {{ active }}
    <v-list-item
      v-for="(type, index) in filteredTypes"
      :active="active === index"
      :title="$t(`block-type-${type}-title`)"
      :subtitle="$t(`block-type-${type}-desc`)"
      @mouseover="$emit('update:active', index)"
      @click.prevent="$emit('click', type)"
    />
  </v-list>
</template>
