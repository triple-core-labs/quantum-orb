import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "home",
    title: "Quantum Orb",
    loadComponent: () =>
      import("./homepage/homepage.component").then((m) => m.HomepageComponent),
  },
  {
    path: "orbs",
    title: "Orbs",
    loadComponent: () =>
      import("./orbpage/orbpage.component").then((m) => m.OrbpageComponent),
  },
  {
    path: "leaderboard",
    title: "Leaderboard",
    loadComponent: () =>
      import("./leaderboard/leaderboard.component").then(
        (m) => m.LeaderboardComponent,
      ),
  },
  {
    path: "referrals",
    title: "Referrals",
    loadComponent: () =>
      import("./referrals/referrals.component").then(
        (m) => m.ReferralsComponent,
      ),
  },
  {
    path: "privacy-policy",
    title: "Privacy Policy",
    loadComponent: () =>
      import("./footer/privacy-policy/privacy-policy.component").then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: "terms-of-use",
    title: "Terms of Use",
    loadComponent: () =>
      import("./footer/terms-of-use/terms-of-use.component").then(
        (m) => m.TermsOfUseComponent,
      ),
  },
  { path: "**", redirectTo: "home" },
];
