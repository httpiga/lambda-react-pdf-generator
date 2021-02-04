import { Context, Callback, APIGatewayEvent } from 'aws-lambda'
import chromium from 'chrome-aws-lambda'
import * as path from 'path'
import * as AWS from 'aws-sdk'
import { staticRenderPdf, TemplateProps } from './pdf'
export type InputBody = {
  data: TemplateProps
  fontSrc?: string[] | string // URL(s) for custom fonts
  returnUrl?: boolean // if true, returns a S3 URL instead of PDF file. if public=false, returns a signed URL
  public?: boolean // if true, set the PDF saved on S3 as public
}

exports.pdf = async (event: APIGatewayEvent, _context: Context, _callback: Callback) => {
  const body: InputBody = JSON.parse(event.body || '')
  const fontSrcs = body.fontSrc ? (Array.isArray(body.fontSrc) ? body.fontSrc : [body.fontSrc]) : []

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  })
  // Inject React to new page
  const page = await browser.newPage()

  for (let i = 0; i < fontSrcs.length; i++) {
    await page.addStyleTag({ url: fontSrcs[i] })
  }

  await page.setContent(staticRenderPdf(body.data), { waitUntil: 'networkidle0' })

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
        ACL: body.public ? 'public-read' : 'authenticated-read',
        Bucket: bucketName,
        Key: fileKey,
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      },
    ),
  )

  const pdfUrl = body.public
    ? `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`
    : await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: fileKey,
        Expires: 60 * 10, // 10 minutes
      })
  return body.returnUrl
    ? {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pdfUrl }, null),
      }
    : {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.byteLength,
        },
        body: pdfBuffer.toString('base64'),
        isBase64Encoded: true,
      }
}
