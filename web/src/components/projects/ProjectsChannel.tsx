import { Pin } from "lucide-react";

import { DialogScreen } from "@/components/dialog/DialogScreen";
import { Thread } from "@/components/dialog/Thread";
import { ChannelPost } from "@/components/tg/ChannelPost";
import { DIALOGS } from "@/content/dialogs";
import { ARCHIVE_SLUG, PROJECTS, projectBySlug, RANKS, TIMELINE, type Rank } from "@/content/projects";

import { Ecosystem } from "./Ecosystem";
import { EraMarker } from "./EraMarker";
import { ProjectPost } from "./ProjectPost";
import styles from "./ProjectsChannel.module.css";
import { RankFilter } from "./RankFilter";

export function ProjectsChannel() {
  const dialog = DIALOGS.projects;
  const ranked = PROJECTS.filter((project) => project.rank !== null);
  const counts = Object.fromEntries(
    RANKS.map((rank) => [rank, ranked.filter((project) => project.rank === rank).length]),
  ) as Record<Rank, number>;

  return (
    <DialogScreen dialog={dialog} subtitle={`канал · ${ranked.length} проектов под наблюдением CCG`}>
      <a href="#ecosystem" className={styles.pinned}>
        <Pin size={16} aria-hidden="true" className={styles.pinIcon} />
        <span>
          <span className={styles.pinnedTitle}>Закреплённое сообщение</span>
          <span className={styles.pinnedText}>Экосистема chestor.site: что из чего растёт</span>
        </span>
      </a>
      <Thread dialogId="projects" label="Канал «Проекты»" placeholder="Комментировать…">
        <RankFilter counts={counts}>
          <div data-extra>
            <ProjectPost project={projectBySlug(ARCHIVE_SLUG)} />
          </div>
          {TIMELINE.map((era) => (
            <div key={era.id} data-era className={styles.era}>
              <EraMarker era={era} />
              {era.projects.map((slug) => (
                <ProjectPost key={slug} project={projectBySlug(slug)} />
              ))}
            </div>
          ))}
          <div data-extra className={styles.era}>
            <ChannelPost id="ecosystem" channel="Проекты" glyph="projects" time="сен 2026">
              <h3 className={styles.ecoTitle}>Экосистема chestor.site</h3>
              <p>
                Всё крутится вокруг одного домена: фреймворк, бот, база вопросов и тестовый стенд. Этот сайт — тоже часть
                схемы: его чат работает на selfrotgram, а викторина — на ghoul-quiz-lib.
              </p>
              <Ecosystem />
            </ChannelPost>
          </div>
        </RankFilter>
      </Thread>
    </DialogScreen>
  );
}
