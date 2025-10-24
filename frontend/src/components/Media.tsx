import React from 'react'
import { Question } from '../types'

export default function Media({ media }: { media: Question['media'] }) {
  if (!media) return null
  if (media.type === 'image') return <img src={media.src} alt={media.alt || ''} style={{maxWidth:'100%',borderRadius:12}} />
  if (media.type === 'video') return <video src={media.src} controls style={{maxWidth:'100%',borderRadius:12}} />
  return null
}
