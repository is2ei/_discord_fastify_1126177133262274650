import fs from 'node:fs'
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// 500KB
const RANGE_LIMIT = 500 * 1024

fastify.get('/stream', async (request, reply) => {
  const range = request.headers.range

  if (range != null) {
    const videoPath = 'sample.mp4'
    const videoSize = fs.statSync(videoPath).size
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end =
      parts[1]
        ? parseInt(parts[1], 10)
        : start + RANGE_LIMIT < videoSize - 1
          ? start + RANGE_LIMIT
          : videoSize - 1
    const chunkSize = end - start + 1
    const file = fs.createReadStream(videoPath, { start, end })

    await reply
      .code(206)
      .header('Content-Type', 'application/octet-stream') 
      .header('Content-Range', `bytes ${start}-${end}/${videoSize}`)
      .header('Accept-Ranges', 'bytes')
      .header('Content-Length', chunkSize)
      .send(file)
  }
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
