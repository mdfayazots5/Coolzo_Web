import { Component } from '@angular/core';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: '<section><h2>Forbidden</h2><p>Your current role does not have access to this route.</p></section>'
})
export class ForbiddenComponent {}
