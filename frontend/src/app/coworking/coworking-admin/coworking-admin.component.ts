import { Component, computed, WritableSignal, signal } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { RoomReservationService } from '../room-reservation/room-reservation.service';
import { ReservationService } from '../reservation/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from 'src/app/profile/profile.service';
import { NagivationAdminGearService } from '../../navigation/navigation-admin-gear.service';
import { OperatingHours } from '../coworking.models';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-coworking-admin',
  templateUrl: './coworking-admin.component.html',
  styleUrl: './coworking-admin.component.css'
})
export class CoworkingAdminComponent {
  public static Route: Route = {
    path: 'admin',
    component: CoworkingAdminComponent,
    title: 'Coworking Hours Editor',
    canActivate: [permissionGuard('coworking.*', '*')]
  };
  public operatingHoursList: WritableSignal<OperatingHours[] | undefined> =
    signal(undefined);
  public newOperatingHours = {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  };

  public existingOperatingHours: OperatingHours[] = [];
  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    protected snackBar: MatSnackBar,
    private roomReservationService: RoomReservationService,
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {}
  createOperatingHours(): void {
    const startDate = new Date(this.newOperatingHours.startDate);
    const endDate = new Date(this.newOperatingHours.endDate);

    const [startHours, startMinutes] = this.newOperatingHours.startTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = this.newOperatingHours.endTime
      .split(':')
      .map(Number);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.snackBar.open('Please provide valid dates.', '', {
        duration: 2000
      });
      return;
    }

    if (startDate > endDate) {
      this.snackBar.open('Start time must be before end time.', '', {
        duration: 2000
      });
      return;
    }

    const operatingHoursArr = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const start = new Date(d);
      start.setHours(startHours, startMinutes);

      const end = new Date(d);
      end.setHours(endHours, endMinutes);

      if (start >= end) {
        this.snackBar.open('Start time must be before end time.', '', {
          duration: 2000
        });
        return;
      }

      operatingHoursArr.push({
        id: 0,
        start: start,
        end: end
      });
    }

    operatingHoursArr.forEach((operatingHours) => {
      this.coworkingService.createOperatingHours(operatingHours).subscribe({
        next: () => {
          this.snackBar.open('Operating hours added successfully.', '', {
            duration: 2000
          });
          this.resetNewOperatingHours();
        },
        error: (error) => {
          console.error('Error adding operating hours:', error);
          this.snackBar.open('Failed to add operating hours.', '', {
            duration: 2000
          });
        }
      });
    });
  }

  resetNewOperatingHours(): void {
    this.newOperatingHours = {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    };
  }

  ngOnInit(): void {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7 * 8);
    this.coworkingService.listOperatingHours(start, end).subscribe((data) => {
      this.existingOperatingHours = data;
    });
  }
}
