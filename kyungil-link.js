/* 탐구 도움서(seteuk-guide) ↔ 경일 진로·탐구 성장 시스템 연결 v1.0
 * 공통 메뉴, 공통 기준(질문 수준 4단계·질문 유형별 방법)을 본문에 그리고,
 * 15번 워크시트의 일곱 칸을 공통 탐구노트로 보냅니다. 스크립트가 막혀도 본문은 그대로 읽힙니다.
 */
(function () {
  'use strict';
  var K = window.KIS, N = window.KNotes;
  if (!K || !N) return;
  var esc = K.esc, S = K.SITES;
  K.mountNav('help', document.querySelector('header.topbar'));

  var css = document.createElement('style');
  css.textContent =
    '.kis-block{margin:26px 0 0;display:flex;flex-direction:column;gap:12px}' +
    '.kis-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}' +
    '.kis-levels div{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:4px}' +
    '.kis-levels b{color:var(--green)}.kis-levels .ex{font-size:14px;color:var(--muted)}.kis-levels .up{font-size:14px}' +
    '.kis-block .kis-note{background:var(--mint);border-left:4px solid var(--green);padding:12px 16px}' +
    '.kis-msg{font-size:14px}.kis-hubintro{max-width:1250px;margin:16px auto 0;padding:14px 40px;background:var(--mint);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.kis-hubintro p{margin:2px 0}.kis-hubintro a{font-weight:800}@media(max-width:700px){.kis-hubintro{padding:12px 20px}}';
  document.head.appendChild(css);

  if (!document.getElementById('kisHubIntro')) {
    var intro = document.createElement('section'); intro.id = 'kisHubIntro'; intro.className = 'kis-hubintro screen-only';
    intro.innerHTML = '<b>🛟 이곳은 탐구하다 막혔을 때 찾아보는 도움서예요.</b><p>처음 시작하거나 무엇을 해야 할지 모르겠다면 <a href="' + S.hub + 'index.html">통합 허브에서 시작하기 →</a></p>';
    var hero = document.querySelector('.hero'); if (hero) hero.parentNode.insertBefore(intro, hero);
  }

  var lv = document.querySelector('[data-kis="levels"]');
  if (lv) lv.innerHTML = '<div class="kis-block"><h3>내 질문은 몇 단계일까요?</h3>' +
    '<div class="kis-levels">' + K.LEVELS.map(function (L) {
      return '<div><b>' + L.n + '단계 · ' + esc(L.name) + '</b><span>' + esc(L.ask) + '</span><span class="ex">예: ' + esc(L.example) + '</span><span class="up">한 단계 깊게 → ' + esc(L.up) + '</span></div>';
    }).join('') + '</div><p class="kis-note">' + esc(K.LEVEL_NOTE) + ' 내 질문의 단계는 <a href="' + S.hub + 'notes.html">내 탐구노트</a>에서 스스로 골라 기록해요.</p></div>';

  var mm = document.querySelector('[data-kis="methodmatch"]');
  if (mm) mm.innerHTML = '<div class="kis-block"><h3>질문에 맞는 방법 고르기</h3>' +
    '<div class="table-wrap"><table><caption>내가 알고 싶은 것에 따라 먼저 생각할 방법 (정답 방법이 아니라 추천 방법)</caption><thead><tr><th>내가 알고 싶은 것</th><th>먼저 생각할 방법</th><th>주의</th></tr></thead><tbody>' +
    K.QUESTION_TYPES.map(function (q) {
      return '<tr><td>' + esc(q.ask) + '</td><td>' + q.methods.map(function (m) { return esc(K.METHODS[m].name); }).join(', ') + '</td><td>' + esc(q.care) + '</td></tr>';
    }).join('') + '</tbody></table></div><p class="kis-note">' + esc(K.FIELD_NOTE) + '</p></div>';

  /* 15번 워크시트 → 내 탐구노트 */
  var send = document.getElementById('kisSendNotes');
  if (send && document.getElementById('note0')) {
    send.hidden = false;
    var pickWrap = document.createElement('p'); pickWrap.className = 'kis-msg';
    var notes = N.list(), requested = new URLSearchParams(location.search).get('note') || '', act = requested && N.get(requested) ? requested : '';
    pickWrap.innerHTML = '<label for="kisTarget">보낼 곳 </label><select id="kisTarget" style="min-height:44px;max-width:100%">' +
      notes.map(function (n) { return '<option value="' + esc(n.id) + '"' + (n.id === act ? ' selected' : '') + '>' + esc(N.title(n)) + '</option>'; }).join('') +
      '<option value=""' + (act ? '' : ' selected') + '>＋ 새 탐구노트</option></select>';
    send.parentNode.after(pickWrap);
    var msg = document.createElement('p'); msg.className = 'kis-msg'; msg.setAttribute('role', 'status');
    pickWrap.after(msg);
    send.addEventListener('click', function () {
      function v(i) { var el = document.getElementById('note' + i); return el ? el.value.trim() : ''; }
      if (![0, 1, 2, 3, 4, 5, 6].some(function (i) { return v(i); })) { msg.textContent = '아직 적은 내용이 없어요. 일곱 칸 중 하나 이상을 적은 뒤 보내 주세요.'; return; }
      var patch = {
        start: { from: v(0) ? 'class' : '', text: v(0) }, question: v(1), role: v(2),
        evidence: v(3) ? [{ title: v(3) }] : [], problem: v(4), revision: v(5), next: v(6),
        links: { guide: true }
      };
      var id = document.getElementById('kisTarget').value;
      var n = id && N.get(id) ? N.merge(id, patch) : N.create(patch, 'guide');
      N.setActive(n.id);
      msg.innerHTML = '내 탐구노트에 보냈어요. 빈칸은 노트 내용을 지우지 않아요. <a href="' + S.hub + 'notes.html#' + encodeURIComponent(n.id) + '">「' + esc(N.title(n)) + '」 열기 →</a>';
    });
  }
})();
