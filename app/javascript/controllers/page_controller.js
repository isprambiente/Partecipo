import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "container", "menu", "modal"]

  goPage(event) {
    let [data, status, xhr] = event.detail
    this.containerTarget.innerHTML = xhr.response
  }

  toggleMenu(event) {
    this.menuTarget.classList.toggle('is-active')
    //document.getElementById(event.target.dataset.id).classList.toggle('is-active')
  }

  toggleHidden(event) {
    event.preventDefault()
    console.log(this)
    console.log(event)
  }

  closeModal(event) {
    [].forEach.call(document.getElementsByClassName('modal'), (item) => {item.classList.remove('is-active')})
    if ( document.getElementById("yield") == null) { window.location.replace("/") }
  }
}
