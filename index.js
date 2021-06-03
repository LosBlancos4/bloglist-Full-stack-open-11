const http = require('http')
const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

if(!config.PORT) {
    config.PORT = 3001
}

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})