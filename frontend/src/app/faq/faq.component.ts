import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

interface Question {
  question: string;
  answer: string;
}

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./faq.component.html",
  styleUrl: "./faq.component.scss",
})
export class FaqComponent {
  readonly open = signal<number | null>(0);

  readonly questions: Question[] = [
    {
      question: "What is Quantum Orb?",
      answer:
        "A points game on the Blast network. You open one free orb every day and can buy higher tiers. Every orb pays quantum points, and points decide your place on the leaderboard.",
    },
    {
      question: "How does an orb decide what I get?",
      answer:
        "Paying and finding out are two separate steps. Your payment records the block it landed in, and the result comes from the hash of a later block that did not exist yet. Nobody can predict it or take it back once it does.",
    },
    {
      question: "Can I check that a result was fair?",
      answer:
        "Yes, and you do not have to take our word for it. Every input is on the blockchain, so any result can be recomputed by anyone. The rules and the exact odds are on the provably fair page.",
    },
    {
      question: "What orbs are there?",
      answer:
        "Three. The daily orb is free and returns every 24 hours. Genesis and Quantum are bought with ETH and pay considerably more.",
    },
    {
      question: "What is a daily streak?",
      answer:
        "Open your daily orb on consecutive days and the streak grows. Each day adds 5% to what the daily orb pays, up to 30% on the seventh day. Miss a day and it starts again.",
    },
    {
      question: "How do referrals work?",
      answer:
        "Share your invite link. Whoever opens their first orb through it is tied to you permanently, and you earn 10% of every point they win from then on. You cannot invite yourself, and two people cannot invite each other.",
    },
    {
      question: "What happens if my orb never opens?",
      answer:
        "A helper service normally finishes the opening for you within seconds. If it is down you can finish it yourself, and if too much time passes you reclaim your payment straight from the contract. Your money is never stuck.",
    },
    {
      question: "Do I need an account?",
      answer:
        "No. There is no registration, no email and no password. You connect a wallet and that is it.",
    },
    {
      question: "Why Blast?",
      answer:
        "Blast is a layer 2 network on Ethereum, so transactions settle quickly and cost very little. That matters in a game where opening orbs often is the whole point.",
    },
    {
      question: "How do I get in touch?",
      answer: "Write to quantum-orbs@gmail.com.",
    },
  ];

  toggle(index: number): void {
    this.open.update((current) => (current === index ? null : index));
  }
}
