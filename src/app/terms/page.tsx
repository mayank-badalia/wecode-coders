import type { Metadata } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";

export const metadata: Metadata = {
  title: "Paid event participation — terms — We Code Coders",
  description:
    "The notice, rules and terms that apply to any paid We Code Coders event or paid round: eligibility, the non-refundable fee, submissions, rankings, certificates, rewards and conduct.",
};

/*
  One terms page for every event.

  It is deliberately not six copies in `src/data/events.ts`. The promise made
  to a team paying for Round 3 of CodeAxis has to be the same promise made to
  a team paying for Round 3 of CodeTitans, and the only way that stays true
  while one of them is edited is for there to be a single copy to edit.

  Every event that charges for a round links here from its Round 3 block, and
  the footer carries it on every route.

  Typography follows the hiring page rather than the event pages: this is a
  document that gets read start to finish, not a page that gets browsed, so
  the measure is narrow and the body size is up.
*/

const TYPE = {
  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: "clamp(0.72rem, 0.9vw, 0.78rem)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  } as React.CSSProperties,
  body: {
    fontSize: "clamp(1rem, 1.05vw, 1.08rem)",
    lineHeight: 1.65,
  } as React.CSSProperties,
  lead: {
    fontFamily: "var(--font-editorial)",
    fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
    lineHeight: 1.55,
  } as React.CSSProperties,
} as const;

const SHELL: React.CSSProperties = {
  maxWidth: "min(1080px, 92vw)",
  margin: "0 auto",
  padding: "0 clamp(1.25rem, 2vw, 2rem)",
};

/** A paragraph, a numbered clause list, or a titled bullet list. */
type Block =
  | { kind: "p"; text: string }
  | { kind: "clauses"; items: string[] }
  | { kind: "bullets"; title?: string; items: string[] };

type Section = { code: string; title: string; blocks: Block[] };

const INTRO: Block[] = [
  {
    kind: "p",
    text: "These Terms apply to the paid event or paid round described on this page. The displayed event name, participation fee, eligibility requirements, format, schedule, deadlines, rewards and submission instructions form part of these Terms.",
  },
  {
    kind: "p",
    text: "By completing the payment, the team leader confirms that they and every listed team member have read, understood and accepted these Terms.",
  },
];

const SECTIONS: Section[] = [
  {
    code: "01",
    title: "Eligibility and Payment",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Only teams declared eligible or shortlisted for the applicable paid event or round may participate.",
          "Unless stated otherwise, only the team leader must make one payment on behalf of the entire team.",
          "Teams must verify their event name, team name, members and eligibility before paying.",
          "Multiple payments will not create additional entries, rankings or benefits.",
          "Payment grants access only to the applicable event or round. It does not guarantee a certificate, ranking, prize, internship, qualification or any other result.",
          "Any division or collection of the fee between team members is the team’s responsibility. We Code Coders will not resolve internal payment disputes.",
        ],
      },
    ],
  },
  {
    code: "02",
    title: "Non-Refundable Participation Fee",
    blocks: [
      {
        kind: "p",
        text: "Once payment has been successfully completed and participation access has been provided, the fee is final and non-refundable.",
      },
      {
        kind: "bullets",
        title: "No refund will be issued because:",
        items: [
          "The team or any member changes their mind.",
          "The team withdraws before or during the event.",
          "A member becomes unavailable or leaves the team.",
          "The team experiences an internal disagreement.",
          "The participant is dissatisfied with the event, judging, ranking or result.",
          "The participant did not read or misunderstood the rules.",
          "The team misses a deadline or fails to make a valid submission.",
          "The team is disqualified for violating any rule.",
          "The participant experiences personal internet, electricity, device, software, travel or scheduling problems.",
          "The participant expected a benefit that was not expressly promised on the official event page.",
          "The organiser makes a reasonable operational change that does not remove the essential opportunity to participate.",
        ],
      },
      {
        kind: "bullets",
        title: "A refund will be considered only if:",
        items: [
          "We Code Coders cancels the paid event or round without providing an equivalent alternative.",
          "The same payment is demonstrably charged more than once.",
          "A payment is debited but recorded as failed and requires reversal through the payment provider.",
        ],
      },
      {
        kind: "p",
        text: "Participants must not initiate false chargebacks, provide misleading information, threaten organisers, harass volunteers or use abusive or coercive conduct to demand a refund. Genuine payment errors must be reported through the official support channel.",
      },
      {
        kind: "p",
        text: "Fraudulent disputes or knowingly false chargebacks may lead to disqualification, exclusion from future events and submission of relevant records to the payment provider or appropriate authority.",
      },
    ],
  },
  {
    code: "03",
    title: "Participation and Submission Rules",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Every team must follow the official problem statement, round instructions and submission requirements.",
          "All required forms, files, repositories, links and demonstrations must be submitted before the announced deadline.",
          "Inaccessible links, missing permissions, corrupted files, incomplete forms and late submissions may be rejected.",
          "Participants are responsible for keeping proof of payment and submission.",
          "Submitted work must be original and must comply with the announced rules concerning prior work, AI tools, open-source components and third-party resources.",
          "Plagiarism, copied projects, fake evidence, manipulated timestamps, impersonation, fabricated information or misleading claims may result in immediate disqualification without refund.",
          "Payment does not excuse a participant from any eligibility, conduct or submission requirement.",
        ],
      },
    ],
  },
  {
    code: "04",
    title: "Rankings, Results and Feedback",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Official numerical rankings will be awarded and announced only for the top three eligible teams unless additional positions are expressly announced.",
          "Teams outside the top three will not receive an official numerical rank.",
          "Individual scores, judging sheets, internal notes, comparative rankings and detailed scoring breakdowns will not be provided.",
          "Participants cannot demand personal feedback, re-evaluation, another presentation opportunity or comparison with another team.",
          "Participants cannot demand a winning team’s project, code, repository, submission, presentation or demonstration material. It is shared only with that team’s consent, and We Code Coders will not release it on request.",
          "The personal details of winners are not published or passed on. The announcement carries the team name only.",
          "Judges may consider the announced criteria together with originality, completion, eligibility, rule compliance and verification of claims.",
          "The judges’ decision is final, except where the organisers identify a clear administrative error, conflict of interest, plagiarism, fraud or rule violation.",
          "Payment does not influence judging and does not create a right to qualify or win.",
        ],
      },
    ],
  },
  {
    code: "05",
    title: "Certificate Policy",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Certificates are issued separately for completed rounds and are subject to all eligibility requirements.",
          "Participants who made a valid Round 2 submission may receive a Round 2 Completion Certificate even if they later withdraw from Round 3.",
          "Qualification for Round 3 alone does not create eligibility for a Final Round or Finalist Completion Certificate.",
          "A Round 3 or Finalist Completion Certificate requires successful registration, payment and a valid final-round submission.",
          "A team that pays but withdraws or fails to submit will not receive a Round 3 Completion Certificate.",
          "Withdrawal from Round 3 does not cancel a Round 2 certificate already earned through valid participation.",
          "Winner certificates will be issued only to the officially announced winning teams.",
          "Certificates may be withheld for invalid submissions, false information, plagiarism, misconduct, disqualification or failure to complete mandatory requirements.",
        ],
      },
    ],
  },
  {
    code: "06",
    title: "Rewards and Opportunities",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Rewards are subject to eligibility verification, sponsor approval and compliance with all event rules.",
          "Internships, interviews, incubation, credits, subscriptions, merchandise and similar benefits are governed by the conditions announced for the event.",
          "Non-cash rewards cannot ordinarily be exchanged for money.",
          "Winners may be required to provide identity, project, eligibility or payment verification before receiving rewards.",
          "Failure to provide verification within the stated period may result in forfeiture of the applicable reward.",
          "We Code Coders will coordinate sponsored benefits but is not responsible for reasonable delays caused by sponsors, couriers, payment providers or external platforms.",
        ],
      },
    ],
  },
  {
    code: "07",
    title: "Schedule and Operational Changes",
    blocks: [
      {
        kind: "clauses",
        items: [
          "We Code Coders may reasonably change schedules, round structures, submission methods, judging arrangements, communication channels or event tools when operationally necessary.",
          "Where a communication channel, group or event tool is changed, the new link is sent by email to every registered participant at the address given during registration, and joining it is the participant’s own responsibility.",
          "Missing an announcement because a new channel was not joined, or because the registered email address is wrong or unmonitored, is not a ground for an extension, a re-evaluation or a refund.",
          "Reasonable changes will not automatically create a right to a refund.",
          "Material changes will be announced through an official event channel.",
          "The organisers may extend a deadline, reopen submissions or provide an alternative method when a widespread organiser-controlled platform failure occurs.",
          "Participants cannot demand an extension for individual internet, device, electricity, software or availability problems.",
          "Participants are responsible for monitoring official announcements and maintaining correct contact information.",
        ],
      },
    ],
  },
  {
    code: "08",
    title: "Conduct and Communication",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Participants must communicate respectfully with organisers, judges, volunteers, sponsors and other participants.",
          "A participation fee covers the cost of running the event. It does not buy the organisers, their time or their attention, and it does not entitle anyone to priority treatment, instant replies or special consideration.",
          "Allow 24 hours for a reply to a genuine query raised through the official support channel. Repeated messages, tagging, calling or escalating inside that window will not produce a faster answer.",
          "Threats, harassment, abusive language, discrimination, spam, impersonation, deliberate disruption or disclosure of another person’s private information may result in removal or disqualification without refund.",
          "Participants must not ask an organiser, judge or volunteer to break a rule, waive a requirement, extend a deadline outside the published process or make an exception in their favour. A question may be asked once; a decision, once given, is not reopened by repeating the request.",
          "Pressure, force, coercion, intimidation or threats directed at an organiser, judge, volunteer or sponsor disqualify the entire team, not only the individual responsible. Where an organiser, judge or volunteer reports feeling threatened, the team is removed from the event without refund.",
          "Genuine questions and complaints must be submitted through the official support channel.",
          "Messages sent to personal accounts, unrelated groups or unofficial contacts may not be treated as formal complaints.",
          "Participants must not publish knowingly false statements or manipulated evidence concerning the event, organisers, judges or sponsors.",
          "Nothing prevents a participant from raising an honest complaint, reporting misconduct or exercising a lawful right.",
        ],
      },
    ],
  },
  {
    code: "09",
    title: "Intellectual Property and Publicity",
    blocks: [
      {
        kind: "clauses",
        items: [
          "Teams retain ownership of their original projects unless separate written terms state otherwise.",
          "Participants permit We Code Coders to display their team name, participant names, project title, project description, screenshots, demo material and results for event administration and promotion.",
          "Private repositories or confidential source code will not be publicly shared without permission, although private access may be required for judging and verification.",
          "Teams must possess the necessary rights to all code, designs, datasets, media, trademarks and other materials used in their submissions.",
        ],
      },
    ],
  },
  {
    code: "10",
    title: "Data and Privacy",
    blocks: [
      {
        kind: "p",
        text: "Participant information may be processed for registration, payment verification, communication, judging, certificates, rewards, fraud prevention and event administration. Relevant information may be shared with judges, sponsors, payment providers or service partners only where reasonably necessary for these purposes.",
      },
    ],
  },
];

const ACCEPTANCE: string[] = [
  "All submitted information is accurate.",
  "The payment is being made for the stated team.",
  "Every team member has been informed of these Terms.",
  "The team leader is authorised to act as the primary representative of the team.",
  "The team accepts the refund, certificate, judging, conduct and submission policies stated above.",
  "The team agrees to follow the event information and instructions published on this page and through official event channels.",
];

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "p") {
          return (
            <p
              key={i}
              data-reveal
              style={{ ...TYPE.body, margin: i === 0 ? 0 : "1.1em 0 0", maxWidth: "68ch" }}
            >
              {block.text}
            </p>
          );
        }

        if (block.kind === "clauses") {
          return (
            <ol
              key={i}
              data-reveal
              style={{
                listStyle: "none",
                margin: i === 0 ? 0 : "1.4rem 0 0",
                padding: 0,
                counterReset: "clause",
              }}
            >
              {block.items.map((item, n) => (
                <li
                  key={item}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.4em minmax(0, 1fr)",
                    gap: "0.4em",
                    padding: "0.75em 0",
                    borderTop: n === 0 ? "none" : "1px solid var(--color-paper-2)",
                  }}
                >
                  <span style={{ ...TYPE.mono, color: "var(--color-ink-40)", paddingTop: "0.3em" }}>
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <span style={{ ...TYPE.body, maxWidth: "64ch" }}>{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <div key={i} data-reveal style={{ margin: "1.6rem 0 0" }}>
            {block.title && (
              <h3 style={{ ...TYPE.mono, margin: 0, color: "var(--color-signal)" }}>
                {block.title}
              </h3>
            )}
            <ul style={{ listStyle: "none", margin: "0.9rem 0 0", padding: 0 }}>
              {block.items.map((item) => (
                <li
                  key={item}
                  style={{
                    ...TYPE.body,
                    display: "grid",
                    gridTemplateColumns: "1.1em minmax(0, 1fr)",
                    gap: "0.5em",
                    marginTop: "0.5em",
                    maxWidth: "66ch",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--color-ink-40)" }}>
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export default function TermsPage() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <header
        style={{
          ...SHELL,
          padding: "clamp(8rem, 20vh, 13rem) clamp(1.25rem, 2vw, 2rem) 0",
        }}
      >
        <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-ink-40)" }}>
          [ Terms ] // All events
        </p>
        <h1
          style={{
            margin: "0.3em 0 0",
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(2.4rem, 7vw, 5.4rem)",
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
            maxWidth: "20ch",
          }}
        >
          Paid event{" "}
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "var(--color-signal)" }}>
            participation
          </span>
        </h1>
        <p style={{ ...TYPE.lead, margin: "1.4rem 0 0", maxWidth: "52ch" }}>
          Participation notice, rules and terms. They are the same for every We Code Coders
          event, and they apply to any paid event or paid round.
        </p>

        <div
          style={{
            marginTop: "clamp(2rem, 5vh, 3rem)",
            padding: "clamp(1.1rem, 2.5vw, 1.6rem)",
            border: "1px solid var(--color-signal)",
            maxWidth: "68ch",
          }}
        >
          <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-signal)" }}>
            [ Important ] // Read before making payment
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Blocks blocks={INTRO} />
          </div>
        </div>
      </header>

      {SECTIONS.map((section) => (
        <section
          key={section.code}
          style={{ ...SHELL, paddingTop: "clamp(3rem, 8vh, 5rem)" }}
        >
          <header style={{ marginBottom: "clamp(1.2rem, 3vh, 1.8rem)" }}>
            <p
              style={{
                ...TYPE.mono,
                margin: 0,
                color: "var(--color-ink-40)",
                paddingBottom: "0.9rem",
                borderBottom: "1px solid var(--color-ink-40)",
              }}
            >
              [ {section.code} ] // {section.title}
            </p>
          </header>
          <Blocks blocks={section.blocks} />
        </section>
      ))}

      <section style={{ ...SHELL, paddingTop: "clamp(3.5rem, 9vh, 5.5rem)" }}>
        <header style={{ marginBottom: "clamp(1.2rem, 3vh, 1.8rem)" }}>
          <p
            style={{
              ...TYPE.mono,
              margin: 0,
              color: "var(--color-signal)",
              paddingBottom: "0.9rem",
              borderBottom: "1px solid var(--color-signal)",
            }}
          >
            [ Final ] // Acceptance
          </p>
        </header>
        <p style={{ ...TYPE.body, margin: 0, maxWidth: "68ch" }}>
          By clicking the payment or registration button and completing payment, the team leader
          confirms that:
        </p>
        <Blocks blocks={[{ kind: "bullets", items: ACCEPTANCE }]} />
      </section>

      <section style={{ ...SHELL, paddingTop: "clamp(3rem, 8vh, 4.5rem)" }}>
        <TransitionLink
          href="/events"
          label="Events"
          className="back-link"
          style={{
            ...TYPE.mono,
            color: "var(--color-ink)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6em",
            borderBottom: "1px solid currentColor",
            paddingBottom: "0.3em",
            minHeight: 44,
          }}
        >
          Back to the events
          <Arrow style={{ width: 15, height: 15 }} />
        </TransitionLink>
      </section>
    </main>
  );
}
