import { mount } from 'cypress/vue'
import '../../app/assets/scss/main.scss'

declare global {
  namespace Cypress {
    interface Chainable {
      /** Mount a Vue component (Cypress Component Testing). */
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
