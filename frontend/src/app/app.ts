import { Component } from '@angular/core';
import { RideList } from './ride-list/ride-list';

@Component({
  selector: 'app-root',
  imports: [RideList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
