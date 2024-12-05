import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="details"
export default class extends Controller {
  static targets = [ "detail" ]
  connect() {
  }

  toggle(event) {
    this.detailTarget.classList.toggle('is-hidden')
  }
}
