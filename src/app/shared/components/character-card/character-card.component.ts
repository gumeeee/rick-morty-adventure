import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Character } from '../../../core/models';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss',
})
export class CharacterCardComponent {
  character = input.required<Character>();

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Alive: 'status-alive',
      Dead: 'status-dead',
      unknown: 'status-unknown',
    };

    return statusMap[status] || 'status-unknown';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      Alive: 'bi-heart-fill',
      Dead: 'bi-x-circle-fill',
      unknown: 'bi-question-circle-fill',
    };
    return iconMap[status] || 'bi-question-circle-fill';
  }
}
