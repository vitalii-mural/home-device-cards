window.customCards = window.customCards || [];
for (const [type, name, description] of Object.values(HOME_DEVICE_CARD_META)) {
  if (!window.customCards.some(card => card.type === type)) window.customCards.push({ type, name, description });
}
