import Timeout from 'smart-timeout'
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "sender" ]

  sendForm(event) {
   this.element.requestSubmit();
  }
  
  delayedSendForm(event) {
    if ( Timeout.exists('textDelay') ) { Timeout.clear('textDelay', true) }
    Timeout.set('textDelay', () => {this.sendForm(event);}, 750)
  }
}
