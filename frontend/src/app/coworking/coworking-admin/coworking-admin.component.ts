import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OperatingHours } from '../coworking.models';
import { forkJoin, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

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

  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    protected snackBar: MatSnackBar
  ) {
    this.selection = new SelectionModel<OperatingHours>(true, []);
  }
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

    forkJoin(ohObservables).subscribe({
      next: () => {
        this.snackBar.open('Operating hours added successfully.', '', {
          duration: 2000
        });
        this.resetNewOperatingHours();
        this.fetchOperatingHours();
      },
      error: (error) => {
        this.snackBar.open('Failed to create operating hours.', '', {
          duration: 2000
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

  formatTableTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York'
    };
    return date.toLocaleString('en-us', options);
  }

  isAllSelected() {
    return this.selection.selected.length == this.dataSource.data.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  ngOnInit(): void {
    this.fetchOperatingHours();
  }
}
