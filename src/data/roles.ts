// REAL CONTENT — unlike events.ts and site.ts, nothing here is invented.
// This is the recruitment copy as supplied, and the conditional wording is
// load-bearing: "eligible", "subject to availability", "when included in the
// approved event reward structure" and "not guaranteed" are the difference
// between an offer and a promise. Do not tighten them into something cleaner.

import type { Programme, Role } from "@/lib/types";

export const programme: Programme = {
  premise:
    "We Code Coders is expanding its team across India. We are looking for motivated students, creators and community leaders who want practical experience in organising hackathons, growing technical communities and producing digital content.",
  compensation:
    "This is a performance-based community leadership programme. Fixed salaries are not guaranteed unless separately confirmed in writing. Certificates, LORs, incentives and paid opportunities depend on performance, completed responsibilities and applicable programme terms.",

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

  conditions: [
    "Only genuine and verifiable registrations, submissions and completed tasks are counted.",
    "Bots, duplicate registrations, fabricated reports, purchased engagement or manipulation result in immediate removal.",
    "You must not promise prizes, payments, sponsorships or benefits unless they are officially approved in writing.",
    "Partner benefits depend on availability, eligibility and the terms applicable to each event.",
    "Certificates and LORs are awarded for completed work and satisfactory performance. They are not issued for joining.",
    "Monetary support after five events is performance-based and not guaranteed.",
    "Revenue sharing applies only to verified registrations attributed to your official referral link or code.",
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
      "Organisers conduct online or offline hackathons at their campus, in their city, or through another approved institution or community. You own the event: the venue, the participants, the running of it, and the report at the end.",
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
    support: {
      intro: "What we provide, subject to eligibility and availability:",
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
        "n8n benefits for selected events in special approved cases, subject to availability.",
      ],
    },
    benefits: [
      "A verified Hackathon Organiser certificate after you complete an approved event.",
      "Public recognition across We Code Coders channels.",
      "Practical experience in event management, leadership, sponsorship and community building.",
      "A Letter of Recommendation based on performance, professionalism and completed responsibilities.",
      "After five completed events with strong participant feedback, you may become eligible for monetary support or paid event opportunities.",
      "Payment and financial support are not automatic, and apply only to selected organisers under written terms.",
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
      "Reel editors, graphic designers, content creators, social-media managers and campus influencers. You make the work people actually see, and it goes out under your credit.",
    responsibilities: [
      "Create or edit posters, reels, stories, carousels and promotional content.",
      "Promote approved We Code Coders hackathons and campaigns.",
      "Follow campaign timelines, brand guidelines and content requirements.",
      "Submit original work, and make reasonable revisions when asked.",
      "Maintain professional conduct while representing the community.",
      "Share campaign performance or reach data when requested.",
    ],
    benefits: [
      "Creator credit on eligible posts, posters and reels.",
      "Tagging or collaboration posts where appropriate.",
      "Recognition in front of the We Code Coders community.",
      "Verified contribution certificates for completed work.",
      "Performance-based Letters of Recommendation.",
      "Portfolio-ready work from national-level events.",
      "Access to selected partner benefits and community opportunities.",
      "Media influencers may get preference for access to offline hackathons, subject to venue capacity and event requirements.",
      "Consistent high performers may be considered for paid assignments when campaign budgets allow.",
    ],
  },
  {
    code: "03",
    anchor: "ambassadors",
    title: "Campus Ambassadors and City Leads",
    kicker: "Represent your campus",
    summary:
      "Ambassadors represent We Code Coders at their institution, promote events, grow the local community and connect students with technical opportunities. This role starts with a target and is measured against it.",
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
    benefits: [
      "A verified Campus Ambassador, Campus Lead or City Lead certificate.",
      "A performance-based Letter of Recommendation.",
      "Public recognition and leadership experience.",
      "Priority access to selected programmes, events and internal opportunities.",
      "For approved paid events, selected ambassadors may receive 25%–40% of the net registration revenue generated through their verified referral link or code.",
      "The exact percentage, payment conditions and verification process depend on the campaign, and are communicated in writing before it starts.",
    ],
  },
];
