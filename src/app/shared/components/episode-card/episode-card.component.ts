import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Episode } from '../../../core/models';

@Component({
  selector: 'app-episode-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './episode-card.component.html',
  styleUrl: './episode-card.component.scss',
})
export class EpisodeCardComponent {
  episode = input.required<Episode>();

  getSeasonNumber(episodeCode: string): number {
    const match = episodeCode.match(/S(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  getEpisodeNumber(episodeCode: string): number {
    const match = episodeCode.match(/E(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  getSeasonColor(season: number): string {
    const colors = [
      '#97ce4c',
      '#11b0c8',
      '#f0e14a',
      '#5a1e76',
      '#ef4444',
      '#8b5cf6',
    ];
    return colors[(season - 1) % colors.length];
  }
}
