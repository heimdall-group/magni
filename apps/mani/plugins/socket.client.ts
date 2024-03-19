import { io } from 'socket.io-client'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { API_URL } = useRuntimeConfig().public;
  const socket = io(API_URL);
  
  nuxtApp.provide('socket', socket)
  nuxtApp.provide('io', io)
})