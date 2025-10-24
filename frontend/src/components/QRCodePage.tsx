import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { t } from '../i18n'
import type { Lang } from '../types'

export default function QRCodePage({ lang }: { lang: Lang }) {
  const publicUrl = (import.meta.env.VITE_PUBLIC_URL?.trim()) || window.location.origin
  const tt = t(lang)
  return (
    <div className="card" style={{textAlign:'center'}}>
      <h2>{tt.qrCode}</h2>
      <p>{tt.scanToPlay}</p>
      <QRCodeCanvas value={publicUrl} size={260} includeMargin />
      <p style={{wordBreak:'break-all'}}>{publicUrl}</p>
    </div>
  )
}
