Block events are contained to rooms. These rooms are the current page you are in (Look in URL).

Joining these room happen onMounted
- Pass page id to join channel
Leaving a room happen on route change
- Use before each
- Check if before has id
	- If true call leave channel and pass page id

When updating a block we get parents of that block and itterate to find parent and emit event to those rooms. 


Synced blocks?
- Only in same organisation
- Room for synced blocks?
- Add to PageUserObject?
	- Allowes user to join & leave synced blocks room
- When pasting new block in another page emit to other parents
	- https://github.com/socketio/socket.io-cluster-adapter/issues/3



Backend:
- Nginx proxy
- Express routes and socket io
	- https://socket.io/docs/v3/using-multiple-nodes/
	- [How to Scale Node.js Socket Server with Nginx and Redis | Bits and Pieces](https://blog.bitsrc.io/how-to-scale-node-js-socket-server-with-nginx-and-redis-b02e23b3423c)
	- [Node.js+Socket.io+Nginx. Highly scalable and high performance… | by Ferit Özcan | Medium](https://medium.com/@feritzcan/node-js-socket-io-1cde93315a7d)
	- https://ably.com/topic/scaling-socketio