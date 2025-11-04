export interface TMDBEpisodeDetails {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  runtime: number;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview: string;
  episodes: TMDBEpisodeDetails[];
  season_number: number;
  poster_path: string | null;
}

export interface EnrichedEpisode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;

  tmdb?: {
    rating: number;
    voteCount: number;
    overview: string;
    stillPath: string | null;
    runtime: number;
  };
}
