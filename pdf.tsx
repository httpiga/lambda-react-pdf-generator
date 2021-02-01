import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import * as LogoPng from './assets/react-logo.png'
import * as fs from 'fs'

type TemplateProps = {
  data: {
    title: string
  }
}

// Chrome does not allow to load local resources in non-local pages, will encode them in base64
function base64_encode(file) {
  var bitmap = fs.readFileSync(file)
  return bitmap.toString('base64')
}

export const PdfTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div>
      <div
        style={{
          height: '50px',
          backgroundColor: 'black',
          color: 'white',
          background: 'black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Montserrat',
        }}
      >
        <img
          src={'data:image/png;base64,' + base64_encode(LogoPng)}
          style={{
            height: '20px',
            objectFit: 'contain',
            marginRight: '20px',
          }}
        />
        <span>{data.title}</span>
      </div>
    </div>
  )
}

export const staticRenderPdf = (data: any) =>
  ReactDOMServer.renderToStaticMarkup(<PdfTemplate data={data} />)
