import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AddNoteComponent } from '../add-note/add-note.component';

interface CalendarItem {
  currentMonth?: boolean;
  date: Date;
  isToday?: boolean;
  isInThePast?: boolean;
}
interface WeekdayItem {
  name: string;
  isToday?: boolean;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  date: Date | null;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, AddNoteComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private dateObj = signal(new Date());
  public weekLength = 7;

  public selectedMonth = signal<CalendarItem[][]>([]);
  public dateLocaleString = signal('');

  @ViewChild('addNoteModal', { read: ElementRef })
  public addNoteModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('removeNoteDialog', { read: ElementRef })
  public removeNoteDialog!: ElementRef<HTMLDialogElement>;

  public addNoteDate = signal<Date | null>(null);

  public storedNotes = signal<Note[]>([]);

  public pendingNote = signal<Note | null>(null);

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  public ngOnInit(): void {
    this.selectedMonth.set(this.getSelectedMonth());
    this.dateLocaleString.set(this.getDateLocaleString());

    this.storedNotes.set(
      JSON.parse(localStorage.getItem('calendar-notes') || '[]'),
    );
  }
  public showAddNoteModal(
    e: MouseEvent,
    note: Note | null,
    date: Date | null = null,
  ): void {
    e.stopPropagation();
    this.pendingNote.set(note || { title: '', content: '', date });
    this.addNoteModal.nativeElement.showModal();
  }
  public showRemoveNoteDialog(e: MouseEvent, note: Note): void {
    e.stopPropagation();
    this.pendingNote.set(note);
    this.removeNoteDialog.nativeElement.showModal();
  }
  public showEditNoteModal(e: MouseEvent, note: Note) {
    e.stopPropagation();
    this.pendingNote.set(note);
  }
  public removeNote(): void {
    const updatedNotes = this.storedNotes().filter(
      ({ id }) => id !== this.pendingNote()?.id,
    );
    localStorage.setItem('calendar-notes', JSON.stringify(updatedNotes));
    this.storedNotes.set(updatedNotes);
    this.removeNoteDialog.nativeElement.close();
  }

  public closeAddNoteModal(): void {
    this.addNoteModal.nativeElement.close();
    this.addNoteDate.set(null);
    this.storedNotes.set(
      JSON.parse(localStorage.getItem('calendar-notes') || '[]'),
    );
  }

  public getWeekdayNames(): WeekdayItem[] {
    const dateObj = this.dateObj();
    const now = new Date();
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();

    return [...Array(this.weekLength).keys()]
      .map((dayIndex) => Date.UTC(y, m, dayIndex - this.getFirstDay(y, m) + 2))
      .map((date, i) => ({
        isToday: [
          now.getDay() === i,
          y === now.getFullYear(),
          m === now.getMonth(),
        ].every(Boolean),
        name: new Intl.DateTimeFormat(this.localeId, {
          weekday: 'long',
        }).format(date),
      }));
  }

  public prevMonth() {
    this.updateDate(-1);
  }
  public nextMonth() {
    this.updateDate(1);
  }
  public gotoToday() {
    this.dateObj.set(new Date());
    this.selectedMonth.set(this.getSelectedMonth());
    this.dateLocaleString.set(this.getDateLocaleString());
  }

  private updateDate(month: number) {
    this.dateObj.update((date) => {
      month > 0 ? date.setMonth(date.getMonth() + month) : date.setDate(0);
      return date;
    });
    this.selectedMonth.set(this.getSelectedMonth());
    this.dateLocaleString.set(this.getDateLocaleString());
  }

  private getDateLocaleString() {
    const date = this.dateObj();
    const month = new Intl.DateTimeFormat(this.localeId, { month: 'long' });
    const year = new Intl.DateTimeFormat(this.localeId, { year: 'numeric' });

    return `${month.format(date)}, ${year.format(date)}`;
  }

  private getSelectedMonth() {
    const prevMonth = this.getPrevMonthVisibleDays();
    const nextMonth = this.getNextMonthVisibleDays();
    const currentMonth = this.getCurrentMonth();

    return [...prevMonth, ...currentMonth, ...nextMonth].reduce(
      (acc, item, index) => {
        const weekIndex = Math.floor(index / this.weekLength);
        if (!acc[weekIndex]) {
          acc[weekIndex] = [];
        }
        acc[weekIndex].push(item);
        return acc;
      },
      [] as CalendarItem[][],
    );
  }

  private getDaysInMonth() {
    return new Date(
      this.dateObj().getFullYear(),
      this.dateObj().getMonth() + 1,
      0,
    ).getDate();
  }
  private getFirstDay(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  private getPrevMonthVisibleDays(): CalendarItem[] {
    const dateObj = this.dateObj();
    const firstDay = this.getFirstDay(
      this.dateObj().getFullYear(),
      this.dateObj().getMonth(),
    );
    return [...Array(firstDay)]
      .map(
        (_, i) =>
          new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            i - (firstDay - 1),
          ),
      )
      .map((date) => ({
        date,
        isToday: this.getIsToday(date),
        isInThePast: this.getIsInThePast(date),
      }));
  }

  private getCurrentMonth(): CalendarItem[] {
    const dateObj = this.dateObj();
    return [...Array(this.getDaysInMonth())]
      .map((_, i) => new Date(dateObj.getFullYear(), dateObj.getMonth(), i + 1))
      .map((date) => ({
        currentMonth: true,
        date,
        isToday: this.getIsToday(date),
        isInThePast: this.getIsInThePast(date),
      }));
  }

  private getNextMonthVisibleDays(): CalendarItem[] {
    const dateObj = this.dateObj();
    const firstDay = this.getFirstDay(
      this.dateObj().getFullYear(),
      this.dateObj().getMonth() + 1,
    );
    return [...Array((this.weekLength - firstDay) % this.weekLength)]
      .map(
        (_, i) =>
          new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, i + 1),
      )
      .map((date) => ({
        date,
        isToday: this.getIsToday(date),
        isInThePast: this.getIsInThePast(date),
      }));
  }

  private getIsToday(date: Date): boolean {
    const now = new Date();
    return [
      now.getDate() === date.getDate(),
      now.getMonth() === date.getMonth(),
      now.getFullYear() === date.getFullYear(),
    ].every(Boolean);
  }

  private getIsInThePast(date: Date): boolean {
    const now = new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
    return (
      date.getFullYear() < now.getFullYear() ||
      (isThisYear && date.getMonth() < now.getMonth()) ||
      (isThisYear &&
        date.getMonth() === now.getMonth() &&
        date.getDate() < now.getDate())
    );
  }
}
