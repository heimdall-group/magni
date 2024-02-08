import { Router } from "express";

/**
 * @param {SocketIOServer} io Socket.io Server instance
 */
export default (io) => {
  const router = Router();

  // For now we only add POST route to set user room the specific path.
  // router.get('/:id', (req, res) => {
  //   console.log(req.params.id);
  // })
  router.post('/', (req, res) => {
    
  })

  return router
};
