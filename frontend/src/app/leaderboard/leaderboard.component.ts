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
      { rank: 1, address: 'Player 1', invitations: 25, points: 100 },
      { rank: 2, address: 'Player 2', invitations: 25, points: 90 },
    ];
  }

  ngOnInit(): void {
    // Fetch leaderboard data from the backend
    // this.leaderboardService.getLeaderboardData().subscribe((data: any) => {
    //   this.leaderboardData = data;
    // });
  }
}
