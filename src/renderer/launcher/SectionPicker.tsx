import { useEffect, useRef } from 'react';
import { launcherSections } from './sections';
import SectionIcon from './SectionIcon';
import type { LauncherController } from './useLauncher';

type Props = Pick<
  LauncherController,
  | 'pickerShown'
  | 'pickerOpen'
  | 'expanded'
  | 'layoutReady'
  | 'selected'
  | 'setSelected'
  | 'openSection'
  | 'onPickerKeyDown'
>;

export default function SectionPicker({
  pickerShown,
  pickerOpen,
  expanded,
  layoutReady,
  selected,
  setSelected,
  openSection,
  onPickerKeyDown,
}: Props) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (expanded && pickerShown && layoutReady) buttons.current[selected]?.focus();
  }, [expanded, selected, pickerShown, layoutReady]);

  return (
    <nav
      className="orbit"
      data-open={pickerShown}
      inert={!pickerShown}
      aria-hidden={!pickerOpen}
      aria-label="Launcher sections"
      onKeyDown={onPickerKeyDown}
    >
      {launcherSections.map((section, index) => (
        <button
          key={section.id}
          className="section-button"
          ref={(element) => {
            buttons.current[index] = element;
          }}
          tabIndex={index === selected ? 0 : -1}
          onFocus={() => setSelected(index)}
          onClick={() => openSection(section)}
          aria-label={`${section.title}, Command ${index + 1}`}
        >
          <span className="section-circle">
            <SectionIcon id={section.id} />
          </span>
          <span className="section-meta">
            <span className="section-name">{section.title}</span>
            <kbd>⌘{index + 1}</kbd>
          </span>
        </button>
      ))}
    </nav>
  );
}
