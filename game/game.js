/* Twin Tides — game.js
   The game state and rules: rounds, clicks, ring markers, the counter,
   the countdown timer, hints, penalties, scoring and the win screen.
   It draws the scenes (from scenes.js) onto the two canvases and paints
   markers on top of them. */

(function (global) {
  'use strict';

  var Scenes = global.TwinTidesScenes;
  var Audio = global.TwinTidesAudio;

  var MISS_PENALTY_SECONDS = 3;
  var HINTS_PER_ROUND = 3;
  var FIND_BASE_POINTS = 100;
  var ROUND_CLEAR_BONUS_PER_SECOND = 10;

  var state = {
    screen: 'title', // title | playing | roundClear | win | timeout
    roundIndex: 0,
    found: [],
    misses: [],
    hintsLeft: HINTS_PER_ROUND,
    hintIndex: -1,
    timeLeft: 0,
    score: 0,
    totalFound: 0,
    totalDiffs: 0,
    paused: false,
    lastTick: 0
  };

  var els = {};

  function currentRound() {
    return Scenes.rounds[state.roundIndex];
  }

  function remainingCount() {
    return currentRound().diffs.length - state.found.length;
  }

  function formatTime(seconds) {
    var s = Math.max(0, Math.ceil(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function setMessage(text) {
    if (els.message) els.message.textContent = text;
    if (els.status) els.status.textContent = text;
  }

  function updateHud() {
    var round = currentRound();
    if (els.roundLabel) els.roundLabel.textContent = (state.roundIndex + 1) + ' / ' + Scenes.rounds.length;
    if (els.foundLabel) els.foundLabel.textContent = state.found.length + ' / ' + round.diffs.length;
    if (els.timeLabel) els.timeLabel.textContent = formatTime(state.timeLeft);
    if (els.scoreLabel) els.scoreLabel.textContent = String(state.score);
    if (els.hintCount) els.hintCount.textContent = String(state.hintsLeft);
    if (els.hintButton) els.hintButton.disabled = state.screen !== 'playing' || state.hintsLeft <= 0;
    if (els.timeStat) els.timeStat.classList.toggle('low', state.screen === 'playing' && state.timeLeft <= 30);
    if (els.roundName) els.roundName.textContent = 'Round ' + (state.roundIndex + 1) + ' — ' + round.name;
    if (els.roundTag) els.roundTag.textContent = round.tagline;
  }

  function drawMarkers(ctx) {
    var round = currentRound();
    var now = Date.now() / 1000;
    var i;
    for (i = 0; i < state.found.length; i++) {
      var d = round.diffs[state.found[i]];
      ctx.strokeStyle = '#37c8ab';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#37c8ab';
      ctx.beginPath();
      ctx.arc(d.x, d.y - d.r - 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(d.x - 4, d.y - d.r - 12);
      ctx.lineTo(d.x - 1, d.y - d.r - 8);
      ctx.lineTo(d.x + 5, d.y - d.r - 16);
      ctx.stroke();
    }
    for (i = 0; i < state.misses.length; i++) {
      var miss = state.misses[i];
      var age = now - miss.at;
      if (age > 1.6) continue;
      var alpha = 1 - age / 1.6;
      ctx.strokeStyle = 'rgba(180,190,200,' + alpha.toFixed(2) + ')';
      ctx.lineWidth = 3;
      var s = 9;
      ctx.beginPath();
      ctx.moveTo(miss.x - s, miss.y - s);
      ctx.lineTo(miss.x + s, miss.y + s);
      ctx.moveTo(miss.x + s, miss.y - s);
      ctx.lineTo(miss.x - s, miss.y + s);
      ctx.stroke();
    }
    if (state.hintIndex >= 0) {
      var h = round.diffs[state.hintIndex];
      var pulse = 6 + Math.sin(now * 5) * 3;
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function renderPanels() {
    var round = currentRound();
    var a = els.canvasA.getContext('2d');
    var b = els.canvasB.getContext('2d');
    round.draw(a, false);
    round.draw(b, true);
    drawMarkers(a);
    drawMarkers(b);
  }

  function showOverlay(title, text, buttonText) {
    if (!els.overlay) return;
    els.overlay.classList.remove('overlay-hide');
    els.overlay.classList.add('overlay-show');
    if (els.overlayTitle) els.overlayTitle.textContent = title;
    if (els.overlayText) els.overlayText.textContent = text;
    if (els.startButton) els.startButton.textContent = buttonText;
  }

  function hideOverlay() {
    if (!els.overlay) return;
    els.overlay.classList.remove('overlay-show');
    els.overlay.classList.add('overlay-hide');
  }

  function loadRound(index) {
    state.roundIndex = index;
    state.found = [];
    state.misses = [];
    state.hintsLeft = HINTS_PER_ROUND;
    state.hintIndex = -1;
    state.timeLeft = currentRound().timeLimit;
    state.lastTick = Date.now();
    renderPanels();
    updateHud();
  }

  function startGame() {
    Audio.ensureContext();
    state.score = 0;
    state.totalFound = 0;
    state.totalDiffs = 0;
    for (var i = 0; i < Scenes.rounds.length; i++) state.totalDiffs += Scenes.rounds[i].diffs.length;
    state.screen = 'playing';
    hideOverlay();
    loadRound(0);
    setMessage('Round 1 — find all 7 differences before the timer runs out.');
  }

  function restartRound() {
    if (state.screen !== 'playing' && state.screen !== 'timeout') return;
    Audio.ensureContext();
    state.screen = 'playing';
    hideOverlay();
    loadRound(state.roundIndex);
    setMessage('Round restarted — fresh eyes, same differences.');
  }

  function nearestUnfound(x, y) {
    var round = currentRound();
    var best = -1;
    var bestDist = Infinity;
    for (var i = 0; i < round.diffs.length; i++) {
      if (state.found.indexOf(i) >= 0) continue;
      var d = round.diffs[i];
      var dist = Math.hypot(x - d.x, y - d.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return { index: best, dist: bestDist };
  }

  function handlePanelClick(panel, clientX, clientY) {
    if (state.screen !== 'playing' || state.paused) return;
    Audio.ensureContext();
    var rect = panel.getBoundingClientRect();
    var x = (clientX - rect.left) * (Scenes.width / rect.width);
    var y = (clientY - rect.top) * (Scenes.height / rect.height);
    var hit = nearestUnfound(x, y);
    var round = currentRound();
    if (hit.index >= 0 && hit.dist <= round.diffs[hit.index].r + 14) {
      state.found.push(hit.index);
      state.totalFound += 1;
      state.hintIndex = state.hintIndex === hit.index ? -1 : state.hintIndex;
      var gained = FIND_BASE_POINTS + Math.round(state.timeLeft);
      state.score += gained;
      Audio.playChime();
      renderPanels();
      updateHud();
      var left = remainingCount();
      if (left === 0) {
        completeRound();
      } else {
        setMessage('Found it — ' + round.diffs[hit.index].note + '! ' + left + ' to go. (+' + gained + ')');
      }
    } else {
      state.misses.push({ x: x, y: y, at: Date.now() / 1000 });
      state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY_SECONDS);
      Audio.playWrongBlip();
      renderPanels();
      updateHud();
      setMessage('Not a difference — 3 seconds lost. Look closer.');
      if (state.timeLeft <= 0) timeUp();
    }
  }

  function useHint() {
    if (state.screen !== 'playing' || state.paused) return;
    if (state.hintsLeft <= 0) {
      setMessage('No hints left this round.');
      return;
    }
    var remaining = [];
    var round = currentRound();
    for (var i = 0; i < round.diffs.length; i++) {
      if (state.found.indexOf(i) < 0) remaining.push(i);
    }
    if (remaining.length === 0) return;
    state.hintsLeft -= 1;
    state.hintIndex = remaining[Math.floor(Math.random() * remaining.length)];
    Audio.playHintSparkle();
    renderPanels();
    updateHud();
    setMessage('Hint: something changed inside the gold ring. ' + state.hintsLeft + ' hints left.');
  }

  function completeRound() {
    var bonus = Math.round(state.timeLeft) * ROUND_CLEAR_BONUS_PER_SECOND;
    state.score += bonus;
    updateHud();
    if (state.roundIndex + 1 >= Scenes.rounds.length) {
      state.screen = 'win';
      Audio.playWinArpeggio();
      renderPanels();
      showOverlay(
        'YOU FOUND THEM ALL!',
        'All ' + state.totalDiffs + ' differences across three harbors — Harbor Dawn, Midday Market and Dusk Lighthouse. Final score: ' + state.score + ' (including a ' + bonus + '-point time bonus). The tides are yours.',
        'Play again'
      );
      setMessage('You win! Final score ' + state.score + '.');
    } else {
      state.screen = 'roundClear';
      Audio.playWinArpeggio();
      showOverlay(
        'ROUND CLEAR!',
        'Every difference in ' + currentRound().name + ' found. Time bonus: +' + bonus + '. Score: ' + state.score + '. The next harbor is waiting.',
        'Next round'
      );
      setMessage('Round clear! +' + bonus + ' time bonus.');
    }
  }

  function nextRound() {
    state.screen = 'playing';
    hideOverlay();
    loadRound(state.roundIndex + 1);
    setMessage('Round ' + (state.roundIndex + 1) + ' — ' + currentRound().diffs.length + ' differences to find.');
  }

  function timeUp() {
    state.screen = 'timeout';
    state.timeLeft = 0;
    updateHud();
    Audio.playWrongBlip();
    showOverlay(
      'TIME’S UP',
      'The tide ran out with ' + remainingCount() + ' difference(s) still hiding in ' + currentRound().name + '. Your score so far: ' + state.score + '.',
      'Retry this round'
    );
    setMessage('Time up — ' + remainingCount() + ' differences left unfound.');
  }

  function tick() {
    if (state.screen === 'playing' && !state.paused) {
      var now = Date.now();
      var elapsed = (now - state.lastTick) / 1000;
      state.lastTick = now;
      state.timeLeft -= elapsed;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        updateHud();
        timeUp();
      } else {
        updateHud();
        if (state.misses.length > 0 || state.hintIndex >= 0) renderPanels();
      }
    } else {
      state.lastTick = Date.now();
    }
    global.requestAnimationFrame(tick);
  }

  function toggleSound() {
    Audio.setEnabled(!Audio.isEnabled());
    if (els.soundButton) els.soundButton.textContent = 'Sound: ' + (Audio.isEnabled() ? 'On' : 'Off');
  }

  function bindElements(doc) {
    els.canvasA = doc.getElementById('panel-a');
    els.canvasB = doc.getElementById('panel-b');
    els.roundLabel = doc.getElementById('round-label');
    els.foundLabel = doc.getElementById('found-label');
    els.timeLabel = doc.getElementById('time-label');
    els.scoreLabel = doc.getElementById('score-label');
    els.hintCount = doc.getElementById('hint-count');
    els.hintButton = doc.getElementById('btn-hint');
    els.restartButton = doc.getElementById('btn-restart');
    els.soundButton = doc.getElementById('btn-sound');
    els.timeStat = doc.getElementById('stat-time');
    els.roundName = doc.getElementById('round-name');
    els.roundTag = doc.getElementById('round-tag');
    els.message = doc.getElementById('message');
    els.status = doc.getElementById('status');
    els.overlay = doc.getElementById('overlay');
    els.overlayTitle = doc.getElementById('overlay-title');
    els.overlayText = doc.getElementById('overlay-text');
    els.startButton = doc.getElementById('btn-start');
  }

  global.TwinTidesGame = {
    state: state,
    bindElements: bindElements,
    startGame: startGame,
    restartRound: restartRound,
    nextRound: nextRound,
    handlePanelClick: handlePanelClick,
    useHint: useHint,
    loadRound: loadRound,
    renderPanels: renderPanels,
    updateHud: updateHud,
    hideOverlay: hideOverlay,
    tick: tick,
    toggleSound: toggleSound,
    setMessage: setMessage
  };
})(window);
