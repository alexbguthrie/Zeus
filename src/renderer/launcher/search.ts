import { applications, type SampleApplication } from '../applications/registry';
import { launcherTools, type LauncherTool } from '../tools/registry';
import { launcherSections, type LauncherSection } from './sections';

export type SearchResult = {
  id: string;
  title: string;
  application?: SampleApplication;
  tool?: LauncherTool;
  section?: LauncherSection;
  sample?: string;
};

export function findResults(query: string, active: LauncherSection | null): SearchResult[] {
  const search = query.trim().toLowerCase();
  const appResults: SearchResult[] =
    active?.id === 'apps' || (!active && search)
      ? applications
          .filter((application) =>
            `${application.title} ${application.description} ${application.keywords}`
              .toLowerCase()
              .includes(search),
          )
          .map((application) => ({
            id: `app-${application.id}`,
            title: application.title,
            application,
          }))
      : [];
  const toolResults: SearchResult[] =
    active?.id === 'tools' || (!active && search)
      ? launcherTools
          .filter((tool) =>
            `${tool.title} ${tool.description} ${tool.keywords}`.toLowerCase().includes(search),
          )
          .map((tool) => ({ id: `tool-${tool.id}`, title: tool.title, tool }))
      : [];
  if (active?.id === 'apps') return appResults;
  if (active?.id === 'tools') return toolResults;
  if (active)
    return active.items
      .filter((item) => item.toLowerCase().includes(search))
      .map((sample, index) => ({ id: `sample-${active.id}-${index}`, title: sample, sample }));
  if (!search) return [];
  return [
    ...appResults,
    ...toolResults,
    ...launcherSections
      .filter((section) =>
        `${section.title} ${section.items.join(' ')}`.toLowerCase().includes(search),
      )
      .map((section) => ({ id: `section-${section.id}`, title: section.title, section })),
  ];
}
