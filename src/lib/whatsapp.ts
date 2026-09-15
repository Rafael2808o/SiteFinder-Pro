export function whatsappDigits(phone?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function buildWhatsappUrl(phone?: string, message?: string): string | null {
  const digits = whatsappDigits(phone)
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
