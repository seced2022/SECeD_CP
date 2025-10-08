(function(){
  // --- Tramo ---
  function sanitizeTramo(t){ return (t||'').toString().trim().toLowerCase().replace(/[^\w-]+/g,'-').substring(0,64) || 'tramo-default'; }
  function getTramoFromURL(){ const p=new URLSearchParams(location.search); return p.get('tramo'); }
  function ensureTramo(){
    let t=getTramoFromURL()||sessionStorage.getItem('seced_tramo');
    if(!t){ t=prompt('Indica el nombre del tramo (ej. tramo-1):','tramo-1'); }
    t=sanitizeTramo(t);
    sessionStorage.setItem('seced_tramo',t);
    return t;
  }
  const TRAMO=ensureTramo(); window.TRAMO_ID=TRAMO;

  // --- Firebase (si está configurado) ---
  const hasFirebase=typeof firebase!=='undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey;
  let db=null, docRef=null, applyingRemote=false;

  if(hasFirebase){
    try{
      if(firebase.apps?.length===0) firebase.initializeApp(window.FIREBASE_CONFIG);
      db=firebase.firestore();
      docRef=db.collection('tramos').doc(TRAMO);
    }catch(e){ console.warn('Firebase deshabilitado, usando localStorage:',e); }
  }

  const LOCAL_KEY='seced_tramo:'+TRAMO;

  // Guardar (el editor escribe; el visor no escribe)
  window.syncSave=(function(){ let t; return function(){
    clearTimeout(t);
    t=setTimeout(function(){
      try{
        if(window.VIEWER) return; // visor no escribe
        const data={ items:(typeof window._getItems==='function'?window._getItems():[]), updatedAt: Date.now() };
        if (window.WRITE_KEY) data.writeKey = window.WRITE_KEY;
        if(docRef && !applyingRemote){
          docRef.set(
            Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }),
            { merge:true }
          );
        }else{
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        }
      }catch(e){ console.error('syncSave error:', e); }
    },150);
  }; })();

  // Suscripción (recibir cambios)
  (function subscribeOrSeed(){
    const applyRemote = (arr)=>{
      if(typeof window._onRemoteUpdate==='function'){
        applyingRemote=true;
        try{ window._onRemoteUpdate(Array.isArray(arr)?arr:[]); } finally { applyingRemote=false; }
      }
    };
    if(docRef){
      docRef.onSnapshot(function(snap){
        if(!snap.exists) return;
        if(snap.metadata && snap.metadata.hasPendingWrites) return; // ignora eco local
        const data=snap.data()||{};
        applyRemote(data.items||[]);
      }, function(err){
        console.warn('Fallo suscripción Firestore, usando localStorage:', err);
        const local=localStorage.getItem(LOCAL_KEY);
        if(local){ try{ applyRemote((JSON.parse(local)||{}).items||[]); }catch{} }
      });
    }else{
      const local=localStorage.getItem(LOCAL_KEY);
      if(local){ try{ applyRemote((JSON.parse(local)||{}).items||[]); }catch{} }
    }
  })();
})();