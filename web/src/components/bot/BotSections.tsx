import Link from "next/link";

import { MessageBubble } from "@/components/tg/MessageBubble";
import wallpaper from "@/components/tg/Wallpaper.module.css";
import {
  BATTLE_RULES,
  BOT_ENGINEERING,
  BOT_FACTS,
  BOT_HERO,
  BOT_REPO,
  BOT_TELEGRAM,
  BOT_STACK,
  COMMANDS,
  DEMOS,
  DOSSIER_FIELDS,
  ECONOMY,
  HUNGER_NOTES,
  HUNGER_TIERS,
  KAGUNE,
  KAGUNE_LOTTERY,
  LEVEL_FORMULA,
} from "@/content/bot";

import styles from "./Bot.module.css";

export function BotHero() {
  return (
    <section className={styles.hero} aria-labelledby="bot-title">
      <div className={styles.file}>
        <div className={styles.fileTop}>
          <span>CCG · Бюро по борьбе с гулями</span>
          <span>{BOT_HERO.caseNo}</span>
        </div>
        <p className={styles.fileLabel}>Объект</p>
        <h1 className={styles.object} id="bot-title">
          {BOT_HERO.object}
        </h1>
        <p className={styles.lead}>{BOT_HERO.lead}</p>
        <dl className={styles.fields}>
          {DOSSIER_FIELDS.map((field) => (
            <div key={field.label}>
              <dt>{field.label}</dt>
              <dd>
                {field.href ? (
                  <a href={field.href} className={styles.fieldLink}>
                    {field.value}
                  </a>
                ) : (
                  field.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.status}>{BOT_HERO.status}</p>
        <div className={styles.actions}>
          <a href={BOT_TELEGRAM.href} className={styles.primary}>
            Открыть в Telegram
          </a>
          <a href={BOT_REPO} className={styles.secondary}>
            Исходники на GitHub
          </a>
          <Link href="/c/chestor_bot" className={styles.secondary}>
            Поговорить с ботом на сайте
          </Link>
        </div>
        <div className={styles.stamp} aria-label={`Ранг ${BOT_HERO.rank}: ${BOT_HERO.verdict}`}>
          <span className={styles.stampRank}>{BOT_HERO.rank}</span>
          <span className={styles.stampText}>{BOT_HERO.verdict}</span>
        </div>
      </div>
    </section>
  );
}

export function HungerMeter() {
  return (
    <div className={styles.hunger}>
      <div className={styles.meter} role="img" aria-label="Шкала голода из четырёх тиров">
        {HUNGER_TIERS.map((tier, index) => (
          <div key={tier.name} className={styles.tier} data-tier={index} style={{ flexGrow: tier.to - tier.from }}>
            <span className={styles.tierRange}>{tier.range}</span>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Тир</th>
            <th scope="col">Голод</th>
            <th scope="col">Ловкость, скорость, реген</th>
            <th scope="col">Сила и кагуне</th>
          </tr>
        </thead>
        <tbody>
          {HUNGER_TIERS.map((tier, index) => (
            <tr key={tier.name}>
              <th scope="row">
                <span className={styles.dot} data-tier={index} aria-hidden="true" />
                {tier.name}
              </th>
              <td>{tier.range}</td>
              <td className={styles.mult}>{tier.falling}</td>
              <td className={styles.mult}>{tier.rising}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={styles.notes}>
        {HUNGER_NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

export function KaguneCards() {
  return (
    <>
      <div className={styles.kagune}>
        {KAGUNE.map((type, index) => (
          <article key={type.name} className={styles.kaguneCard}>
            <KaguneGlyph index={index} />
            <h3 className={styles.cardTitle}>{type.name}</h3>
            <p className={styles.organ}>какухо: {type.organ}</p>
            <p>{type.style}</p>
            <p className={styles.stats}>{type.stats}</p>
          </article>
        ))}
      </div>
      <p className={styles.callout}>{KAGUNE_LOTTERY}</p>
    </>
  );
}

// Свои силуэты четырёх типов: крылья, щит, щупальца, хвост.
function KaguneGlyph({ index }: { index: number }) {
  const paths = [
    "M40 60c-6-14 4-30 22-38-8 12-8 22-2 30M40 60c6-14-4-30-22-38 8 12 8 22 2 30",
    "M22 24h36l-4 26c-3 10-9 16-14 18-5-2-11-8-14-18Z",
    "M40 64c-10-6-16-18-12-34M40 64c-2-14 4-28 16-36M40 64c8-8 20-10 28-4M40 64c-10 0-20-6-24-14",
    "M40 66c10-6 16-18 14-30-2-10-10-16-18-14 8 4 10 12 6 20-4 8-8 14-2 24Z",
  ];
  return (
    <svg viewBox="0 0 80 80" className={styles.kaguneGlyph} aria-hidden="true">
      <path d={paths[index]} />
    </svg>
  );
}

export function BattleRules() {
  return (
    <>
      <div className={styles.rules}>
        {BATTLE_RULES.map((rule, index) => (
          <article key={rule.title} className={styles.rule}>
            <span className={styles.ruleNo}>{String(index + 1).padStart(2, "0")}</span>
            <h3 className={styles.cardTitle}>{rule.title}</h3>
            <p>{rule.text}</p>
          </article>
        ))}
      </div>
      <div className={styles.formula}>
        <code>{LEVEL_FORMULA.formula}</code>
        <p>{LEVEL_FORMULA.text}</p>
      </div>
    </>
  );
}

export function EconomyCards() {
  return (
    <div className={styles.economy}>
      {ECONOMY.map((item) => (
        <article key={item.name} className={styles.coin}>
          <h3 className={styles.coinName}>{item.name}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function Commands() {
  return (
    <div className={styles.commands}>
      {COMMANDS.map((group) => (
        <section key={group.title} className={styles.commandGroup} aria-label={group.title}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <ul>
            {group.commands.map((item) => (
              <li key={item.command}>
                <code className={styles.command}>{item.command}</code>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function Demos() {
  return (
    <>
      <div className={styles.demos}>
        {DEMOS.map((demo) => (
          <figure key={demo.title} className={`${styles.demo} ${wallpaper.wallpaper}`}>
            <figcaption className={styles.demoTitle}>{demo.title}</figcaption>
            <div className={styles.demoChat}>
              {demo.lines.map((line, index) => (
                <MessageBubble key={index} direction={line.from === "user" ? "out" : "in"} author={line.from === "bot" ? "chestor_bot" : undefined}>
                  {line.text}
                </MessageBubble>
              ))}
            </div>
          </figure>
        ))}
      </div>
      <p className={styles.footnote}>Реплики — дословно из текстов бота, числа в них условные.</p>
    </>
  );
}

export function Engineering() {
  return (
    <div className={styles.engineering}>
      <dl className={styles.facts}>
        {BOT_FACTS.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.notes}>
        {BOT_ENGINEERING.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className={styles.stack}>
        {BOT_STACK.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
    </div>
  );
}
