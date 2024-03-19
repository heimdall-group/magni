/**
 * Socket clients joins room in request
 * @param {SocketIOServer} io
 * @param {Socket} socket 
 * @returns {Function}
 */
export const handleSocketJoinPage = (io, socket) => {
  return (data) => {
    /**
     * Join room
     * Get user nickname from request, Emit page:user-joined event
     */

    console.log(data)
    console.log(socket.id)
  }
}

/**
 * Socket clients leaves room in request
 * @param {Socket} socket 
 * @returns {Function}
 */
export const handleSocketLeavePage = (socket) => {
  return (data) => {
    /**
     * Leave room
     * Get user nickname from request, Emit page:user-left event
     */
    console.log(data)
    console.log(socket.id)
  }
}
