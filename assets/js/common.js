/* 계산기 허브 — 공통 유틸리티 */
(function () {
  "use strict";

  var DAY = 86400000;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* 숫자 파싱: 콤마·공백·원·% 제거 */
  function num(v) {
    if (typeof v === "number") return isFinite(v) ? v : 0;
    var s = String(v == null ? "" : v).replace(/[^0-9.\-]/g, "");
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  /* 1,234,567 형태 (Intl 지원 여부와 무관하게 동작) */
  function comma(v) {
    var n = Number(v);
    if (!isFinite(n)) n = 0;
    n = Math.round(n);
    var neg = n < 0;
    var s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + s;
  }

  /* 1,234,567원 */
  function won(v) { return comma(v) + "원"; }

  /* 12.3% */
  function pct(v, digits) {
    var n = Number(v);
    if (!isFinite(n)) n = 0;
    return n.toFixed(digits == null ? 1 : digits) + "%";
  }

  /* Date → YYYY-MM-DD */
  function ymd(d) {
    if (!(d instanceof Date) || isNaN(d)) return "";
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  /* YYYY-MM-DD → Date(로컬 자정) */
  function parseYmd(s) {
    if (!s) return null;
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  function today() {
    var t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  /* 일수 차이 (b - a), 자정 기준 */
  function diffDays(a, b) {
    var x = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    var y = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((y - x) / DAY);
  }

  function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  /* 개월 더하기 (말일 보정) */
  function addMonths(d, n) {
    var y = d.getFullYear();
    var m = d.getMonth() + n;
    var day = d.getDate();
    var last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(day, last));
  }

  /* 한국식 날짜 표기: 2026년 11월 19일 (목) */
  function kdate(d) {
    if (!(d instanceof Date) || isNaN(d)) return "-";
    var w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + w + ")";
  }

  function toast(msg) {
    var el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2000);
  }

  /* 클립보드 복사 (구형 브라우저 폴백 포함) */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return fallbackCopy(text); }
      );
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* 현재 입력값을 쿼리로 담은 공유 링크 */
  function buildShareUrl(form) {
    var url = new URL(window.location.href.split("#")[0]);
    url.search = "";
    if (form) {
      $$("input[name], select[name]", form).forEach(function (el) {
        if (el.type === "checkbox" || el.type === "radio") {
          if (el.checked) url.searchParams.set(el.name, el.value);
        } else if (el.value !== "" && el.value != null) {
          url.searchParams.set(el.name, el.value);
        }
      });
    }
    return url.toString();
  }

  /* 공유 링크의 값으로 폼 채우기 */
  function applyParams(form) {
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    $$("[name]", form).forEach(function (el) {
      if (!params.has(el.name)) return;
      var v = params.get(el.name);
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = String(el.value) === v;
      } else {
        el.value = v;
      }
    });
  }

  function share(opts) {
    var data = { title: opts.title || document.title, text: opts.text || "", url: opts.url || window.location.href };
    if (navigator.share) {
      return navigator.share(data).catch(function () { return null; });
    }
    return copy(data.url).then(function (ok) {
      toast(ok ? "링크를 복사했어요" : "링크 복사에 실패했어요");
    });
  }

  /* 폼 입력 → 즉시 계산 */
  function live(form, fn) {
    if (!form) return;
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        if (e.target && e.target.matches("input, select")) fn();
      });
    });
    applyParams(form);
    fn();
  }

  /* 결과 영역 텍스트 추출 */
  function resultText(id) {
    var el = document.getElementById(id || "resultText");
    return el ? el.innerText.replace(/\n{3,}/g, "\n\n").trim() : "";
  }

  /* 세그먼트 컨트롤 */
  function segment(root, onChange) {
    if (!root) return;
    var buttons = $$("button", root);
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        buttons.forEach(function (x) {
          x.classList.toggle("is-on", x === b);
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        if (onChange) onChange(b.dataset.value);
      });
    });
    return function () {
      var on = buttons.filter(function (b) { return b.classList.contains("is-on"); })[0];
      return on ? on.dataset.value : null;
    };
  }

  window.CalcHub = {
    $: $, $$: $$, num: num, comma: comma, won: won, pct: pct,
    ymd: ymd, parseYmd: parseYmd, today: today, diffDays: diffDays,
    addDays: addDays, addMonths: addMonths, kdate: kdate,
    toast: toast, copy: copy, buildShareUrl: buildShareUrl, applyParams: applyParams,
    share: share, live: live, resultText: resultText, segment: segment
  };
})();
