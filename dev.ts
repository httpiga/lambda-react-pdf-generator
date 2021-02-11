import express from 'express'
import { staticRenderPdf } from './pdf'
import { InputBody } from './handler'
const app = express()
const port = 3000

// test data
const body: InputBody = {
  data: {
    title: 'Hello, world!',
    content: 'STONKS',
  },
  returnUrl: true,
  public: false,
}

app.get('/', (_req, res) => res.send(staticRenderPdf(body.data)))

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
