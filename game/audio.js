/* Twin Tides — audio.js
   All sound is synthesised with WebAudio: no audio files, no network.
   A pleasant chime on each find, a soft blip on a miss, a sparkle for
   hints and a little arpeggio when a round (or the game) is won. */

(function (global) {
  'use strict';

  var context = null;
  var enabled = true;

  function ensureContext() {
    if (!context) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (AC) context = new AC();
    }
    if (context && context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, startAt, duration, type, volume) {
    var ctx = ensureContext();
    if (!ctx || !enabled) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  function playChime() {
    tone(659.25, 0, 0.35, 'sine', 0.25);
    tone(987.77, 0.09, 0.45, 'sine', 0.22);
    tone(1318.5, 0.18, 0.5, 'sine', 0.14);
  }

  function playWrongBlip() {
    tone(196, 0, 0.22, 'square', 0.08);
    tone(147, 0.1, 0.28, 'square', 0.07);
  }

  function playHintSparkle() {
    tone(1046.5, 0, 0.18, 'triangle', 0.16);
    tone(1568, 0.08, 0.3, 'triangle', 0.14);
  }

  function playWinArpeggio() {
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    for (var i = 0; i < notes.length; i++) tone(notes[i], i * 0.11, 0.5, 'sine', 0.2);
  }

  function playTick() {
    tone(880, 0, 0.07, 'sine', 0.08);
  }

  function setEnabled(value) {
    enabled = !!value;
  }

  function isEnabled() {
    return enabled;
  }

  global.TwinTidesAudio = {
    ensureContext: ensureContext,
    playChime: playChime,
    playWrongBlip: playWrongBlip,
    playHintSparkle: playHintSparkle,
    playWinArpeggio: playWinArpeggio,
    playTick: playTick,
    setEnabled: setEnabled,
    isEnabled: isEnabled
  };
})(window);
