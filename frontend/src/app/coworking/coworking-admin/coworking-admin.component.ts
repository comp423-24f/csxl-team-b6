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
import { AddOpenHoursDialog } from '../widgets/add-open-hours-dialog/add-open-hours-dialog.widget';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-coworking-admin',
  standalone: true,
  imports: [FormsModule, MatIcon],
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

  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  openAddHoursDialog(): void {
    const dialogRef = this.dialog.open(AddOpenHoursDialog);
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.createOperatingHours(res);
      }
    });
  }

  createOperatingHours(oh: OperatingHours): void {
    if (isNaN(oh.start.getTime()) || isNaN(oh.end.getTime())) {
      this.snackBar.open('Please provide valid dates.', '', {
        duration: 2000
      });
      return;
    }

    if (oh.start >= oh.end) {
      this.snackBar.open('Start time must be before end time.', '', {
        duration: 2000
      });
      return;
    }

    this.coworkingService.createOperatingHours(oh).subscribe({
      next: () => {
        this.snackBar.open('Operating hours added successfully.', '', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Error adding operating hours:', error);
        this.snackBar.open('Failed to add operating hours.', '', {
          duration: 2000
        });
      }
    });
  }
}
