'use strict'

/**
 * Filtro de gatilho das automações (evento state_changed).
 *
 * Cada action configurada pode declarar um gatilho opcional:
 *   when: { device?, room?, state?, domain? }
 * Campos vazios/ausentes significam "qualquer". Só executa a action
 * quando o dispositivo que mudou de estado bate com o gatilho.
 */

function normalize(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const WHEN_KEYS = ['device', 'room', 'state', 'domain']

function hasWhen(action) {
  const when = action && action.when
  if (!when || typeof when !== 'object') return false
  return WHEN_KEYS.some((k) => typeof when[k] === 'string' && when[k].trim())
}

/**
 * Verifica se a action deve rodar para o evento state_changed.
 *
 * @param {object} action Action configurada ({ id, target, tool, args, when? })
 * @param {object} event  Dados do evento: { device, entityId, deviceName,
 *                        deviceState, deviceRoom }
 * @returns {boolean}
 */
function actionMatchesEvent(action, event) {
  if (!action || typeof action !== 'object') return false
  if (!hasWhen(action)) return true

  const when = action.when
  const evt = event || {}

  const deviceName = normalize(evt.deviceName)
  const entityId = normalize(evt.entityId)
  const deviceRoom = normalize(evt.deviceRoom)
  const deviceDomain = normalize(evt.device && evt.device.domain)
  const deviceState = normalize(evt.deviceState)

  if (typeof when.device === 'string' && when.device.trim()) {
    const q = normalize(when.device)
    if (!deviceName.includes(q) && !entityId.includes(q)) return false
  }
  if (typeof when.room === 'string' && when.room.trim()) {
    if (!deviceRoom.includes(normalize(when.room))) return false
  }
  if (typeof when.domain === 'string' && when.domain.trim()) {
    if (deviceDomain !== normalize(when.domain)) return false
  }
  if (typeof when.state === 'string' && when.state.trim()) {
    if (deviceState !== normalize(when.state)) return false
  }
  return true
}

module.exports = { actionMatchesEvent, normalize }
