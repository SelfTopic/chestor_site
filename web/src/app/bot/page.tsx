import type { Metadata } from "next";
import Link from "next/link";

import {
  BattleRules,
  BotHero,
  Commands,
  Demos,
  EconomyCards,
  Engineering,
  HungerMeter,
  KaguneCards,
} from "@/components/bot/BotSections";
import styles from "@/components/bot/Bot.module.css";
import { LifeCycle } from "@/components/bot/LifeCycle";
import landing from "@/components/landing/Landing.module.css";
import { LandingNav } from "@/components/landing/LandingNav";
import { Section } from "@/components/landing/Section";
import { BOT_REPO } from "@/content/bot";

export const metadata: Metadata = {
  title: "chestor_bot — досье CCG · CheStor",
  description:
    "RPG-бот в Telegram по «Токийскому гулю»: голод, кагуне, честный боевой движок, CheSton и RC-клетки. Версия 1.0.0.",
};

export default function BotPage() {
  return (
    <div className={landing.page}>
      <LandingNav back={{ href: "/c/chestor_bot", label: "К диалогу" }} />
      <main>
        <BotHero />
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
      </main>
      <footer className={landing.footer}>
        Исходники: <a href={BOT_REPO}>github.com/SelfTopic/chestor_bot</a> · фреймворк — <Link href="/selfrotgram">selfrotgram</Link>
      </footer>
    </div>
  );
}
