import { Component } from '@angular/core';

interface Question {
  question: string;
  answer: string;
  active: boolean;
}

@Component({
  selector: 'homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  questions: Question[] = [
    {
      question: 'What is Quantum Orbs?',
      answer:
        'Quantum Orbs is a gamblify project built on the layer 2 blockchain Blast. It offers users the opportunity to participate in a unique gaming experience by opening orbs and winning quantum points, which are essential for increasing your leaderboard ranking.',
      active: false,
    },
    {
      question: 'How does Quantum Orbs work?',
      answer:
        'Users participate by opening differen orbs some of which may contain 5 to 10 times more quantum points. We also offer a special Twitter/X orb that users can obtain by completing tasks on Twitter/X. By opening orbs users get quantum points and therefore rank up in the leaderboard.',
      active: false,
    },
    {
      question: 'Why is leaderboard important? How is profit shared?',
      answer:
        "We commit to sharing 50% of the drops received with our most active users through the leaderboard. Users' positions on the leaderboard determine their rewards. The higher the position, the more drops they receive. Additionally, our referral system grants 10% of the commission per transaction to the inviter for referrals.",
      active: false,
    },
    {
      question: 'Is Quantum Orbs secure?',
      answer:
        'Yes, Quantum Orbs prioritizes the security of user funds and personal information, implementing robust security measures.',
      active: false,
    },
    {
      question:
        'What is the Blast blockchain, and why is it used for Quantum Orbs?',
      answer:
        'The Blast blockchain is a layer 2 scaling solution for Ethereum, providing faster and more cost-effective transactions. Quantum Orbs leverages Blast to enhance the user experience, reduce transaction fees, and improve scalability.',
      active: false,
    },
    {
      question: 'How can I contact customer support?',
      answer:
        'For any inquiries or assistance, please reach out to our customer support team at support@quantumorbs.com.',
      active: false,
    },
    {
      question:
        'Where can I find updates and announcements about Quantum Orbs?',
      answer:
        'Stay informed about the latest updates, announcements, and developments by following our official Twitter.',
      active: false,
    },
  ];
}
