import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { EngagementList } from './engagements/engagement-list';

@Component({
  selector: 'app-root',
  imports: [EngagementList, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
