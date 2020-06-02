// Visit The Stimulus Handbook for more details 
// https://stimulusjs.org/handbook/introduction
// 
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import Noty from 'noty'
import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    let options = {theme: 'sunset', progressBar: true, layout: 'topCenter'}
    options['type'] = this.data.get("type") || 'info'
    options['text'] = this.element.innerHTML
    options['timeout'] = this.data.get("timeout") || false
    new Noty(options).show()
  }
}
