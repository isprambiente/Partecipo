import { Controller } from "stimulus"

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

  closeModal(event) {
    [].forEach.call(document.getElementsByClassName('modal'), (item) => {item.classList.remove('is-active')})
  }
}
