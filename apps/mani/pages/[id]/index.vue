<script setup lang="ts">
  const route = useRoute();
  const id = route.params.id;
  const socket = useSocket();
  const participants = ref(false);
  
  onMounted(() => {
    // Get current page
    // Get all object content
    
  })

</script>

<template>
  {{ id }}
</template>
