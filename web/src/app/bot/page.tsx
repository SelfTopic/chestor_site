import type { Metadata } from "next";
import Link from "next/link";

import {
  BattleRules,
  BotHero,
  Commands,
  Demos,
  EconomyCards,
  Engineering,
  Faq,
  HungerMeter,
  KaguneCards,
  PlaySteps,
} from "@/components/bot/BotSections";
import styles from "@/components/bot/Bot.module.css";
import { LifeCycle } from "@/components/bot/LifeCycle";
import landing from "@/components/landing/Landing.module.css";
import { LandingNav } from "@/components/landing/LandingNav";
import { Section } from "@/components/landing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { BOT_REPO } from "@/content/bot";
import { botFaqLd, botGameLd } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: { absolute: "chestor_bot — RPG по «Токийскому гулю» в Telegram" },
  alternates: { canonical: "/bot" },
  description:
    "Текстовая RPG по «Токийскому гулю» в Telegram: стань гулем, выбери кагуне, дерись в дуэлях и с мобами, копи CheSton и RC-клетки. Играть: @chestor_chat_bot.",
};

export default function BotPage() {
  return (
    <div className={landing.page}>
      <LandingNav back={{ href: "/c/chestor_bot", label: "К диалогу" }} />
      <main>
        <BotHero />
        <Section
          id="play"
          kicker="00 · Как начать"
          title="Как поиграть в «Токийского гуля» в Telegram"
          lead="Ничего устанавливать не нужно: игра целиком живёт в Telegram."
        >
          <PlaySteps />
        </Section>
        <Section
          id="cycle"
          kicker="01 · Жизненный цикл"
          title="Голод → смерть → регенерация → прокачка → бои"
          lead="В 1.0.0 круг замкнулся: каждая механика толкает к следующей, а смерть — не конец, а перезапуск генетической лотереи."
        >
          <div className={styles.cycle}>
            <LifeCycle />
            <HungerMeter />
          </div>
        </Section>
        <Section id="kagune" kicker="02 · Кагуне" title="Четыре типа, одна лотерея" lead="Какухо — орган, управляющий RC-клетками. Где он — такой и стиль боя.">
          <KaguneCards />
        </Section>
        <Section id="battle" kicker="03 · Бои" title="Движок, который не врёт" lead="Бой симулируется по раундам, а не решается одной формулой: лог событий потом можно отрисовать хоть текстом, хоть анимацией.">
          <BattleRules />
        </Section>
        <Section id="economy" kicker="04 · Экономика" title="CheSton и RC-клетки">
          <EconomyCards />
        </Section>
        <Section id="commands" kicker="05 · Команды" title="Как с ним разговаривать" lead="Большинство команд — обычные слова без слеша: в чате это читается как речь, а не как терминал.">
          <Commands />
        </Section>
        <Section id="demo" kicker="06 · Переписка" title="Как это выглядит в Telegram">
          <Demos />
        </Section>
        <Section id="engineering" kicker="07 · Под капотом" title="Цифры и стек">
          <Engineering />
        </Section>
        <Section id="faq" kicker="08 · Вопросы" title="Частые вопросы">
          <Faq />
        </Section>
      </main>
      <JsonLd data={botGameLd()} />
      <JsonLd data={botFaqLd()} />
      <footer className={landing.footer}>
        Исходники: <a href={BOT_REPO}>github.com/SelfTopic/chestor_bot</a> · фреймворк — <Link href="/selfrotgram">selfrotgram</Link>
      </footer>
    </div>
  );
}
