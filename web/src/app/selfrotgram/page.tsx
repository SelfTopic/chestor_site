import type { Metadata } from "next";
import Link from "next/link";

import landing from "@/components/landing/Landing.module.css";
import { LandingNav } from "@/components/landing/LandingNav";
import { Section } from "@/components/landing/Section";
import { EchoDemo } from "@/components/selfrot/EchoDemo";
import { Install } from "@/components/selfrot/Install";
import { Pairs } from "@/components/selfrot/Pairs";
import styles from "@/components/selfrot/Selfrot.module.css";
import { Terminal } from "@/components/selfrot/Terminal";
import { GUARANTEES, SR_FACTS, SR_FEATURES, SR_HERO, SR_LINKS, SR_MISSING } from "@/content/selfrotgram";

export const metadata: Metadata = {
  title: "selfrotgram — типы говорят правду",
  alternates: { canonical: "/selfrotgram" },
  description:
    "Асинхронная библиотека для Telegram Bot API на aiohttp и pydantic: фильтр гарантирует, тип обещает, библиотека сверяет при импорте.",
};

export default function SelfrotgramPage() {
  return (
    <div className={landing.page}>
      <LandingNav back={{ href: "/c/selfrotgram", label: "К каналу" }} />
      <main>
        <section className={styles.hero} aria-labelledby="sr-title">
          <div>
            <p className={styles.kicker}>{SR_HERO.kicker}</p>
            <h1 className={styles.title} id="sr-title">
              Типы <em>говорят правду</em>
            </h1>
            <p className={styles.lead}>{SR_HERO.lead}</p>
            <p className={styles.status}>{SR_HERO.status}</p>
            <div className={styles.ctas}>
              <a href={SR_LINKS.github} className={styles.primary}>
                GitHub
              </a>
              <a href={SR_LINKS.pypi} className={styles.secondary}>
                PyPI
              </a>
              <Link href="/bot" className={styles.secondary}>
                Кто на нём работает
              </Link>
            </div>
          </div>
          <EchoDemo />
        </section>

        <Section
          id="guarantee"
          kicker="01 · Что гарантирует фильтр"
          title="Обещание, проверка, сверка"
          lead="Нажми «Забыть HasText()» в примере выше: библиотека не даст запуститься боту, который врёт о своих типах."
        >
          <div className={styles.guarantees}>
            {GUARANTEES.map((item) => (
              <article key={item.title} className={styles.guarantee}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          id="aiogram"
          kicker="02 · Было / стало"
          title="Если ты писал на aiogram"
          lead="Главное отличие в подходе: aiogram опирается на функции и неявную передачу аргументов, selfrotgram — на классы и явный ctx."
        >
          <Pairs />
          <p className={styles.status}>
            Все пары и честный список отличий — в <a href={SR_LINKS.fromAiogram}>docs/from-aiogram.md</a>.
          </p>
        </Section>

        <Section
          id="cli"
          kicker="03 · CLI"
          title="selfrot tree и selfrot check"
          lead="tree рисует дерево роутеров и находит недостижимые хендлеры. check собирает все ошибки описания разом — для CI, с --strict."
        >
          <Terminal />
        </Section>

        <Section id="inside" kicker="04 · Внутри" title="Генерируется из спецификации">
          <dl className={styles.facts}>
            {SR_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.columns}>
            <div>
              <h3>Что есть</h3>
              <ul className={styles.list}>
                {SR_FEATURES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Чего пока нет</h3>
              <ul className={styles.list} data-kind="missing">
                {SR_MISSING.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          id="install"
          kicker="05 · Установка"
          title="Поставить и попробовать"
          lead="Ставится как selfrotgram, импортируется как selfrot. Зависимости совместимы с aiogram 3.x — переезжать можно постепенно."
        >
          <Install />
          <div className={styles.links}>
            <a href={SR_LINKS.examples} className={styles.secondary}>
              Путеводитель по примерам
            </a>
            <a href={SR_LINKS.showcase} className={styles.secondary}>
              selfrotgram_example_bot
            </a>
          </div>
        </Section>
      </main>
      <footer className={landing.footer}>
        MIT · <a href={SR_LINKS.github}>github.com/SelfTopic/selfrotgram</a> · вдохновлено aiogram (охват и структура) и grammY (эргономика контекста)
      </footer>
    </div>
  );
}
