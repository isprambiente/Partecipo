import Rails from "@rails/ujs";
import PageController from './page_controller.js'
import Timeout from 'smart-timeout'

export default class extends PageController {

  connect() {
    if (this.data.has("url")) {
      this.getPage(this.data.get('url'))
    }
  }

  getPage(url) {
    Rails.ajax({
      type: "GET",
      url: url,
      success: (data, status, xhr) => {
          this.containerTarget.innerHTML = xhr.response
        }
    })
  }

  sendForm(event) {
    Rails.fire(event.target.closest('form'), 'submit')
  }

  delayedSendForm(event) {
    if ( Timeout.exists('textDelay') ) { Timeout.clear('textDelay', true) }
    Timeout.set('textDelay', () => {this.sendForm(event);}, 750)
  }
}
