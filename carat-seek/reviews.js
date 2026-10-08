(function () {
 'use strict';
 const endpoint='https://carat-bridge.jummai-mugen.workers.dev/v1/reviews';
 const liffId='2011820244-hTjEpICO';
 const chatUrl='https://line.me/R/oaMessage/%40881rdcdg';
 const reviewUrl=code=>'https://liff.line.me/'+liffId+'/review/?product='+encodeURIComponent(code);
 const stats=new Map();let ready=false,failed=false,identityPromise;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function api(path,options={}) {
  const response=await fetch(endpoint+path,{...options,signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(response.status===401?'認証を更新してください。':response.status===429?'少し間をあけて、もう一度保存してください。':'読み込み・保存ができませんでした。もう一度お試しください。');
  return response.json();
 }
 function badge(code) {
  if(!ready)return '<span class="review-metric">'+(failed?'評価を取得できません':'評価を読み込み中')+'</span>';
  const value=stats.get(code);
  if(!value?.count)return '<span class="review-metric">☆☆☆☆☆ <small>評価なし</small></span>';
  const average=Number(value.average);
  return `<span class="review-metric"><span class="review-stars" aria-hidden="true">☆☆☆☆☆<span style="width:${average/5*100}%">★★★★★</span></span> <b>${average.toFixed(1)}</b><small>（${value.count}件）</small></span>`;
 }
 function updateBadges() {
  document.querySelectorAll('[data-review-code]').forEach(el=>{const html=badge(el.dataset.reviewCode);if(el.innerHTML!==html)el.innerHTML=html});
 }
 async function loadSummary() {
  const data=await api('/summary');
  if(!Array.isArray(data.products))throw new Error('評価を取得できませんでした。');
  for(const row of data.products){if(!Number.isInteger(row.count)||row.count<1||!Number.isFinite(row.average)||row.average<1||row.average>5)throw new Error('評価を取得できませんでした。')}
  stats.clear();data.products.forEach(row=>stats.set(row.productCode,row));ready=true;updateBadges();
 }
 async function identity() {
  if(!identityPromise)identityPromise=(async()=>{
   if(!window.liff)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://static.line-scdn.net/liff/edge/2/sdk.js';script.onload=resolve;script.onerror=reject;document.head.append(script)});
   await window.liff.init({liffId});return window.liff;
  })().catch(error=>{identityPromise=null;throw error});
  return identityPromise;
 }
 function attachPanel(container,code,insideLine=false) {
  if(!insideLine){
   const panel=document.createElement('section');panel.className='review-panel';
   panel.innerHTML=`<h3>口コミ・感想</h3><div data-review-code="${escape(code)}">${badge(code)}</div><div class="review-actions"><a class="review-line" href="${reviewUrl(code)}">LINEで口コミ・感想を書く</a><a href="${chatUrl}/?${encodeURIComponent('商品コード '+code+' についての問い合わせ\n')}">このお酒についてLINEで問い合わせる</a></div>`;
   container.append(panel);return;
  }
  const panel=document.createElement('section');panel.className='review-panel';
  panel.innerHTML=`<h3>みんなの評価・感想</h3><div data-review-code="${escape(code)}">${badge(code)}</div><div class="public-comments" aria-live="polite">感想を読み込み中</div><form><fieldset><legend>このお酒の評価</legend><div class="rating-input" role="radiogroup" aria-label="5段階評価">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}" required><span aria-hidden="true">☆</span><span class="sr-only">${n}点</span></label>`).join('')}</div></fieldset><label class="comment-label">感想コメント（任意）<textarea name="comment" rows="3" maxlength="500" placeholder="味や、合わせた料理の感想をどうぞ"></textarea></label><p class="review-policy">評価は公開されます。コメントは確認後に掲載します。個人情報は書かないでください。</p><button type="button" class="review-login">LINEでログイン</button><button type="submit">評価を保存</button><p class="review-status" role="status"></p></form>`;
  container.append(panel);
  const form=panel.querySelector('form'),status=panel.querySelector('.review-status'),comments=panel.querySelector('.public-comments');let inputVersion=0,restoreVersion=0;
  form.addEventListener('input',()=>inputVersion++);
  const paintStars=()=>{const score=Number(new FormData(form).get('rating'));panel.querySelectorAll('.rating-input label').forEach((el,i)=>el.querySelector('[aria-hidden]').textContent=i<score?'★':'☆')};
  form.addEventListener('change',paintStars);
  async function restore() {
   const startedInput=inputVersion,startedRestore=++restoreVersion;
   const sdk=await identity();
   if(!sdk.isInClient())throw new Error('LINEアプリ内で開いてください。');
   if(!sdk.isLoggedIn()){sdk.login({redirectUri:location.href});return}
   const token=sdk.getIDToken();if(!token)throw new Error('LINEの認証を更新してください。');
   const data=await api('/'+encodeURIComponent(code)+'/mine',{headers:{authorization:'Bearer '+token}});
   if(!panel.isConnected||startedRestore!==restoreVersion)return;
   if(inputVersion!==startedInput){status.textContent='入力中の内容を保持しました。';return}
   if(data.review){form.elements.rating.value=String(data.review.rating);form.elements.comment.value=data.review.comment;paintStars();status.textContent='保存済みの評価を読み込みました。'}else status.textContent='LINEでログインしました。評価を選んで保存してください。';
   panel.querySelector('.review-login').textContent='自分の評価を読み込む';
  }
  panel.querySelector('.review-login').onclick=()=>restore().catch(()=>{if(panel.isConnected)status.textContent='LINEに接続できませんでした。もう一度お試しください。'});
  form.onsubmit=async event=>{
   event.preventDefault();const submit=form.querySelector('[type=submit]'),startedInput=inputVersion,value={rating:Number(new FormData(form).get('rating')),comment:form.elements.comment.value};restoreVersion++;submit.disabled=true;status.textContent='保存しています…';
   try {
    const sdk=await identity();if(!sdk.isInClient())throw new Error('LINEアプリ内で開いてください。');if(!sdk.isLoggedIn()){status.textContent='先に「LINEでログイン」を押してください。';return}
    const token=sdk.getIDToken();if(!token)throw new Error('LINEの認証を更新してください。');
    const result=await api('/'+encodeURIComponent(code),{method:'PUT',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(value)});
    if(result.status!=='saved'||result.review?.rating!==value.rating||result.review?.comment!==value.comment.trim())throw new Error('保存結果を確認できませんでした。');
    const readback=await api('/'+encodeURIComponent(code)+'/mine',{headers:{authorization:'Bearer '+token}});
    if(readback.review?.rating!==value.rating||readback.review?.comment!==value.comment.trim())throw new Error('保存した内容の再確認ができませんでした。「自分の評価を読み込む」で確認してください。');
    if(panel.isConnected)status.textContent=inputVersion!==startedInput?'送信した評価を保存しました。変更中の入力はまだ保存されていません。':(value.comment.trim()?'評価を保存しました。コメントは確認後に掲載します。':'評価を保存しました。');
    try{await loadSummary()}catch(_){if(panel.isConnected)status.textContent+=' 最新の集計は再読み込みで確認してください。'}
   }catch(error){if(panel.isConnected)status.textContent=error.message||'保存できませんでした。'}finally{if(panel.isConnected)submit.disabled=false}
  };
  api('/'+encodeURIComponent(code)).then(data=>{
   if(!panel.isConnected)return;
   comments.replaceChildren();
   if(!data.comments.length){comments.textContent='まだ感想はありません。';return}
   data.comments.forEach(item=>{const block=document.createElement('blockquote');block.textContent=item.comment;comments.append(block)});
  }).catch(()=>{if(panel.isConnected)comments.textContent='感想を取得できませんでした。'});
  restore().catch(()=>{if(panel.isConnected)status.textContent='LINEに接続できませんでした。もう一度お試しください。'});
 }
 function decorateCards() {
  document.querySelectorAll('.sake,.sake-card').forEach(card=>{
   if(card.querySelector('[data-review-code]'))return;
   const code=card.dataset.code||card.querySelector('[data-detail]')?.dataset.detail;
   const heading=card.querySelector('h3,h4');if(!code||!heading)return;
   const metric=document.createElement('div');metric.dataset.reviewCode=code;metric.innerHTML=badge(code);heading.after(metric);
  });
 }
 const style=document.createElement('style');style.textContent=`.review-panel{border-top:1px solid #ccd4cd;margin-top:28px;padding-top:20px}.review-metric{display:inline-flex;gap:6px;align-items:center;color:#80622d;font-size:17px;margin:6px 0}.review-metric small{color:#59696c;font-size:14px}.review-stars{position:relative;display:inline-block;white-space:nowrap;font-size:21px;line-height:1.5}.review-stars>span{position:absolute;left:0;top:0;overflow:hidden;color:#a67214}.review-panel fieldset{border:0;margin:16px 0;padding:0}.rating-input{display:flex;gap:8px}.rating-input label{display:grid;place-items:center;position:relative;min-width:44px;min-height:48px;border:1px solid #bdc9bc;border-radius:8px;cursor:pointer;color:#956315;font-size:30px}.rating-input input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}.rating-input label:focus-within{outline:3px solid #b77f26}.comment-label{display:grid;gap:8px}.review-panel textarea{font:inherit;width:100%;max-width:100%;border:1px solid #bdc9bc;border-radius:8px;padding:12px;resize:vertical}.review-policy{font-size:14px!important;color:#59696c}.review-panel form>button{margin:8px 8px 0 0;max-width:100%;white-space:normal}.review-status{font-size:15px!important}.public-comments blockquote{margin:12px 0;padding:12px;border-left:3px solid #b08b4e;white-space:pre-wrap;overflow-wrap:anywhere}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}`;document.head.append(style);
 const linksStyle=document.createElement('style');linksStyle.textContent='.review-actions{display:grid;gap:12px;margin-top:16px}.review-actions a{display:flex;align-items:center;justify-content:center;min-height:48px;padding:12px 16px;border:1px solid #b9c9bf;border-radius:10px;text-decoration:none;text-align:center;font-size:16px;line-height:1.6;overflow-wrap:anywhere}.review-actions .review-line{background:#087b44;color:white;border-color:#087b44}';document.head.append(linksStyle);
 window.CaratReviews={badge,attachPanel,identity,reviewUrl,chatUrl,compare:(a,b)=>(stats.get(b.product_code)?.count||0)-(stats.get(a.product_code)?.count||0)||(stats.get(b.product_code)?.average||0)-(stats.get(a.product_code)?.average||0)};
 // The LIFF primary redirect must finish before reading/rewriting liff.state.
 if(new URLSearchParams(location.search).has('liff.state')&&!document.getElementById('line-review-root'))identity().catch(()=>{
  const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent='LINE画面を開けませんでした。LINEからもう一度開いてください。';document.body.prepend(notice);
 });
 decorateCards();new MutationObserver(decorateCards).observe(document.body,{subtree:true,childList:true});
 loadSummary().then(()=>{
  const option=document.querySelector('#sort option[value=popular]');if(option)option.disabled=false;
  if(typeof render==='function'&&document.getElementById('sort')?.value==='popular')render(false);
 }).catch(()=>{
  failed=true;
  document.querySelectorAll('[data-review-code]').forEach(el=>el.textContent='評価を取得できません');
  const selector=document.getElementById('sort');if(selector?.value==='popular'){selector.value='source';render(false)}
 });
})();
