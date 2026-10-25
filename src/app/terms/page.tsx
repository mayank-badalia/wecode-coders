import type { Metadata } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";

export const metadata: Metadata = {
  title: "Event participation — terms — We Code Coders",
  description:
    "The notice, rules and terms that apply to every We Code Coders event. A three-round event charges ₹399 per team, once, and only at Round 3; a single-round event is free from start to finish. Eligibility, payment, submissions, rankings, certificates, rewards and conduct.",
};

/*
  One terms page for every event.

  It is deliberately not thirteen copies in `src/data/events.ts`. The promise
  made to a team paying for Round 3 of CodeAxis has to be the same promise
  made to a team paying for Round 3 of CodeStar 30, and the only way that
  stays true while one of them is edited is for there to be a single copy to
  edit.

  Not every event charges, and which ones do follows the shape rather than
  the name: three rounds means one fee, at Round 3; a single round means no
  fee at all. Sections 01 and 02 are the fee sections, so the intro states
  both halves of that rule and says which of them is the reader’s, rather
  than leaving them to work out which clauses are theirs. Every event links
  here from its own page, and the footer carries it on every route.

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
    text: "These Terms apply to every We Code Coders event. The event name, participation fee where there is one, eligibility requirements, format, schedule, deadlines, rewards and submission instructions published on that event’s own page form part of these Terms.",
  },
  {
    kind: "p",
    text: "What an event costs follows its shape, and there are only two shapes. A three-round event charges a participation fee of ₹399 per team — one payment for the whole team, not one each — and it falls due only if the team is selected for Round 3. Registering and Rounds 1 and 2 are free, and a team that is not selected for Round 3 pays nothing. A single-round event, meaning one window and one submission, whether that window runs 36 hours, 48 hours or the quiz’s eight, is free from start to finish: nothing to enter, nothing to be judged, nothing to be certified.",
  },
  {
    kind: "p",
    text: "Sections 01 and 02 below are the fee sections. They apply to a three-round event, and only from the point a team is selected for Round 3. They do not apply to a single-round event at all, and everything that follows them applies to every event, free or paid. Which shape an event is, and what it charges, is stated on that event’s own page before anyone registers.",
  },
  {
    kind: "p",
    text: "By entering, the team leader confirms that they and every listed team member have read, understood and accepted these Terms. Where there is a fee, completing the payment confirms it again.",
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
          "Only one kind of event here charges anything. A three-round event takes a participation fee of ₹399 per team, due once and only from a team selected for Round 3; registering and Rounds 1 and 2 are free. A single-round event charges nothing at any stage, for entry, judging or a certificate. This section and section 02 apply only to the first, and only from selection for Round 3 onwards.",
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
          "Every team must follow the official problem statement, the round or window instructions and the submission requirements for the event it entered.",
          "All required forms, files, repositories, links and demonstrations must be submitted before the announced deadline.",
          "Where an event takes a submission from every participant, as stated on that event’s own page, each member must file their own entry for the team’s project, naming the role they held and the part they built. A member who files no entry is not recorded as having taken part in that round or window, even where the project was submitted by somebody else.",
          "Inaccessible links, missing permissions, corrupted files, incomplete forms and late submissions may be rejected.",
          "Participants are responsible for keeping proof of their submission, and of the Round 3 payment where one was made.",
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
          "Where an event runs qualifying rounds, Round 1 and Round 2 outcomes are sent by email to every team that made a valid submission for that round, whether or not the team has been selected for the next round, at the address given at registration. Teams that qualify receive the instructions for the next round in the same email.",
          "Where an event runs as a single round — one window of 36 or 48 hours, or the quiz’s sitting — there are no qualifying rounds and nothing to clear beforehand. The one submission made inside the window is what is judged, its outcome is the final outcome, and no fee is charged at any point.",
          "Results are announced in the official event group. That announcement carries the winning team names together with a link to the project each of them built. No participant’s personal details, and no further material from a team’s submission, are published or passed on unless that participant or team has given consent.",
          "Only the top three are placed. The announcement carries those three team names with a link to what each of them built, and nothing further: no ranking list or leaderboard is published, no other team is told its position, and a placing is not disclosed on request.",
          "By entering, a team accepts that if it finishes in the top three its team name and a link to its submitted project may be published with the results — the GitHub repository for a hackathon judged on its code, or the live project URL where the event calls for a deployed product.",
          "Individual scores, judging sheets, internal notes, comparative rankings and detailed scoring breakdowns will not be provided, and participants cannot demand personal feedback, re-evaluation, another presentation opportunity or comparison with another team.",
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
          "Which certificates an event issues is listed in the certificates block on that event’s own page, and that list governs.",
          "Where an event takes a submission from every participant, a certificate is issued against that participant’s own valid entry. The role and the contribution printed on a certificate are the ones its holder declared in that entry, and a participant who filed none is not issued one.",
          "A single-round event issues a certificate to every participant who files a valid entry inside the window. Placing is not required, and there is nothing to pay for it — these events charge no fee at any stage, a certificate included. Registering without submitting, or making a submission that is not valid, earns none.",
          "Several events issue a certificate only for the final round. Where the event page states this, Rounds 1 and 2 are qualifying rounds and carry no certificate of any kind, including for participation, and a team that is not selected for Round 3 is not issued one.",
          "Where an event does issue round-completion certificates, a participant who made a valid Round 2 submission may receive the Round 2 Completion Certificate even if they later withdraw from Round 3, and that withdrawal does not cancel it.",
          "Qualification for Round 3 alone does not create eligibility for a Final Round or Finalist Completion Certificate.",
          "A Round 3 or Finalist Completion Certificate requires successful registration, payment and a valid final-round submission.",
          "A team that pays but withdraws or fails to submit will not receive a Round 3 Completion Certificate.",
          "Only the certificates of the three announced winning teams name a rank. No other certificate carries a position of any kind.",
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
          "A prize pool is a stated total value, not a promise of cash. A pool may be awarded as cash, as AI or platform credits, or as other non-cash rewards, and it may consist of any one of those or of a combination of them — nothing requires a pool to be part cash and part credits, and nothing requires it to include cash at all.",
          "Where an event page states a cash prize, that amount is cash. Where it states a prize pool, or an amount “in prizes”, what the pool is made up of is announced on that event’s own page or with its results, and that announcement governs.",
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
          "Where there is a participation fee, it covers the cost of running the event. It does not buy the organisers, their time or their attention, and it does not entitle anyone to priority treatment, instant replies or special consideration.",
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
  "The entry, and any payment made for it, is for the stated team.",
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
          Event{" "}
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "var(--color-signal)" }}>
            participation
          </span>
        </h1>
        <p style={{ ...TYPE.lead, margin: "1.4rem 0 0", maxWidth: "52ch" }}>
          Participation notice, rules and terms. The same for every We Code Coders event:
          three rounds means ₹399 per team at Round 3, a single round means no fee at all,
          and the fee sections apply only to the first.
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
            [ Important ] // What applies to you, and what it costs
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
          By registering — and, where the event charges a fee, by completing that payment —
          the team leader confirms that:
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
