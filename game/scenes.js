/* Twin Tides — scenes.js
   Draws the three original harbor scenes procedurally on canvas.
   Every scene is drawn twice: panel A (the original) and panel B (the
   same scene with the round's differences applied). A difference is a
   small, fair change: a missing object, a swapped colour, or an added
   prop. Coordinates are in the 560 x 420 scene space. */

(function (global) {
  'use strict';

  var W = 560;
  var H = 420;

  function skyGradient(ctx, top, bottom) {
    var g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H * 0.62);
  }

  function seaGradient(ctx, top, bottom) {
    var g = ctx.createLinearGradient(0, H * 0.6, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);
  }

  function sunDisc(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function sunRays(ctx, x, y, r) {
    ctx.strokeStyle = '#f7d774';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
      ctx.lineTo(x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18));
      ctx.stroke();
    }
  }

  function cloudPuff(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y - 6 * s, 13 * s, 0, Math.PI * 2);
    ctx.arc(x + 36 * s, y, 15 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y + 6 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function birdMark(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 3, y - 7, x, y);
    ctx.quadraticCurveTo(x + 3, y - 7, x + 9, y);
    ctx.stroke();
  }

  function waveLines(ctx, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    var rows = [285, 315, 348, 382, 405];
    for (var i = 0; i < rows.length; i++) {
      var y = rows[i];
      for (var x = 20 + (i % 2) * 30; x < W - 30; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 12, y - 5, x + 24, y);
        ctx.stroke();
      }
    }
  }

  function dockPlanks(ctx, y) {
    ctx.fillStyle = '#8a6b48';
    ctx.fillRect(0, y, W, 46);
    ctx.strokeStyle = '#6b4f33';
    ctx.lineWidth = 2;
    for (var x = 0; x < W; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 46);
      ctx.stroke();
    }
    ctx.fillStyle = '#5d4429';
    ctx.fillRect(0, y + 42, W, 4);
  }

  function barrel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a3220';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 7);
    ctx.lineTo(x + 12, y - 7);
    ctx.moveTo(x - 13, y + 6);
    ctx.lineTo(x + 13, y + 6);
    ctx.stroke();
  }

  function sailBoat(ctx, x, y, sailColor, hullColor) {
    ctx.fillStyle = hullColor;
    ctx.beginPath();
    ctx.moveTo(x - 52, y);
    ctx.lineTo(x + 52, y);
    ctx.lineTo(x + 38, y + 20);
    ctx.lineTo(x - 38, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3d24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 78);
    ctx.stroke();
    ctx.fillStyle = sailColor;
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 74);
    ctx.lineTo(x + 3, y - 6);
    ctx.lineTo(x + 44, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 70);
    ctx.lineTo(x - 3, y - 6);
    ctx.lineTo(x - 34, y - 6);
    ctx.closePath();
    ctx.fill();
  }

  function flagOnPole(ctx, x, y, color) {
    ctx.strokeStyle = '#3a2c1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 46);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 46);
    ctx.lineTo(x + 26, y - 38);
    ctx.lineTo(x, y - 30);
    ctx.closePath();
    ctx.fill();
  }

  function houseBlock(ctx, x, y, w, h, wall, roof) {
    ctx.fillStyle = wall;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + w / 2, y - 26);
    ctx.lineTo(x + w + 6, y);
    ctx.closePath();
    ctx.fill();
  }

  function windowPane(ctx, x, y, lit) {
    ctx.fillStyle = lit ? '#ffd766' : '#274b63';
    ctx.fillRect(x, y, 16, 20);
    ctx.strokeStyle = '#1c2f3d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 16, 20);
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 8, y + 20);
    ctx.stroke();
  }

  /* ---------------- Round 1: Harbor Dawn (7 differences) ---------------- */
  function drawHarborDawn(ctx, b) {
    skyGradient(ctx, '#f7c873', '#f2a35e');
    sunDisc(ctx, 92, 62, 26, '#fff3b0');
    if (!b) sunRays(ctx, 92, 62, 26);
    cloudPuff(ctx, 300, 60, 1, 'rgba(255,244,214,0.9)');
    cloudPuff(ctx, 470, 110, 0.8, 'rgba(255,244,214,0.75)');
    birdMark(ctx, 150, 52, '#5a4632');
    if (!b) birdMark(ctx, 205, 40, '#5a4632');
    birdMark(ctx, 255, 66, '#5a4632');
    seaGradient(ctx, '#3f8ea6', '#1d5f7a');
    waveLines(ctx, 'rgba(255,255,255,0.35)');
    // Town on the far shore.
    houseBlock(ctx, 330, 150, 64, 62, '#e8d9b8', '#b3563a');
    houseBlock(ctx, 404, 138, 58, 74, '#d9c39a', '#8f4a2f');
    houseBlock(ctx, 468, 158, 56, 54, '#e8d9b8', '#b3563a');
    windowPane(ctx, 348, 168, true);
    windowPane(ctx, 372, 168, !b);
    windowPane(ctx, 420, 156, true);
    windowPane(ctx, 484, 176, false);
    // Chimney smoke on the middle house.
    if (!b) {
      ctx.fillStyle = 'rgba(240,240,235,0.85)';
      ctx.beginPath();
      ctx.arc(432, 96, 7, 0, Math.PI * 2);
      ctx.arc(440, 82, 9, 0, Math.PI * 2);
      ctx.arc(430, 66, 11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#6b4a33';
    ctx.fillRect(428, 108, 8, 22);
    // Sailboat with a flag.
    sailBoat(ctx, 205, 300, b ? '#ff8a6b' : '#fdf6e3', '#7a4a2b');
    flagOnPole(ctx, 296, 150, b ? '#37c8ab' : '#d94f3d');
    // Dock in the foreground.
    dockPlanks(ctx, 330);
    barrel(ctx, 120, 356, '#a9803e');
    barrel(ctx, 150, 360, '#8a6b48');
    if (b) barrel(ctx, 482, 352, '#a9803e');
    ctx.fillStyle = '#5d4429';
    ctx.fillRect(60, 330, 10, 46);
    ctx.fillRect(500, 330, 10, 46);
  }

  /* ---------------- Round 2: Midday Market (9 differences) ---------------- */
  function drawMiddayMarket(ctx, b) {
    skyGradient(ctx, '#7ec8e3', '#cfeef7');
    sunDisc(ctx, 500, 52, 24, '#fff7c0');
    cloudPuff(ctx, 120, 58, 1, 'rgba(255,255,255,0.95)');
    cloudPuff(ctx, 330, 44, 0.8, 'rgba(255,255,255,0.9)');
    birdMark(ctx, 300, 58, '#3a4a55');
    if (!b) birdMark(ctx, 360, 74, '#3a4a55');
    birdMark(ctx, 90, 92, '#3a4a55');
    seaGradient(ctx, '#4aa8c4', '#22708c');
    waveLines(ctx, 'rgba(255,255,255,0.4)');
    // Market stalls along the quay.
    houseBlock(ctx, 60, 150, 120, 90, '#f2e3c2', '#a34a2e');
    houseBlock(ctx, 210, 140, 130, 100, '#e8d3a8', '#7a3b26');
    houseBlock(ctx, 370, 155, 120, 85, '#f2e3c2', '#a34a2e');
    // Awning stripes on stall one.
    ctx.fillStyle = b ? '#3f9e6b' : '#d94f3d';
    ctx.fillRect(60, 150, 120, 18);
    ctx.fillStyle = '#fdf6e3';
    for (var ax = 72; ax < 180; ax += 24) ctx.fillRect(ax, 150, 10, 18);
    // Fish sign on stall two: a fish in A, a blank board in B.
    ctx.fillStyle = '#5a3d24';
    ctx.fillRect(232, 160, 88, 34);
    if (!b) {
      ctx.fillStyle = '#ffd766';
      ctx.beginPath();
      ctx.ellipse(276, 177, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(296, 177);
      ctx.lineTo(308, 169);
      ctx.lineTo(308, 185);
      ctx.closePath();
      ctx.fill();
    }
    // Umbrella over stall three: striped in A, plain in B.
    ctx.fillStyle = b ? '#e8a13c' : '#d94f3d';
    ctx.beginPath();
    ctx.arc(430, 150, 34, Math.PI, 0);
    ctx.fill();
    if (!b) {
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.moveTo(430, 116);
      ctx.lineTo(412, 150);
      ctx.lineTo(430, 150);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(430, 116);
      ctx.lineTo(448, 150);
      ctx.lineTo(430, 150);
      ctx.closePath();
      ctx.fill();
    }
    // Lantern hanging from stall three.
    ctx.strokeStyle = '#3a2c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(498, 150);
    ctx.lineTo(498, 168);
    ctx.stroke();
    ctx.fillStyle = b ? '#5a6a72' : '#ffd766';
    ctx.beginPath();
    ctx.arc(498, 178, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2c1c';
    ctx.stroke();
    // Crates: three in A, two in B.
    ctx.fillStyle = '#a9803e';
    ctx.fillRect(420, 268, 30, 30);
    ctx.fillRect(452, 268, 30, 30);
    if (!b) ctx.fillRect(436, 238, 30, 30);
    ctx.strokeStyle = '#6b4f33';
    ctx.lineWidth = 2;
    ctx.strokeRect(420, 268, 30, 30);
    ctx.strokeRect(452, 268, 30, 30);
    // Cat asleep on a crate (A only).
    if (!b) {
      ctx.fillStyle = '#e8a13c';
      ctx.beginPath();
      ctx.ellipse(205, 318, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(186, 310);
      ctx.lineTo(190, 298);
      ctx.lineTo(196, 308);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(222, 310);
      ctx.lineTo(224, 298);
      ctx.lineTo(230, 308);
      ctx.closePath();
      ctx.fill();
    }
    // Rope coil on the dock (A only).
    if (!b) {
      ctx.strokeStyle = '#c9a86a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(82, 332, 14, 0, Math.PI * 2);
      ctx.arc(82, 332, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Bucket: blue in A, orange in B.
    ctx.fillStyle = b ? '#e8722a' : '#3f7fb5';
    ctx.beginPath();
    ctx.moveTo(416, 330);
    ctx.lineTo(440, 330);
    ctx.lineTo(436, 352);
    ctx.lineTo(420, 352);
    ctx.closePath();
    ctx.fill();
    dockPlanks(ctx, 330);
    barrel(ctx, 150, 360, '#a9803e');
  }

  /* ---------------- Round 3: Dusk Lighthouse (11 differences) ---------------- */
  function drawDuskLighthouse(ctx, b) {
    skyGradient(ctx, '#2c2a55', '#7a4a6b');
    // Stars: one at (105,48) only in A.
    ctx.fillStyle = '#ffe9a8';
    var stars = [[60, 40], [150, 90], [360, 44], [420, 100], [500, 150], [40, 140], [200, 40]];
    for (var s = 0; s < stars.length; s++) {
      ctx.beginPath();
      ctx.arc(stars[s][0], stars[s][1], 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!b) {
      ctx.beginPath();
      ctx.arc(105, 48, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Moon: full in A, crescent in B.
    ctx.fillStyle = '#f4ead0';
    ctx.beginPath();
    ctx.arc(452, 58, 22, 0, Math.PI * 2);
    ctx.fill();
    if (b) {
      ctx.fillStyle = '#2c2a55';
      ctx.beginPath();
      ctx.arc(462, 54, 19, 0, Math.PI * 2);
      ctx.fill();
    }
    seaGradient(ctx, '#274b63', '#12283a');
    waveLines(ctx, 'rgba(255,233,168,0.25)');
    // Lighthouse beam (A only).
    if (!b) {
      ctx.fillStyle = 'rgba(255,233,168,0.28)';
      ctx.beginPath();
      ctx.moveTo(280, 118);
      ctx.lineTo(120, 88);
      ctx.lineTo(120, 150);
      ctx.closePath();
      ctx.fill();
    }
    // Lighthouse tower: three red bands in A, two in B.
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.moveTo(262, 300);
    ctx.lineTo(268, 118);
    ctx.lineTo(292, 118);
    ctx.lineTo(298, 300);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(265, 168, 30, 22);
    ctx.fillRect(263, 232, 34, 22);
    if (!b) ctx.fillRect(264, 200, 32, 22);
    // Lamp room and flag.
    ctx.fillStyle = '#2c2a55';
    ctx.fillRect(264, 96, 32, 24);
    ctx.fillStyle = b ? '#f2ead8' : '#ffd766';
    ctx.fillRect(270, 102, 20, 12);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(280, 96);
    ctx.lineTo(280, 62);
    ctx.lineTo(280, 62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1c2f3d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 96);
    ctx.lineTo(280, 62);
    ctx.stroke();
    ctx.fillStyle = b ? '#f2ead8' : '#d94f3d';
    ctx.beginPath();
    ctx.moveTo(280, 62);
    ctx.lineTo(304, 69);
    ctx.lineTo(280, 77);
    ctx.closePath();
    ctx.fill();
    // Rocks at the base.
    ctx.fillStyle = '#3a4a55';
    ctx.beginPath();
    ctx.ellipse(280, 306, 90, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c3844';
    ctx.beginPath();
    ctx.ellipse(120, 372, 70, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(460, 380, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crab on the left rocks (A only).
    if (!b) {
      ctx.fillStyle = '#e8722a';
      ctx.beginPath();
      ctx.ellipse(78, 382, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e8722a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(70, 386);
      ctx.lineTo(64, 392);
      ctx.moveTo(86, 386);
      ctx.lineTo(92, 392);
      ctx.stroke();
    }
    // Cottage with a window: lit in A, dark in B.
    houseBlock(ctx, 160, 220, 70, 56, '#d9c39a', '#5a3b46');
    windowPane(ctx, 184, 236, !b);
    windowPane(ctx, 208, 236, false);
    // Rowboat (A only).
    if (!b) {
      ctx.fillStyle = '#7a4a2b';
      ctx.beginPath();
      ctx.moveTo(148, 300);
      ctx.lineTo(212, 300);
      ctx.lineTo(200, 314);
      ctx.lineTo(160, 314);
      ctx.closePath();
      ctx.fill();
    }
    // Buoy: red in A, yellow in B.
    ctx.fillStyle = b ? '#ffd766' : '#d94f3d';
    ctx.beginPath();
    ctx.arc(118, 352, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(114, 334, 8, 10);
    // Anchor on the right rocks (A only).
    if (!b) {
      ctx.strokeStyle = '#1c2f3d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(482, 332, 10, 0, Math.PI);
      ctx.moveTo(482, 322);
      ctx.lineTo(482, 348);
      ctx.moveTo(470, 330);
      ctx.lineTo(494, 330);
      ctx.stroke();
    }
    // Lighthouse reflection in the water (A only).
    if (!b) {
      ctx.fillStyle = 'rgba(255,233,168,0.35)';
      ctx.fillRect(272, 330, 16, 46);
      ctx.fillRect(276, 378, 8, 26);
    }
    // Reflection glow under the beam's end in B is absent; keep water calm.
    dockPlanks(ctx, 396);
    barrel(ctx, 520, 404, '#8a6b48');
  }

  var ROUNDS = [
    {
      id: 1,
      name: 'Harbor Dawn',
      tagline: 'Seven small changes hide between the two pictures. Find them all before the tide runs out.',
      timeLimit: 150,
      draw: drawHarborDawn,
      diffs: [
        { x: 92, y: 62, r: 26, note: 'sun rays' },
        { x: 296, y: 110, r: 22, note: 'mast flag colour' },
        { x: 214, y: 262, r: 30, note: 'sail colour' },
        { x: 435, y: 80, r: 24, note: 'chimney smoke' },
        { x: 482, y: 352, r: 20, note: 'extra barrel' },
        { x: 380, y: 178, r: 18, note: 'lit window' },
        { x: 205, y: 40, r: 18, note: 'missing bird' }
      ]
    },
    {
      id: 2,
      name: 'Midday Market',
      tagline: 'Nine changes crowd the market stalls. Look twice — the fish sign is not what it was.',
      timeLimit: 150,
      draw: drawMiddayMarket,
      diffs: [
        { x: 120, y: 159, r: 24, note: 'awning colour' },
        { x: 276, y: 177, r: 20, note: 'fish sign' },
        { x: 430, y: 132, r: 26, note: 'umbrella stripes' },
        { x: 205, y: 318, r: 20, note: 'sleeping cat' },
        { x: 498, y: 178, r: 18, note: 'lantern light' },
        { x: 82, y: 332, r: 20, note: 'rope coil' },
        { x: 360, y: 74, r: 18, note: 'missing gull' },
        { x: 428, y: 341, r: 18, note: 'bucket colour' },
        { x: 451, y: 253, r: 20, note: 'top crate' }
      ]
    },
    {
      id: 3,
      name: 'Dusk Lighthouse',
      tagline: 'Eleven changes in the dark. The beam is out, the moon is shy, and something is missing from the rocks.',
      timeLimit: 180,
      draw: drawDuskLighthouse,
      diffs: [
        { x: 180, y: 118, r: 30, note: 'lighthouse beam' },
        { x: 105, y: 48, r: 16, note: 'missing star' },
        { x: 452, y: 58, r: 22, note: 'moon phase' },
        { x: 192, y: 246, r: 16, note: 'cottage window' },
        { x: 118, y: 352, r: 20, note: 'buoy colour' },
        { x: 482, y: 335, r: 20, note: 'anchor' },
        { x: 280, y: 211, r: 26, note: 'lighthouse stripes' },
        { x: 180, y: 307, r: 26, note: 'rowboat' },
        { x: 292, y: 70, r: 18, note: 'lighthouse flag' },
        { x: 280, y: 352, r: 24, note: 'water reflection' },
        { x: 78, y: 382, r: 18, note: 'crab on the rocks' }
      ]
    }
  ];

  global.TwinTidesScenes = { width: W, height: H, rounds: ROUNDS };
})(window);
