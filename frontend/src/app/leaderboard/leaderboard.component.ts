import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  leaderboardData: any[];  

  constructor() {
    // Mock leaderboard data (replace this with actual data fetching logic)
    this.leaderboardData = [
      { rank: 1, address: 'TQrzzX7c8jWDkEZ6SK8EEg4GMmZhBQXakh', invitations: 25, points: 100600 },
      { rank: 2, address: 'TQrzzX7c8jWDkEZ6SK8EEg4GMmZhBQXakh', invitations: 25, points: 1 },
    ];
  }

  ngOnInit(): void {
    // Fetch leaderboard data from the backend
    // this.leaderboardService.getLeaderboardData().subscribe((data: any) => {
    //   this.leaderboardData = data;
    // });
  }
}
