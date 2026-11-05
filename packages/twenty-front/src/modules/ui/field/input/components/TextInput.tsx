import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledTextInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  width: 100%;

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

export type TextInputProps = {
  instanceId: string;
  placeholder?: string;
  autoFocus?: boolean;
  selectOnFocus?: boolean;
  value: string;
  onEnter?: (newText: string) => void;
  onEscape?: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside?: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  onChange?: (newText: string) => void;
  copyButton?: boolean;
  shouldTrim?: boolean;
  disabled?: boolean;
  className?: string;
};

const getValue = (value: string, shouldTrim: boolean) => {
  if (shouldTrim) {
    return value.trim();
  }

  return value;
};

export const TextInput = ({
  instanceId,
  placeholder,
  autoFocus,
  selectOnFocus = false,
  value,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
  copyButton = true,
  shouldTrim = true,
  disabled,
  className,
}: TextInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef<HTMLInputElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Keep the raw text while typing so spaces between words survive; trimming only applies on submit
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };
  useEffect(() => {
    setInternalText(value);
  }, [value]);

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    copyRef: copyRef,
    inputValue: internalText,
    onEnter: onEnter && ((text: string) => onEnter(getValue(text, shouldTrim))),
    onEscape:
      onEscape && ((text: string) => onEscape(getValue(text, shouldTrim))),
    onClickOutside:
      onClickOutside &&
      ((event: MouseEvent | TouchEvent, text: string) =>
        onClickOutside(event, getValue(text, shouldTrim))),
    onTab: onTab && ((text: string) => onTab(getValue(text, shouldTrim))),
    onShiftTab:
      onShiftTab && ((text: string) => onShiftTab(getValue(text, shouldTrim))),
  });

  return (
    <>
      <StyledTextInput
        id={instanceId}
        autoComplete="off"
        ref={wrapperRef}
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        onFocus={
          selectOnFocus ? (event) => event.currentTarget.select() : undefined
        }
        value={internalText}
        disabled={disabled}
        className={className}
      />
      {copyButton && (
        <div ref={copyRef}>
          <LightCopyIconButton copyText={internalText} />
        </div>
      )}
    </>
  );
};
