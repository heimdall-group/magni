import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { io } from "socket.io-client";

export function useSocket (): ReturnType<typeof io> {
  const { $socket } = useNuxtApp()
  return $socket
}

export const setWebsocketAlerts = (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  socket.on('connect', () => {
    console.log(`Connection: ${socket.connected}`)
  })
  
  socket.on('disconnect', () => {
    console.log(`Connection: ${socket.connected}`)
  });

  socket.on('message', (message) => {
    console.log(`Message: ${message}`)
  });

  socket.on('apiEvent', (data) => {
    console.log(`Api Event:`)
    console.log(data)
  })
}

export const setWebSocketBlock = () => {
  
}
