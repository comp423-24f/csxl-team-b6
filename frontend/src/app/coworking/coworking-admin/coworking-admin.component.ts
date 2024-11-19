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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coworking-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  ) {
    this.fetchOperatingHours();
  }

  fetchOperatingHours(): void {
    this.coworkingService.listOperatingHours().subscribe({
      next: (hours) => {
        this.operatingHoursList.set(hours);
      },
      error: (error) => {
        console.error('Error fetching operating hours:', error);
        this.snackBar.open('Failed to load operating hours.', '', {
          duration: 2000
        });
      }
    });
  }

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
        this.fetchOperatingHours();
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

  deleteOperatingHourById(id: number): void {
    this.coworkingService.deleteOperatingHours(id).subscribe({
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
  }

  resetNewOperatingHours(): void {
    this.newOperatingHours = { start: '', end: '' };
  }

  /* Store existing hours in existingOperatingHours using service */
  ngOnInit(): void {
    this.coworkingService.listOperatingHours().subscribe((data) => {
      this.existingOperatingHours = data;
    });
  }
}
