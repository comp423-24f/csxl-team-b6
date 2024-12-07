import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OperatingHours } from '../coworking.models';
import { forkJoin, Observable, of } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EditOperatingHoursDialog } from '../widgets/edit-operating-hours-dialog/edit-operating-hours-dialog.widget';
import { WritableSignal, signal, computed } from '@angular/core';
import { WelcomeService } from 'src/app/welcome/welcome.service';

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
  protected newOperatingHours = {
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '20:00'
  };
  protected displayedColumns: string[] = [
    'select',
    'date',
    'startTime',
    'endTime'
  ];

  protected dataSource = new MatTableDataSource<OperatingHours>([]);
  protected selection: SelectionModel<OperatingHours>;

  protected welcomeOverview: WritableSignal<
    | {
        operating_hours: OperatingHours[];
      }
    | undefined
  > = signal(undefined);

  openOperatingHours = computed(() => {
    const now = new Date();
    const overview = this.welcomeOverview();
    if (!overview || !overview.operating_hours) {
      return undefined;
    }
    return overview.operating_hours.find(
      (hours: OperatingHours) => hours.start <= now && hours.end >= now
    );
  });

  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    private dialog: MatDialog,
    protected snackBar: MatSnackBar,
    private welcomeService: WelcomeService
  ) {
    this.selection = new SelectionModel<OperatingHours>(true, []);
  }

  ngOnInit(): void {
    this.fetchOperatingHours();

    this.welcomeService.getWelcomeStatus().subscribe((data) => {
      this.welcomeOverview.set(data);
    });
  }

  validateHours(inputStart: Date, inputEnd: Date): boolean {
    const startDate = new Date(inputStart);
    const endDate = new Date(inputEnd);

    if (isNaN(startDate.getTime())) {
      this.snackBar.open('Please provide valid dates.', '', {
        duration: 2000
      });
      return false;
    }

    if (startDate > endDate) {
      this.snackBar.open('Start time must be before end time.', '', {
        duration: 2000
      });
      return false;
    }

    startDate.setHours(0, 0, 0, 0);
    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    if (startDate < currDate) {
      this.snackBar.open('Start date cannot be in the past.', '', {
        duration: 2000
      });
      return false;
    }
    return true;
  }

  createOperatingHours(): void {
    console.log(this.newOperatingHours.startDate);
    const startDate = new Date(this.newOperatingHours.startDate);
    const endDate = new Date(this.newOperatingHours.endDate);
    const [startHour, startMinute] = this.newOperatingHours.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = this.newOperatingHours.endTime
      .split(':')
      .map(Number);
    if (isNaN(endDate.getTime())) {
      endDate.setTime(startDate.getTime());
    }
    if (!this.validateHours(startDate, endDate)) {
      return;
    }

    const ohObservables: Observable<OperatingHours>[] = [];
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
      ohObservables.push(
        this.coworkingService.createOperatingHours({
          id: 0,
          start: start,
          end: end
        })
      );
    }

    forkJoin(ohObservables)
      .subscribe({
        next: () => {
          this.snackBar.open('Operating hours added successfully.', '', {
            duration: 2000
          });
        },
        error: (error) => {
          this.snackBar.open('An error occurred while adding hours.', '', {
            duration: 2000
          });
          this.resetNewOperatingHours();
          this.fetchOperatingHours();
          this.fetchWelcomeOverview();
        }
      })
      .add(() => {
        this.resetNewOperatingHours();
        this.fetchOperatingHours();
        this.fetchWelcomeOverview();
      });
  }

  openEditDialog(): void {
    if (this.selection.selected.length !== 1) {
      this.snackBar.open('Please select a single row to edit.', '', {
        duration: 2000
      });
      return;
    }

    const dialogRef = this.dialog.open(EditOperatingHoursDialog, {
      width: '400px',
      data: this.selection.selected[0]
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        if (!this.validateHours(res.start, res.end)) {
          return;
        }
        this.coworkingService.editOperatingHours(res).subscribe({
          next: (resp) => {
            this.snackBar.open('Operating hours edited successfully', '', {
              duration: 3000
            });
            this.fetchOperatingHours();
          },
          error: (err) => {
            this.snackBar.open('Failed to edit operating hours', '', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  deleteOperatingHours(): void {
    const ohObservables = this.selection.selected.map((row) =>
      this.coworkingService.deleteOperatingHours(row.id)
    );
    forkJoin(ohObservables).subscribe({
      next: () => {
        this.snackBar.open('Operating hours deleted successfully.', '', {
          duration: 2000
        });
        this.fetchOperatingHours();
        this.fetchWelcomeOverview();
      },
      error: (error) => {
        this.snackBar.open('Failed to delete operating hour.', '', {
          duration: 2000
        });
      }
    });
  }

  resetNewOperatingHours(): void {
    this.newOperatingHours = {
      startDate: '',
      endDate: '',
      startTime: '10:00',
      endTime: '20:00'
    };
  }

  // fetch will take start and end as params from UI after we add table date picker
  fetchOperatingHours(): void {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    // jsut going to default to 8 weeks for now
    end.setDate(start.getDate() + 7 * 8);
    end.setHours(23, 59, 59, 999);

    this.selection.clear();
    this.coworkingService.listOperatingHours(start, end).subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  fetchWelcomeOverview(): void {
    this.welcomeService.getWelcomeStatus().subscribe((data) => {
      this.welcomeOverview.set(data);
    });
  }

  formatTableTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York'
    };
    return date.toLocaleString('en-us', options);
  }

  isAllSelected(): boolean {
    return this.selection.selected.length == this.dataSource.data.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }
}
