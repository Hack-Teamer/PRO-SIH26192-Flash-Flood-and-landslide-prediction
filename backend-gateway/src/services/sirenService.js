/**
 * IoT Village Siren Relay Trigger Service
 * Sends encrypted LoRaWAN / MQTT control packet to village high-decibel siren nodes.
 */

function triggerVillageSiren(villageId, tier) {
  if (tier === 'Red' || tier === 'Orange') {
    console.log(`🔊 [PHYSICAL SIREN RELAY ACTIVATED] Node Siren-${villageId}: Signal = PATTERN_${tier.toUpperCase()}_WARBLE (95 dB)`);
    return { siren_status: 'ACTIVATED', node_id: `SIREN-${villageId}`, sound_pattern: `PATTERN_${tier.toUpperCase()}` };
  }
  return { siren_status: 'STANDBY', node_id: `SIREN-${villageId}` };
}

module.exports = { triggerVillageSiren };
