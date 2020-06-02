document.addEventListener('ajax:beforeSend', function(event) { 
  event.target.classList.add('is-loading')
  document.getElementById('loader').classList.remove('is-hidden')
  })
document.addEventListener('ajax:success', function(event) { 
  event.target.classList.remove('is-loading')
  document.getElementById('loader').classList.add('is-hidden')
  })
document.addEventListener('ajax:error', function(event) {
   var detail = event.detail;
   var data = detail[0];
   var status = detail[1];
   var xhr = detail[2];
   console.log(event)
   if (status == "Unauthorized") {
     document.getElementById('timeout').classList.add('is-active')
     event.target.classList.remove('is-loading')
     document.getElementById('loader').classList.add('is-hidden')
   } else {
     document.getElementById('error').classList.add('is-active')
     event.target.classList.remove('is-loading')
     document.getElementById('loader').classList.add('is-hidden')
   }
 })
