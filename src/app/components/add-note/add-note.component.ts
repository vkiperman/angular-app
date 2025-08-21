import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { Note } from '../calendar/calendar.component';

@Component({
  selector: 'add-note',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.scss',
})
export class AddNoteComponent {
  public added = output();
  public note = input<Note | null>(null);

  public addNoteForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    date: new FormControl<Date | null>(null),
    id: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => this.addNoteForm.patchValue(this.note()!));
  }

  public addNote(): void {
    if (this.addNoteForm.invalid) {
      return;
    }
    const storedNotes = JSON.parse(
      localStorage.getItem('calendar-notes') || '[]',
    );

    localStorage.setItem(
      'calendar-notes',
      JSON.stringify(
        this.note()?.id
          ? [
              ...storedNotes.filter(({ id }: Note) => id !== this.note()?.id),
              this.addNoteForm.getRawValue(),
            ]
          : [...storedNotes, { ...this.addNoteForm.getRawValue(), id: uuid() }],
      ),
    );
    this.addNoteForm.reset();
    this.added.emit();
  }
}
