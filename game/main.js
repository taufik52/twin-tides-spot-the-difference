/* Twin Tides — main.js
   Boot and wiring: buttons, keyboard, panel clicks, the timer loop and
   the screenshot-staging hook. Staging (used only to photograph the
   game) reads URL query parameters: ?shot=title|win|round&round=2
   &found=0,1,2&hint=4 stages that exact state with the timer paused. */

(function (global) {
  'use strict';

  var Game = global.TwinTidesGame;
  var Audio = global.TwinTidesAudio;

  function parseStaging() {
    var params = new URLSearchParams(global.location.search);
    return {
      shot: params.get('shot') || '',
      round: parseInt(params.get('round') || '1', 10),
      found: (params.get('found') || '').split(',').filter(function (s) { return s !== ''; }).map(function (s) { return parseInt(s, 10); }),
      hint: params.get('hint') === null ? -1 : parseInt(params.get('hint'), 10)
    };
  }

  function applyStaging(stage) {
    if (!stage.shot) return false;
    var state = Game.state;
    if (stage.shot === 'title') {
      Game.loadRound(0);
      state.screen = 'title';
      state.timeLeft = 150;
      Game.updateHud();
      return true;
    }
    if (stage.shot === 'win') {
      Game.loadRound(2);
      state.screen = 'playing';
      state.paused = true;
      state.timeLeft = 42;
      var round = global.TwinTidesScenes.rounds[2];
      state.found = round.diffs.map(function (_, i) { return i; });
      state.score = 3420;
      state.totalFound = 27;
      Game.renderPanels();
      Game.updateHud();
      state.screen = 'win';
      Game.setMessage('You win! Final score 3420.');
      var card = document.getElementById('overlay');
      if (card) {
        card.classList.remove('overlay-hide');
        card.classList.add('overlay-show');
        document.getElementById('overlay-title').textContent = 'YOU FOUND THEM ALL!';
        document.getElementById('overlay-text').textContent = 'All 27 differences across three harbors — Harbor Dawn, Midday Market and Dusk Lighthouse. Final score: 3420. The tides are yours.';
        document.getElementById('btn-start').textContent = 'Play again';
      }
      return true;
    }
    var roundIndex = Math.min(2, Math.max(0, (stage.round || 1) - 1));
    Game.loadRound(roundIndex);
    Game.hideOverlay();
    state.screen = 'playing';
    state.paused = true;
    state.timeLeft = [134, 121, 97][roundIndex];
    state.found = stage.found.filter(function (i) {
      return i >= 0 && i < global.TwinTidesScenes.rounds[roundIndex].diffs.length;
    });
    state.score = state.found.length * 137 + roundIndex * 400;
    if (stage.hint >= 0) state.hintIndex = stage.hint;
    Game.renderPanels();
    Game.updateHud();
    Game.setMessage('Staged view — ' + state.found.length + ' differences found.');
    return true;
  }

  function boot() {
    var doc = global.document;
    Game.bindElements(doc);

    var canvasA = doc.getElementById('panel-a');
    var canvasB = doc.getElementById('panel-b');
    canvasA.addEventListener('click', function (ev) { Game.handlePanelClick(canvasA, ev.clientX, ev.clientY); });
    canvasB.addEventListener('click', function (ev) { Game.handlePanelClick(canvasB, ev.clientX, ev.clientY); });

    doc.getElementById('btn-hint').addEventListener('click', function () { Game.useHint(); });
    doc.getElementById('btn-restart').addEventListener('click', function () { Game.restartRound(); });
    doc.getElementById('btn-sound').addEventListener('click', function () { Game.toggleSound(); });
    doc.getElementById('btn-start').addEventListener('click', function () {
      var screen = Game.state.screen;
      if (screen === 'title' || screen === 'win') {
        Game.startGame();
      } else if (screen === 'roundClear') {
        Game.nextRound();
      } else if (screen === 'timeout') {
        Game.restartRound();
      }
    });

    doc.addEventListener('keydown', function (ev) {
      if (ev.key === 'h' || ev.key === 'H') Game.useHint();
      if (ev.key === 'r' || ev.key === 'R') Game.restartRound();
      if (ev.key === 'Enter' && Game.state.screen === 'title') Game.startGame();
    });

    Game.loadRound(0);
    Game.state.screen = 'title';
    Game.updateHud();
    var staged = applyStaging(parseStaging());
    if (!staged) {
      Game.setMessage('Welcome aboard — press Start to play.');
    }
    global.requestAnimationFrame(Game.tick);

    // Test hook for local play-testing: click a scene point, read state.
    global.__twinTides = {
      state: Game.state,
      clickScenePoint: function (panel, x, y) {
        var canvas = panel === 'B' ? canvasB : canvasA;
        var rect = canvas.getBoundingClientRect();
        var cx = rect.left + (x / global.TwinTidesScenes.width) * rect.width;
        var cy = rect.top + (y / global.TwinTidesScenes.height) * rect.height;
        Game.handlePanelClick(canvas, cx, cy);
      },
      start: function () { Game.startGame(); },
      hint: function () { Game.useHint(); },
      nextRound: function () { Game.nextRound(); },
      restart: function () { Game.restartRound(); }
    };
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
