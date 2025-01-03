pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "trix"
pin "@rails/actiontext", to: "actiontext.esm.js"
# pin "@rails/actioncable/src", to: "@rails--actioncable--src.js" # @7.2.201

pin "@fortawesome/fontawesome-free", to: "@fortawesome--fontawesome-free.js" # @6.7.2
pin "@fortawesome/fontawesome-free/js/solid.js", to: "@fortawesome--fontawesome-free--js--solid.js.js" # @6.7.2
pin "slim-select" # @2.10.0
pin "smart-timeout" # @2.7.1
