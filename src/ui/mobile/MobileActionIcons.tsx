import { ArrowUp, Check, ChevronRight, MessageCircle } from 'lucide-react'

type MobileActionIconProps = {
  className?: string
}

export function InspectIcon({ className = 'size-6' }: MobileActionIconProps) {
  return <MessageCircle className={className} strokeWidth={2} aria-hidden />
}

export function NextIcon({ className = 'size-6' }: MobileActionIconProps) {
  return <ChevronRight className={className} strokeWidth={2} aria-hidden />
}

export function DoneIcon({ className = 'size-6' }: MobileActionIconProps) {
  return <Check className={className} strokeWidth={2} aria-hidden />
}

export function JumpIcon({ className = 'size-6' }: MobileActionIconProps) {
  return <ArrowUp className={className} strokeWidth={2.25} aria-hidden />
}
