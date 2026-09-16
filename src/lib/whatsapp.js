export function whatsappDigits(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function buildWhatsappUrl(phone, message) {
  const digits = whatsappDigits(phone)
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
