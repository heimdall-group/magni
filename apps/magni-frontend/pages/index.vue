<script setup lang="ts">
  const route = useRoute()
  const socket = useSocket()

  const handleClick = () => {
    socket.emit('message', {page: route.name})
  }
</script>

<template>
  <div>
    {{ route.name }}
  </div>
</template>
