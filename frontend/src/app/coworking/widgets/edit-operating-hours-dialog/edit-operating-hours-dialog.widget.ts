import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OperatingHours } from 'src/app/coworking/coworking.models';

@Component({
  selector: 'edit-operating-hours-dialog',
  templateUrl: './edit-operating-hours-dialog.widget.html',
  styleUrls: ['./edit-operating-hours-dialog.widget.css']
})
export class EditOperatingHoursDialog {
  protected operatingHoursInput = {
    date: new Date(),
    startTime: '',
    endTime: ''
  };
  constructor(
    protected dialogRef: MatDialogRef<EditOperatingHoursDialog>,
    @Inject(MAT_DIALOG_DATA) protected data: OperatingHours,
    protected snackBar: MatSnackBar
  ) {
    this.parseDates(data.start, data.end);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const start = new Date(this.operatingHoursInput.date);
    const end = new Date(this.operatingHoursInput.date);
    const [startHour, startMinute] = this.operatingHoursInput.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = this.operatingHoursInput.endTime
      .split(':')
      .map(Number);
    start.setHours(startHour, startMinute);
    end.setHours(endHour, endMinute);

    const editedOperatingHours: OperatingHours = {
      id: this.data.id,
      start: start,
      end: end
    };

    this.dialogRef.close(editedOperatingHours);
  }

  parseDates(start: Date, end: Date): void {
    if (start.toDateString() !== end.toDateString()) {
      this.onCancel();
      this.snackBar.open(
        'Single time entry should not span multiple days',
        '',
        {
          duration: 3000
        }
      );
      return;
    }

    this.operatingHoursInput.date = start;
    this.operatingHoursInput.startTime = start.toTimeString().slice(0, 5);
    this.operatingHoursInput.endTime = end.toTimeString().slice(0, 5);
  }
}
