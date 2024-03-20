import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="nested"
export default class extends Controller {
  static targets = ["row"] // 1

  connect() {
  }

  deleteRow() { // 2
    event.preventDefault(); // 3

    let index = event.currentTarget.getAttribute("data-index"); // 4, 5
    this.bookRowTargets[index].classList.toggle("hidden"); // 6, 7
  }
}
