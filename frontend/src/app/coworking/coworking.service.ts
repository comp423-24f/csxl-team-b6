/**
 * @author Kris Jordan, Ajay Gandecha, John Schachte
 * @copyright 2024
 * @license MIT
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy, WritableSignal, signal } from '@angular/core';
import { Subscription, map, BehaviorSubject, Observable } from 'rxjs';
import {
  CoworkingStatus,
  CoworkingStatusJSON,
  ReservationJSON,
  SeatAvailability,
  parseCoworkingStatusJSON,
  parseReservationJSON,
  Reservation,
  EMPTY_COWORKING_STATUS,
  OperatingHours,
  OperatingHoursJSON,
  parseOperatingHoursJSON
} from './coworking.models';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../models.module';
import { TimeRange } from '../time-range';

const ONE_HOUR = 60 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class CoworkingService implements OnDestroy {
  private statusSignal: WritableSignal<CoworkingStatus> = signal(
    EMPTY_COWORKING_STATUS
  );
  public status = this.statusSignal.asReadonly();

  private profile: Profile | undefined;
  private profileSubscription!: Subscription;

  isCancelExpanded = new BehaviorSubject<boolean>(false);

  public findActiveReservationPredicate: (r: Reservation) => boolean = (
    r: Reservation
  ) => {
    let now = new Date();
    let soon = new Date(
      Date.now() + 10 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */
    );
    const activeStates = ['DRAFT', 'CONFIRMED', 'CHECKED_IN'];
    return r.start <= soon && r.end > now && activeStates.includes(r.state);
  };

  public constructor(
    protected http: HttpClient,
    protected profileSvc: ProfileService
  ) {
    this.profileSubscription = this.profileSvc.profile$.subscribe(
      (profile) => (this.profile = profile)
    );
  }

  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }

  pollStatus(): void {
    this.http
      .get<CoworkingStatusJSON>('/api/coworking/status')
      .pipe(map(parseCoworkingStatusJSON))
      .subscribe((status) => this.statusSignal.set(status));
  }

  draftReservation(seatSelection: SeatAvailability[]) {
    if (this.profile === undefined) {
      throw new Error('Only allowed for logged in users.');
    }

    let start = seatSelection[0].availability[0].start;
    let end = new Date(start.getTime() + 2 * ONE_HOUR);
    let reservation = {
      users: [this.profile],
      seats: seatSelection.map((seatAvailability) => {
        return { id: seatAvailability.id };
      }),
      start,
      end
    };

    return this.http
      .post<ReservationJSON>('/api/coworking/reservation', reservation)
      .pipe(map(parseReservationJSON));
  }

  /**
   * Toggles the expansion state of the cancellation UI.
   *
   * This method inverts the current boolean state of `isCancelExpanded`.
   * If `isCancelExpanded` is currently true, calling this method will set it to false, and vice versa.
   * This is typically used to control the visibility of a UI element that allows the user to cancel an action.
   *
   * @example
   * // Assuming `isCancelExpanded` is initially false
   * toggleCancelExpansion();
   * // Now `isCancelExpanded` is true
   *
   * @returns {void}
   */
  toggleCancelExpansion(): void {
    this.isCancelExpanded.next(!this.isCancelExpanded.value);
  }

  /**
   * Retrieves the list of operating hours.
   * @returns {Observable<OperatingHours[]>}
   */
  listOperatingHours(start?: Date, end?: Date): Observable<OperatingHours[]> {
    let params = new HttpParams();
    if (start) {
      params = params.set('start', start.toISOString());
    }
    if (end) {
      params = params.set('end', end.toISOString());
    }
    return this.http
      .get<
        OperatingHoursJSON[]
      >('/api/coworking/operating_hours', { params: params })
      .pipe(map((jsonArray) => jsonArray.map(parseOperatingHoursJSON)));
  }

  /**
   * Creates new operating hours.
   * @param operatingHours - The operating hours data to be added.
   * @returns {Observable<OperatingHours>}
   */
  createOperatingHours(
    operatingHours: OperatingHours
  ): Observable<OperatingHours> {
    return this.http
      .post<OperatingHoursJSON>(
        '/api/coworking/operating_hours',
        operatingHours
      )
      .pipe(
        map(
          (resp: OperatingHoursJSON): OperatingHours =>
            parseOperatingHoursJSON(resp)
        )
      );
  }

  /**
   * Deletes operating hours by ID.
   * @param id - The ID of the operating hours to delete.
   * @returns {Observable<any>}
   */
  deleteOperatingHours(id: number): Observable<void> {
    return this.http.delete<void>(`/api/coworking/operating_hours/${id}`);
  }

  editOperatingHours(
    operatingHours: OperatingHours
  ): Observable<OperatingHours> {
    return this.http
      .put<OperatingHoursJSON>('/api/coworking/operating_hours', operatingHours)
      .pipe(
        map(
          (resp: OperatingHoursJSON): OperatingHours =>
            parseOperatingHoursJSON(resp)
        )
      );
  }

  getPaginatedOperatingHours(
    startDate: Date,
    page: number,
    pageSize: number,
    future: boolean
  ): Observable<OperatingHours[]> {
    let params = new HttpParams()
      .set('start_date', startDate.toISOString())
      .set('page', page)
      .set('page_size', pageSize)
      .set('future', future);
    return this.http
      .get<OperatingHoursJSON[]>('/api/coworking/operating_hours/page', {
        params: params
      })
      .pipe(map((jsonArray) => jsonArray.map(parseOperatingHoursJSON)));
  }

  countHours(startDate: Date, future: boolean): Observable<number> {
    let params = new HttpParams()
      .set('start_date', startDate.toISOString())
      .set('future', future);
    return this.http.get<number>('/api/coworking/operating_hours/count', {
      params: params
    });
  }
}
