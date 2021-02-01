import { Context, Callback, APIGatewayEvent } from 'aws-lambda'
import * as chromium from 'chrome-aws-lambda'
import * as path from 'path'
import * as AWS from 'aws-sdk'
import { staticRenderPdf } from './pdf'

exports.pdf = async (event: APIGatewayEvent, _context: Context, _callback: Callback) => {
  const body = JSON.parse(event.body || '')

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  })
  // Inject React to new page
  const page = await browser.newPage()

  await page.addStyleTag({
    url: 'https://fonts.googleapis.com/css2?family=Montserrat&display=swap',
  })
  await page.setContent(staticRenderPdf({ ...body }), { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  // Upload PDF to S3
  const region = 'eu-central-1'
  const bucketName = 'my-bucket-name'
  const fileKey = path.join('path/to/pdf/folder', `generated.pdf`)

  const s3 = new AWS.S3({ region })
  await new Promise((resolve, reject) =>
    s3.putObject(
      {
        Body: pdfBuffer,
        ACL: 'public-read',
        Bucket: bucketName,
        Key: fileKey,
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      },
    ),
  )

  const pdfUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`

  return {
    statusCode: 200,
    body: JSON.stringify({ pdfUrl }, null),
  }
}
