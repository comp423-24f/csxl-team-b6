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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coworking-admin',
  standalone: true,
  imports: [FormsModule],
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
  public newOperatingHours: { start: string; end: string } = {
    start: '',
    end: ''
  };
  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  createOperatingHours(): void {
    const start = new Date(this.newOperatingHours.start);
    const end = new Date(this.newOperatingHours.end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.snackBar.open('Please provide valid dates.', '', {
        duration: 2000
      });
      return;
    }

    if (start >= end) {
      this.snackBar.open('Start time must be before end time.', '', {
        duration: 2000
      });
      return;
    }

    const operatingHours: OperatingHours = {
      id: 0,
      start,
      end
    };

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
  }

  /** Reset the new operating hours form */
  resetNewOperatingHours(): void {
    this.newOperatingHours = { start: '', end: '' };
  }
}
