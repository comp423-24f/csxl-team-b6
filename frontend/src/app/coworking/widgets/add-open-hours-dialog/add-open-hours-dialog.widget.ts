import { Component, EventEmitter, Output } from '@angular/core';
import { OperatingHours } from '../../coworking.models';

@Component({
  selector: 'add-open-hours-dialog',
  standalone: true,
  templateUrl: './add-open-hours-dialog.widget.html',
  styleUrl: './add-open-hours-dialog.widget.css'
})
export class AddOpenHoursDialogComponent {
  @Output() openHoursAdded = new EventEmitter<OperatingHours>();

  constructor() {}
}
