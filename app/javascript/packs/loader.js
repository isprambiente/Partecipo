const loading = (event) => { event.target.classList.add('is-loading'); document.getElementById('loader').classList.remove('is-hidden')};
const loaded = (event) => {  event.target.classList.remove('is-loading'); document.getElementById('loader').classList.add('is-hidden') };
const activate = (target) => { document.getElementById(target).classList.add('is-active') };

document.addEventListener('ajax:beforeSend', function(event) { loading(event) })
document.addEventListener('ajax:success', function(event) { loaded(event) })
document.addEventListener('ajax:error', function(event) {
   console.log(event);
   if (event.detail[1] == "Unauthorized") {
     loaded(event);
     activate('timeout');
   } else {
     loaded(event);
     activate('error') ;
   }
 })


