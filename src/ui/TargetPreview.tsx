import { useEffect, useState } from 'react'
import {
  getTargetPreviewImage,
  isTargetPreviewError,
  isTargetPreviewPending,
  requestTargetPreview,
  subscribeTargetPreview,
} from './targetPreviewCache'

type TargetPreviewProps = {
  meebitNumber: number
  sizeClassName?: string
  /** @deprecated 静止画キャプチャでは未使用（互換のため残す） */
  modelScale?: number
  /** @deprecated 静止画キャプチャでは未使用（互換のため残す） */
  cameraDistance?: number
  /** @deprecated 静止画キャプチャでは未使用（互換のため残す） */
  cameraY?: number
  /** @deprecated 静止画キャプチャでは未使用（互換のため残す） */
  modelYOffset?: number
}

export function TargetPreview({
  meebitNumber,
  sizeClassName = 'h-44 w-44',
}: TargetPreviewProps) {
  const [, refresh] = useState(0)

  useEffect(() => {
    requestTargetPreview(meebitNumber)
    return subscribeTargetPreview(meebitNumber, () => {
      refresh((value) => value + 1)
    })
  }, [meebitNumber])

  const imageSrc = getTargetPreviewImage(meebitNumber)
  const isPending = isTargetPreviewPending(meebitNumber)
  const isError = isTargetPreviewError(meebitNumber)

  return (
    <div
      className={`${sizeClassName} overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`Meebit #${meebitNumber}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : isError ? (
        <PreviewFallback meebitNumber={meebitNumber} />
      ) : isPending ? (
        <PreviewLoading />
      ) : null}
    </div>
  )
}

function PreviewLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200">
      <div className="size-5 animate-pulse rounded-full bg-neutral-400/70" />
    </div>
  )
}

function PreviewFallback({ meebitNumber }: { meebitNumber: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-200 text-neutral-500">
      <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em]">Meebit</span>
      <span className="text-sm font-black">#{meebitNumber}</span>
    </div>
  )
}
