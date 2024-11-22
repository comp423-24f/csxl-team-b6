import { Component, WritableSignal, signal } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { RoomReservationService } from '../room-reservation/room-reservation.service';
import { ReservationService } from '../reservation/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from 'src/app/profile/profile.service';
import { OperatingHours } from '../coworking.models';
import { firstValueFrom, Subscription } from 'rxjs';

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
    startTime: '10:00',
    endTime: '20:00'
  };

  public existingOperatingHours: OperatingHours[] = [];
  private subscriptions: Subscription[] = [];

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

    const [startHour, startMinute] = this.newOperatingHours.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = this.newOperatingHours.endTime
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

    const operatingHoursPromises = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const start = new Date(d);
      start.setHours(startHour, startMinute);

      const end = new Date(d);
      end.setHours(endHour, endMinute);

      if (start >= end) {
        this.snackBar.open('Start time must be before end time.', '', {
          duration: 2000
        });
        return;
      }

      operatingHoursPromises.push(
        firstValueFrom(
          this.coworkingService.createOperatingHours({
            id: 0,
            start: start,
            end: end
          })
        )
      );
    }

    Promise.all(operatingHoursPromises).then(() => {
      this.snackBar.open('Operating hours added successfully.', '', {
        duration: 2000
      });
      this.resetNewOperatingHours();
      this.fetchOperatingHours();
    });

    this.fetchOperatingHours();
  }

  deleteOperatingHourById(id: number): void {
    const deleteSub = this.coworkingService.deleteOperatingHours(id).subscribe({
      next: () => {
        this.snackBar.open('Operating hour slot deleted successfully.', '', {
          duration: 2000
        });
        this.fetchOperatingHours();
      },
      error: (error) => {
        console.error('Error deleting operating hour:', error);
        this.snackBar.open('Failed to delete operating hour.', '', {
          duration: 2000
        });
      }
    });
    this.subscriptions.push(deleteSub);
  }

  resetNewOperatingHours(): void {
    this.newOperatingHours = {
      startDate: '',
      endDate: '',
      startTime: '10:00',
      endTime: '20:00'
    };
  }

  fetchOperatingHours(): void {
    const fetchSub = this.coworkingService
      .listOperatingHours(
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 7 * 8))
      )
      .subscribe((data) => {
        this.existingOperatingHours = data;
      });

    this.subscriptions.push(fetchSub);
  }

  ngOnInit(): void {
    this.fetchOperatingHours();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
