import { Router } from "express";
import blocks from "../../models/blocks.model.js";

/**
 * @param {SocketIOServer} io Socket.io Server instance
 */
export default (io) => {
  const router = Router();

  // For now we only add POST route to set user room the specific path.
  router.post('/', async (req, res) => {
    const { type, parent, room } = req.body;
    if (type === undefined) {
      res.status(400).json({error: "Type is required"});
    }
    if (room === undefined) {
      res.status(400).json({error: "Room is required"});
    }

    const block = await new blocks({
      type: type,
      parent: parent === undefined ? [] : [parent],
      properties: {
        content: "",
      },
    }).save();
    res.json(block);
  })

  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const block = await blocks.findOne({id});
    res.json(block);
  })

  return router
};
