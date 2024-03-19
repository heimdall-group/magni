import type { Socket, io } from "socket.io-client";
declare module '#app' {

  interface NuxtApp {
      $io (): Socket
  }
}

declare module '#app' {
  interface NuxtApp {
    $io: io
    $socket: ReturnType<io>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
      $io (): Socket
  }
}

declare global {

}

export {}

