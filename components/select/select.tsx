'use client';

import { Select as BaseSelect } from '@base-ui/react/select';

import { Icon } from '@/components/icon/icon';

type Option = { value: string; label: string };

/** Publishes a chosen value. Base UI sends null when the selection is cleared. */
export function publishSelectedValue(
  value: unknown,
  onValueChange?: (value: string) => void,
) {
  if (typeof value === 'string') onValueChange?.(value);
}

type Props = {
  label: string;
  name: string;
  defaultValue: string;
  options: Option[];
  placeholder?: string;
  /** Called with the chosen value, for choices that apply at once. */
  onValueChange?: (value: string) => void;
};

/** Single-choice field that submits its value with the surrounding form. */
export function SelectField({
  label,
  name,
  defaultValue,
  options,
  placeholder = 'Selecione',
  onValueChange,
}: Props) {
  return (
    <BaseSelect.Root
      name={name}
      defaultValue={defaultValue}
      items={options}
      onValueChange={(value) => {
        publishSelectedValue(value, onValueChange);
      }}
    >
      <BaseSelect.Label className="text-field-label">{label}</BaseSelect.Label>
      <BaseSelect.Trigger className="select-trigger">
        <BaseSelect.Value placeholder={placeholder} />
        <Icon name="chevron" className="select-chevron" />
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="select-positioner" sideOffset={4}>
          <BaseSelect.Popup className="select-popup">
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="select-item"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
