// REAL CONTENT — unlike events.ts and site.ts, nothing here is invented.
//
// The page is built around the pay, because that is what an applicant is
// reading for. Every paid line here is gated on a milestone that is stated
// next to it — five approved events, a registration target — and roles.test.ts
// fails the build on a payment sentence with no milestone attached to it.
// Partner perks keep their "subject to the event" wording, because they
// genuinely do depend on which sponsors are on a given hackathon.

import type { Programme, Role } from "@/lib/types";

export const programme: Programme = {
  premise:
    "We Code Coders is expanding its team across India. We are looking for motivated students, creators and community leaders who want practical experience in organising hackathons, growing technical communities and producing digital content.",
  pay: {
    headline: "₹10,000 a month",
    gate: "once you clear your milestone",
    detail:
      "You are selected first. Then you complete your milestone — five approved events if you organise, your registration target if you lead a campus. Once the team has reviewed and signed the work off, you move onto paid events and start being paid ₹10,000 a month. The full terms are shared with you when you are selected. Creator and designer roles are not paid; they run on credit, collaborations and reach, and that is set out in full under the role.",
  },

  commitment: [
    {
      label: "Hours",
      detail:
        "You decide how much you contribute. We suggest at least 10 hours a week — that is a suggestion, not a quota, and what matters is the milestones you complete rather than the hours you log.",
    },
    {
      label: "Responsiveness",
      detail:
        "Reply to team messages within about 24 hours. Campaign weeks move faster than that, and we will say so in advance when they do.",
    },
    {
      label: "Event days",
      detail:
        "Be available for the run of an event you are on — that means the whole window for a hackathon, not just the opening. Tell us early if you cannot, and we will cover it.",
    },
    {
      label: "Duration",
      detail:
        "There is no fixed three- or six-month term. The role continues based on performance, and ends when either side says it has run its course.",
    },
  ],

  rounds: [
    {
      round: "01",
      title: "Application form",
      detail: "One form, and it is the only thing standing between you and a shortlist.",
      items: [
        "Personal and contact details.",
        "College, organisation, city and course information.",
        "Preferred role.",
        "Relevant experience and skills.",
        "Social-media or portfolio links, where applicable.",
        "Availability and preferred responsibilities.",
        "A short introduction explaining why you want to join.",
        "Organisers: a brief idea for an online or offline hackathon.",
        "Creators: previous designs, reels or sample work.",
        "Ambassadors: your promotion plan and estimated reach.",
      ],
    },
    {
      round: "02",
      title: "Interview",
      detail:
        "Shortlisted candidates are invited to an online interview covering communication, reliability, role-specific skills, availability and your understanding of the responsibilities. Selected candidates usually start with a trial assignment, campaign or event before a long-term role is confirmed.",
    },
  ],

  onboarding: {
    title: "You are selected",
    detail:
      "Once the interview is done and you have been selected, we take you through the whole process step by step. You receive an offer letter, an introduction to the team you will be working with, and everything you need to run your first campaign or event. The rest of the programme detail — milestones, reporting, payment schedule and role-specific terms — is shared with you at that point.",
  },

  conditions: [
    "Only genuine and verifiable registrations, submissions and completed tasks are counted.",
    "Bots, duplicate registrations, fabricated reports, purchased engagement or manipulation result in immediate removal.",
    "You must not promise prizes, payments, sponsorships or benefits unless they are officially approved in writing.",
    "Partner benefits depend on availability, eligibility and the terms applicable to each event.",
    "Certificates and LORs are awarded for completed work. Register, complete the work, and they are yours.",
    "Offline organisers must obtain campus, venue and local permissions before announcing an event.",
    "No organiser may collect money, sign agreements or commit expenses on behalf of We Code Coders without written authorisation.",
    "Applicants under 18 may need permission from a parent, guardian or institution for offline responsibilities or financial arrangements.",
    "Additional programme details and role-specific terms are shared only with selected candidates.",
    "Terms and conditions apply.",
  ],

  /*
    No href yet. The page renders "Applications open soon" rather than a button
    that goes nowhere — the same posture the event pages take before a
    registration form exists. Adding the URL here opens it.
  */
  application: {
    note: "The form is not live yet. It opens here first, and every application goes through it — there is no back channel, and nobody is shortlisted off a DM.",
  },
};

export const roles: Role[] = [
  {
    code: "01",
    anchor: "organiser",
    title: "Hackathon Organiser",
    kicker: "Run an event, end to end",
    summary:
      "Organisers run online or offline hackathons at their campus, in their city, or through another approved institution or community. You own the event end to end — the venue, the participants, the judging, the run of the day and the report that closes it. We supply the format, the certificates, the sponsor benefits and a team you can call when something breaks at 2am; you supply the room and the people in it. Most organisers start with one online event, because it needs no permissions and no budget, and move to campus events once they have run the format through once. In-depth operating detail, templates and the full playbook go to selected candidates.",
    responsibilities: [
      "Plan and conduct online or offline hackathons under We Code Coders.",
      "Select a suitable campus, venue, community or online platform.",
      "Obtain all required permissions for offline events.",
      "Promote the event and bring genuine participants.",
      "Coordinate registrations, announcements, submissions and participant support.",
      "Complete assigned sponsor and operational requirements.",
      "Arrange judges independently, or ask our team for help finding them.",
      "Run the event professionally and submit the final report, participant data and feedback.",
      "Follow all branding, safety, privacy and sponsor guidelines.",
    ],
    openings: 3,
    reward: {
      kind: "pay",
      headline: "₹10,000 a month after five events",
      detail:
        "Run five approved hackathons. Once those five are signed off by the team — the events delivered, the participant data in, the reports complete — you move onto paid events and start being paid ₹10,000 a month.",
    },
    support: {
      intro:
        "What we provide. Sponsor perks depend on which partners are on your event, so the list varies from one hackathon to the next:",
      items: [
        "Event-planning guidance and operational support.",
        "Verifiable digital certificates for eligible participants.",
        "Winner and organiser certificates.",
        "Workshops and technical sessions, subject to availability.",
        "Help finding judges when you need it.",
        "Sponsor-backed LORs for eligible top teams, when included in the approved event reward structure.",
        "Up to $100 in Inkloom AI credits for eligible participants.",
        "Up to $500 in Adaption Labs platform credits for eligible participants.",
        "A complimentary .xyz domain for eligible participants.",
        "n8n benefits, on events where n8n is a partner.",
        "Red Bull, on events where they are on board.",
      ],
    },
    benefits: [
      "A verified Hackathon Organiser certificate after each approved event you complete.",
      "Public recognition across We Code Coders channels, with your name on the events you ran.",
      "Practical experience in event management, leadership, sponsorship and community building — the kind that is hard to get before you graduate.",
      "A Letter of Recommendation based on the events you delivered.",
      "A direct line to the sponsors and partners who back our events.",
    ],
    skills: [
      "Leadership and team management.",
      "Strong communication and coordination.",
      "A basic understanding of hackathons and technology events.",
      "The ability to promote an event and build a participant community.",
      "Time management and deadline discipline.",
      "Professional communication with students, institutions, speakers and judges.",
      "Problem-solving while an event is live.",
      "Familiarity with Google Forms, Sheets, WhatsApp, Discord, Canva, Unstop or similar tools.",
      "Previous experience in clubs, communities, events or sponsorships helps, but is not required.",
    ],
  },
  {
    code: "02",
    anchor: "creators",
    title: "Creators, Influencers and Designers",
    kicker: "Reels, posters, campaigns",
    summary:
      "Reel editors, graphic designers, content creators, social-media managers and campus influencers. You make the work people actually see — the posters on a hackathon page, the reels that fill it, the carousels that explain it — and it goes out under your credit. Campaigns run in short bursts around each event, so the work is concentrated rather than constant, and you know the brief and the deadline before you take one on. Brand kit, templates and campaign briefs go to selected candidates.",
    responsibilities: [
      "Create or edit posters, reels, stories, carousels and promotional content.",
      "Promote approved We Code Coders hackathons and campaigns.",
      "Follow campaign timelines, brand guidelines and content requirements.",
      "Submit original work, and make reasonable revisions when asked.",
      "Maintain professional conduct while representing the community.",
      "Share campaign performance or reach data when requested.",
    ],
    openings: 3,
    reward: {
      kind: "recognition",
      headline: "Credit, collaborations and reach",
      detail:
        "This role is not paid. What it gives you is visibility: your credit on the work, collaboration posts on selected events, and your name in front of a national community of student builders — including on the event pages themselves. If you are building a portfolio or an audience, that is the trade.",
    },
    benefits: [
      "Creator credit on the posts, posters and reels you make.",
      "Collaboration posts with We Code Coders on selected events.",
      "Your work shown on the event pages it was made for.",
      "Tagging or collaboration posts where appropriate.",
      "Recognition in front of the We Code Coders community.",
      "Verified contribution certificates for completed work.",
      "Performance-based Letters of Recommendation.",
      "Portfolio-ready work from national-level events.",
      "Access to selected partner benefits and community opportunities.",
      "Priority access to our offline hackathons, where the venue has room.",
      "Work on national-level events that people outside your college will see.",
    ],
  },
  {
    code: "03",
    anchor: "ambassadors",
    title: "Campus Ambassadors and City Leads",
    kicker: "Represent your campus",
    summary:
      "Ambassadors represent We Code Coders at their institution, promote events, grow the local community and connect students with technical opportunities. The role starts with a registration target and is measured against it, so it is the most straightforward of the three to be judged on: you know exactly what you have to hit, you can see your own numbers through your referral link, and nobody is guessing about whether you did the work. Strong ambassadors become Campus Leads and then City Leads, which means running your own team. Territory, targets and the reporting tools go to selected candidates.",
    responsibilities: [
      "Promote approved hackathons and initiatives across your campus or city.",
      "Bring genuine registrations through your assigned link or referral code.",
      "Build and manage campus-level participant communities.",
      "Share official announcements accurately and on time.",
      "Help participants with basic registration and event information.",
      "Prevent duplicate, fake, bot-generated or manipulated registrations.",
      "Submit campaign reports and registration evidence when requested.",
    ],
    milestones: [
      "You start by completing an assigned registration target.",
      "Milestones range from 100 to 500 verified registrations, depending on the campaign.",
      "Reaching the required milestone makes you eligible for selection as a Campus Ambassador.",
      "Strong performers may be promoted to Campus Lead or City Lead.",
      "Leadership selection depends on verified registrations, consistency, communication, participant feedback and overall conduct.",
    ],
    openings: 5,
    reward: {
      kind: "pay",
      headline: "₹10,000 a month once you hit your target",
      detail:
        "Clear the registration target you are set — between 100 and 500 verified registrations, depending on the campaign. Once those registrations are verified and your campaign is reviewed, you move onto paid campaigns and start being paid ₹10,000 a month.",
    },
    benefits: [
      "A verified Campus Ambassador, Campus Lead or City Lead certificate.",
      "A Letter of Recommendation covering the campaigns you ran.",
      "Promotion to Campus Lead or City Lead, running your own team.",
      "Public recognition and real leadership experience on your CV.",
      "Priority access to our programmes, events and internal opportunities.",
    ],
  },
];
