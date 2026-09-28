import { serializeLd } from "@/lib/structuredData";

// Данные статичные, из контента сайта, а не от пользователей; serializeLd экранирует «<».
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(data) }} />;
}
