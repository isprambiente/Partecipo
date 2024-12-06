// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

import "trix"
import "@rails/actiontext"
import "./awesome.js"

if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}
