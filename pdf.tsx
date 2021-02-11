import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import LogoPng from './assets/react-logo.png'
import * as fs from 'fs'
import * as path from 'path'

export type TemplateProps = {
  title: string
  content: string
}

// Chrome does not allow to load local resources in non-local pages, will encode them in base64
const base64EncodeImg = (file: string) =>
  'data:image/png;base64,' +
  Buffer.from(fs.readFileSync(path.join(__dirname, file))).toString('base64')

const Page: React.FC<{
  className?: string
  style?: React.CSSProperties
  data: TemplateProps
}> = ({ data, children, className, style }) => (
  <div className={className} style={{ pageBreakAfter: 'always', ...style }}>
    <div
      className="flex"
      style={{
        height: '70px',
        color: 'white',
        background: 'green',
        justifyContent: 'left',
        alignItems: 'center',
      }}
    >
      <img
        src={base64EncodeImg(LogoPng)}
        style={{
          height: '45px',
          display: 'flex',
          maxHeight: '100%',
          objectFit: 'contain',
          margin: '0 30px',
        }}
      />
      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.title}</span>
    </div>
    <div>{children}</div>
  </div>
)

export const PdfTemplate: React.FC<{ data: TemplateProps }> = ({ data }) => {
  return (
    <>
      <style>{`
      @import url(https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap);

      body { font-family: Montserrat; margin: 0; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
    `}</style>
      <div>
        <Page data={data} style={{ paddingBottom: '20%' }}>
          <div>{data.content}</div>
        </Page>
        <Page data={data} />
      </div>
    </>
  )
}

export const staticRenderPdf = (data: TemplateProps) =>
  ReactDOMServer.renderToStaticMarkup(<PdfTemplate data={data} />)
