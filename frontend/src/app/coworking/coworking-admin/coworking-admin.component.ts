import { Component, computed } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { RoomReservationService } from '../room-reservation/room-reservation.service';
import { ReservationService } from '../reservation/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'app-coworking-admin',
  standalone: true,
  imports: [],
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
}
