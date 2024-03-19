<script setup lang="ts">
  const socket = useSocket();
  const router = useRouter();

  const newpage = ref<Block>({
    type: 'page',
    properties: {
        content: 'Title',
    },
    content: [
      {
        id: 'page_id_2',
        type: 'page',
        properties: {content: 'New Page'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
      {
        id: 'heading_id_1',
        type: 'heading_1',
        properties: {content: 'Heading 1'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
      {
        id: 'heading_id_2',
        type: 'heading_2',
        properties: {content: 'Heading 2'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
      {
        id: 'heading_id_3',
        type: 'heading_3',
        properties: {content: 'Heading 3'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
      {
        id: 'paragraph_id_4',
        type: 'paragraph',
        properties: {content: 'Paragraph'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
    ],
    parents: {},
    id: 'page_id_1',
  });
  
  const handleRoomJoin = (room: any) => {
    socket.emit('room:join', room);
  }
  
  const handleRoomLeave = (room: any) => {
    socket.emit('room:leave', room);
  }

  const handleRoomEmit = (room: any) => {
    socket.emit('room:emit', room)
  }

  const createNewPage = () => {
    newpage.value = blockGetNewBlock('page')
  }

  onMounted(() => setWebsocketAlerts(socket))
  const block = ref({
    id: 'test_1',
    type: 'paragraph',
    properties: {
      content: 'Hello world',
    },
    content: [],
    parents: {},
  })

  const blockTest = ref({
    id: 'test_2',
    type: 'paragraph',
    properties: {
      content: 'Hello world test',
    },
    content: [],
    parents: {},
  })
</script>

<template>
  <v-row>
    <v-col cols="12" class="d-flex">
      <v-col cols="6">
        New editor
        <blocks-editor v-model:page="newpage" />
      </v-col>
      <v-col cols="6">
        <pre>
{{ JSON.stringify(newpage, null, 2) }}
        </pre>
      </v-col>
    </v-col>
  </v-row>
  <v-row>
    <v-col
      v-for="(index) in [1,2,3,4,5,6,7,8]"
      :key="`app-test-${index}`"
      cols="12"
    >
      <v-btn
        @click="() => handleRoomLeave(index)"
      >
        Leave room: {{ index }}
      </v-btn>
      <v-btn
        @click="() => handleRoomEmit(index)"
      >
        Emit to room: {{ index }}
      </v-btn>
      <v-btn
        @click="() => handleRoomJoin(index)"
      >
        Join room: {{ index }}
      </v-btn>
    </v-col>
  </v-row>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,200;6..12,300;6..12,400;6..12,500;6..12,600;6..12,700;6..12,800;6..12,900;6..12,1000&display=swap');
@import url(~/assets/css/fonts.css);
@import url(~/assets/css/blocks.css);


* {
  /* font-family: 'Quicksand'; */
  /* font-family: Montserrat; */
  font-family: 'Nunito Sans', sans-serif;
  text-transform: unset !important;
}

html {
  touch-action: manipulation;
  width: 100vw;
}
/* Scroll */

*::-webkit-scrollbar-button {
  display: none;
}

*::-webkit-scrollbar {
  width: 9px;
  height: 9px;
  background: transparent;
}

*::-webkit-scrollbar-track {
  background: transparent;
  width: 9px;
}

*::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 7px;
  width: 7px;
  border: 1px solid transparent;
}
</style>
