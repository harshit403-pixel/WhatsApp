import createApp from "./src/app.js"
import { connectDb } from "./src/config/db.js"
import env from "./src/config/env.js"

let PORT = env.PORT

const app = createApp()

function startServer() {
  connectDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`server is runnign on port ${PORT}`)
      })
    })
    .catch((err) => console.log(err))
}

startServer()