import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { CoworkingService } from '../coworking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OperatingHours } from '../coworking.models';
import { forkJoin, Observable, of } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
  protected data = {
    selectedID: 0,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  };
  protected dataSource = new MatTableDataSource<OperatingHours>([]);
  protected selection: SelectionModel<OperatingHours>;
  @ViewChild('editDialog') dialogTemplate!: TemplateRef<any>;

  constructor(
    public coworkingService: CoworkingService,
    private router: Router,
    private dialog: MatDialog,
    protected snackBar: MatSnackBar
  ) {
    this.selection = new SelectionModel<OperatingHours>(true, []);
  }

  ngAfterViewInit() {
    // Safe to use @ViewChild after the view has been initialized
    console.log('Dialog Template:', this.dialogTemplate);
  }

  validateHours(startDate: Date, endDate: Date): boolean {
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
        }
      })
      .add(() => {
        this.resetNewOperatingHours();
        this.fetchOperatingHours();
      });
  }

  openEditWindow(): void {
    if (this.selection.selected.length != 1) {
      this.snackBar.open(
        'Please select a single entry of operating hours to edit.',
        '',
        {
          duration: 2000
        }
      );
    } else {
      this.data.selectedID = this.selection.selected[0].id;
      this.data.startDate = this.selection.selected[0].start
        .toISOString()
        .split('T')[0];
      this.data.endDate = this.selection.selected[0].end
        .toISOString()
        .split('T')[0];

      this.data.startTime = this.formatTableTime(
        this.selection.selected[0].start
      ).split(' ')[0];
      this.data.endTime = this.formatTableTime(
        this.selection.selected[0].end
      ).split(' ')[0];

      of(this.data.selectedID).subscribe({
        next: () => {
          this.dialog.open(this.dialogTemplate, {
            width: '400px'
          });
        }
      });
    }
  }

  editOperatingHours(): void {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York'
    };

    var startDate = new Date(this.data.startDate);
    var endDate = new Date(this.data.endDate);
    const [startHour, startMinute] = this.data.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.data.endTime.split(':').map(Number);
    startDate.setHours(startHour);
    startDate.setMinutes(startMinute);
    endDate.setHours(endHour);
    endDate.setMinutes(endMinute);

    var finalStart = this.formatTableTime(startDate);
    var finalEnd = this.formatTableTime(endDate);

    console.log(startDate);
    console.log(endDate);

    if (!this.validateHours(startDate, endDate)) {
      return;
    } else {
      var time = {
        start: startDate,
        end: endDate
      };
      this.coworkingService
        .editOperatingHours(this.data.selectedID, time)
        .subscribe({
          next: () => {
            this.snackBar.open('Operating hours edited successfully.', '', {
              duration: 2000
            });
            this.fetchOperatingHours();
          },
          error: (error) => {
            this.snackBar.open('Failed to edit operating hours.', '', {
              duration: 2000
            });
          }
        });
    }
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

  //   fetch will take start and end as params from UI after we add table date picker
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

  ngOnInit(): void {
    this.fetchOperatingHours();
  }
}
