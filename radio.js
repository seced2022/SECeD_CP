(function(){
  // Mostrar y persistir el radio actual. No modifica Firestore ni el grid.
  function getParam(name){ return new URLSearchParams(location.search).get(name); }
  let radioId = Number(localStorage.getItem('seced_radio_id') || getParam('radio') || '1') | 0;
  if (radioId <= 0) radioId = 1;

  const radioNow = document.getElementById('radioNow');
  const radioBadge = document.getElementById('radioBadge');

  function updateLabel(){
    const txt = `RADIO: ${radioId}`;
    if (radioNow) radioNow.textContent = `Actual: ${radioId}`;
    if (radioBadge) radioBadge.textContent = txt;
  }

  function setRadio(n){
    if (!Number.isFinite(n) || n < 1) return;
    radioId = n|0;
    try { localStorage.setItem('seced_radio_id', String(radioId)); } catch {}
    updateLabel();
  }

  // Botones 1..4
  Array.from(document.querySelectorAll('[data-radio]')).forEach(btn => {
    btn.addEventListener('click', () => setRadio(Number(btn.getAttribute('data-radio'))||1));
  });

  // Botón 'Usar' con input
  const btnSetRadio = document.getElementById('btnSetRadio');
  const radioCustom = document.getElementById('radioCustom');
  if (btnSetRadio && radioCustom){
    btnSetRadio.addEventListener('click', () => {
      const n = Number(radioCustom.value)||0;
      if (n >= 1) setRadio(n);
      else alert('Introduce un número de radio válido (>=1).');
    });
  }

  // Inicial
  updateLabel();
})();