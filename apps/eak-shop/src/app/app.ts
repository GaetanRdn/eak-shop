import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from '@eak-shop/shared-ui';

@Component({
  imports: [RouterModule, Button],
  selector: 'app-root',
  template: `<eak-button>Click me !</eak-button>`,
})
export class App {}
