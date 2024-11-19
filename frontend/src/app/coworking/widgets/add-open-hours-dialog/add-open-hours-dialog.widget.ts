import { Component } from '@angular/core';
import { OperatingHours } from '../../coworking.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'add-open-hours-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions
  ],
  templateUrl: './add-open-hours-dialog.widget.html',
  styleUrl: './add-open-hours-dialog.widget.css'
})
export class AddOpenHoursDialog {
  public addHoursForm = this.formBuilder.group({
    start: new FormControl(''),
    end: new FormControl('')
  });

  constructor(
    protected snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddOpenHoursDialog>,
    protected formBuilder: FormBuilder
  ) {}

  closeDialog(): void {
    const start = this.addHoursForm.get('start')?.value;
    const end = this.addHoursForm.get('end')?.value;

    const operatingHours: OperatingHours = {
      id: 0,
      start: start ? new Date(start) : new Date(),
      end: end ? new Date(end) : new Date()
    };
    this.dialogRef.close(operatingHours);
  }
}
