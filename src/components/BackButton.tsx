import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ fallback }: { fallback: string }) {
  const navigate = useNavigate()
  const goBack = () => {
    // HashRouter records its own session-history index. Unlike history.length,
    // this does not count an unrelated site before the initial deep link.
    const index: unknown = window.history.state?.idx
    if (typeof index === 'number' && index > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  return <button type="button" className="back-button" onClick={goBack} aria-label="Go back; dashboard if no app history"><ArrowLeft size={19} aria-hidden="true" /><span>Back</span></button>
}
