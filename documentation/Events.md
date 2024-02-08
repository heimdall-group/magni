
##### Client events
| Name | Description | Object |
| ---- | ---- | ---- |
| page:user-joined | A new client has joined the current page. Emitted from Server Event page:join |  |
| page:user-left | A client has left the current page. Emitted from Server Event page:leave |  |
|  |  |  |

##### Server events
| Name | Description | Object |
| ---- | ---- | ---- |
| page:join | Client get added to specific room |  |
| page:leave | Client gets removed from specific room |  |
| page:has-async-block | A synced block is open. Creates a new room |  |
