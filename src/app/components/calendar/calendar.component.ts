import { CommonModule } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, signal } from '@angular/core';

interface CalendarItem {
  currentMonth?: boolean;
  date: number;
  isToday?: boolean;
}
interface WeekdayItem {
  name: string;
  isToday?: boolean;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private dateObj = signal(new Date());
  public weekLength = 7;

  public selectedMonth = signal<CalendarItem[][]>([]);
  public dateLocaleString = signal('');

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  ngOnInit(): void {
    this.selectedMonth.set(this.getSelectedMonth());
    this.dateLocaleString.set(this.getDateLocaleString());
  }

  public getWeekdayNames(): WeekdayItem[] {
    const y = this.dateObj().getFullYear(),
      m = this.dateObj().getMonth();

    return [...Array(7).keys()]
      .map((dayIndex) => Date.UTC(y, m, dayIndex - this.getFirstDay(y, m) + 2))
      .map((date, i) => ({
        isToday:
          this.dateObj().getDay() === i &&
          this.dateObj().getMonth() === new Date().getMonth() &&
          this.dateObj().getFullYear() === new Date().getFullYear(),
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
      month === 1 ? date.setMonth(date.getMonth() + month) : date.setDate(0);
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

  private getCurrentMonth() {
    const date = new Date();
    return [...Array(this.getDaysInMonth())].map((_, i) => ({
      currentMonth: true,
      date: i + 1,
      isToday: [
        date.getDate() === i + 1,
        date.getMonth() === this.dateObj().getMonth(),
        date.getFullYear() === this.dateObj().getFullYear(),
      ].every(Boolean),
    }));
  }

  private getPrevMonthVisibleDays(): CalendarItem[] {
    const firstDay = this.getFirstDay(
      this.dateObj().getFullYear(),
      this.dateObj().getMonth(),
    );
    return [...Array(firstDay)].map((_, i) => ({
      date: new Date(
        this.dateObj().getFullYear(),
        this.dateObj().getMonth(),
        i - (firstDay - 1),
      ).getDate(),
    }));
  }

  private getNextMonthVisibleDays() {
    const firstDay = this.getFirstDay(
      this.dateObj().getFullYear(),
      this.dateObj().getMonth() + 1,
    );
    return [...Array((7 - firstDay) % 7)].map((_, i) => ({
      date: i + 1,
    }));
  }
}
